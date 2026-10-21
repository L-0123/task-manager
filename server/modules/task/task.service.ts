import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import type {
  Task,
  TaskListResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskPriority,
} from '@shared/api.interface';

const PRIORITY_MAP: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const PRIORITY_REVERSE: Record<string, TaskPriority> = {
  高: 'high',
  中: 'medium',
  低: 'low',
};

interface SupabaseTask {
  id: number;
  title: string;
  priority: string;
  completed: boolean;
  created_at: string;
}

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.client;
  }

  private mapRow(row: SupabaseTask): Task {
    return {
      id: String(row.id),
      title: row.title,
      priority: PRIORITY_REVERSE[row.priority] ?? 'medium',
      completed: row.completed,
      createdAt: row.created_at,
    };
  }

  async list(priority?: TaskPriority): Promise<TaskListResponse> {
    let query = this.client
      .from('tasks')
      .select('id, title, priority, completed, created_at')
      .order('created_at', { ascending: false });

    if (priority) {
      query = query.eq('priority', PRIORITY_MAP[priority]);
    }

    const { data, error } = await query;
    if (error) {
      const errInfo = JSON.stringify({ message: error.message, code: error.code, details: error.details, hint: error.hint });
      this.logger.error(`查询任务列表失败: ${errInfo}`);
      throw error;
    }

    const rows = (data as SupabaseTask[]) || [];
    return { items: rows.map((row) => this.mapRow(row)) };
  }

  async create(dto: CreateTaskRequest): Promise<Task> {
    const { data, error } = await this.client
      .from('tasks')
      .insert({
        title: dto.title,
        priority: PRIORITY_MAP[dto.priority],
        completed: false,
      })
      .select()
      .single();

    if (error) {
      const errInfo = JSON.stringify({ message: error.message, code: error.code, details: error.details, hint: error.hint });
      this.logger.error(`创建任务失败: ${errInfo}`);
      throw error;
    }

    return this.mapRow(data as SupabaseTask);
  }

  async update(id: string, dto: UpdateTaskRequest): Promise<Task> {
    const patch: Record<string, unknown> = {};
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.priority !== undefined) patch.priority = PRIORITY_MAP[dto.priority];
    if (dto.completed !== undefined) patch.completed = dto.completed;

    if (Object.keys(patch).length === 0) {
      const { data, error } = await this.client
        .from('tasks')
        .select()
        .eq('id', Number(id))
        .single();
      if (error || !data) throw new NotFoundException('任务不存在');
      return this.mapRow(data as SupabaseTask);
    }

    const { data, error } = await this.client
      .from('tasks')
      .update(patch)
      .eq('id', Number(id))
      .select()
      .single();

    if (error) {
      const errInfo = JSON.stringify({ message: error.message, code: error.code, details: error.details, hint: error.hint });
      this.logger.error(`更新任务失败: ${errInfo}`);
      if (error.code === 'PGRST116') throw new NotFoundException('任务不存在');
      throw error;
    }

    return this.mapRow(data as SupabaseTask);
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const { data, error } = await this.client
      .from('tasks')
      .delete()
      .eq('id', Number(id))
      .select('id');

    if (error) {
      const errInfo = JSON.stringify({ message: error.message, code: error.code, details: error.details, hint: error.hint });
      this.logger.error(`删除任务失败: ${errInfo}`);
      if (error.code === 'PGRST116') throw new NotFoundException('任务不存在');
      throw error;
    }

    if (!data || data.length === 0) throw new NotFoundException('任务不存在');
    return { success: true };
  }
}
