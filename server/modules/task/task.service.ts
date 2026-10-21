import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';

import { task } from '../../database/schema';
import type {
  Task,
  TaskListResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskPriority,
} from '@shared/api.interface';

@Injectable()
export class TaskService {
  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  async list(priority?: TaskPriority): Promise<TaskListResponse> {
    const query = priority
      ? this.db.select().from(task).where(eq(task.priority, priority)).orderBy(desc(task.createdAt))
      : this.db.select().from(task).orderBy(desc(task.createdAt));

    const rows = await query;
    const items: Task[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      priority: row.priority as TaskPriority,
      completed: row.completed,
      createdAt: row.createdAt.toISOString(),
    }));
    return { items };
  }

  async create(dto: CreateTaskRequest): Promise<Task> {
    const rows = await this.db
      .insert(task)
      .values({
        title: dto.title,
        priority: dto.priority,
        completed: false,
      })
      .returning();

    const row = rows[0];
    return {
      id: row.id,
      title: row.title,
      priority: row.priority as TaskPriority,
      completed: row.completed,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async update(id: string, dto: UpdateTaskRequest): Promise<Task> {
    const patch: Partial<typeof task.$inferInsert> = {};
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.priority !== undefined) patch.priority = dto.priority;
    if (dto.completed !== undefined) patch.completed = dto.completed;

    if (Object.keys(patch).length === 0) {
      const existing = await this.db.select().from(task).where(eq(task.id, id));
      if (existing.length === 0) throw new NotFoundException('任务不存在');
      const row = existing[0];
      return {
        id: row.id,
        title: row.title,
        priority: row.priority as TaskPriority,
        completed: row.completed,
        createdAt: row.createdAt.toISOString(),
      };
    }

    patch.updatedAt = new Date();

    const rows = await this.db
      .update(task)
      .set(patch)
      .where(eq(task.id, id))
      .returning();

    if (rows.length === 0) throw new NotFoundException('任务不存在');

    const row = rows[0];
    return {
      id: row.id,
      title: row.title,
      priority: row.priority as TaskPriority,
      completed: row.completed,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const rows = await this.db.delete(task).where(eq(task.id, id)).returning({ id: task.id });
    if (rows.length === 0) throw new NotFoundException('任务不存在');
    return { success: true };
  }
}
