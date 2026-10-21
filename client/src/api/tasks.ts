import { supabase } from '@client/src/lib/supabase';
import type {
  Task,
  TaskListResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskPriority,
} from '@shared/api.interface';

const priorityToCn: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const priorityFromCn = (cn: string): TaskPriority => {
  switch (cn) {
    case '高':
      return 'high';
    case '中':
      return 'medium';
    case '低':
      return 'low';
    default:
      return 'medium';
  }
};

interface SupabaseTaskRow {
  id: number;
  title: string;
  priority: string;
  completed: boolean;
  created_at: string;
}

const mapRowToTask = (row: SupabaseTaskRow): Task => ({
  id: String(row.id),
  title: row.title,
  priority: priorityFromCn(row.priority),
  completed: row.completed,
  createdAt: row.created_at,
});

export async function getTasks(priority?: TaskPriority): Promise<TaskListResponse> {
  try {
    let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (priority) {
      query = query.eq('priority', priorityToCn[priority]);
    }
    const { data, error } = await query;
    if (error) throw error;
    const items: Task[] = (data as SupabaseTaskRow[]).map(mapRowToTask);
    return { items };
  } catch (error) {
    console.error('获取任务列表失败', error);
    throw error;
  }
}

export async function createTask(data: CreateTaskRequest): Promise<Task> {
  try {
    const { data: rows, error } = await supabase
      .from('tasks')
      .insert({
        title: data.title,
        priority: priorityToCn[data.priority],
        completed: false,
      })
      .select()
      .single();
    if (error) throw error;
    return mapRowToTask(rows as SupabaseTaskRow);
  } catch (error) {
    console.error('创建任务失败', error);
    throw error;
  }
}

export async function updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
  try {
    const patch: Record<string, unknown> = {};
    if (data.title !== undefined) patch.title = data.title;
    if (data.priority !== undefined) patch.priority = priorityToCn[data.priority];
    if (data.completed !== undefined) patch.completed = data.completed;

    const { data: rows, error } = await supabase
      .from('tasks')
      .update(patch)
      .eq('id', Number(id))
      .select()
      .single();
    if (error) throw error;
    return mapRowToTask(rows as SupabaseTaskRow);
  } catch (error) {
    console.error('更新任务失败', error);
    throw error;
  }
}

export async function deleteTask(id: string): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase.from('tasks').delete().eq('id', Number(id));
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('删除任务失败', error);
    throw error;
  }
}
