import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  Task,
  TaskListResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskPriority,
} from '@shared/api.interface';

export async function getTasks(priority?: TaskPriority): Promise<TaskListResponse> {
  try {
    const url = priority ? `/api/tasks?priority=${priority}` : '/api/tasks';
    const response = await axiosForBackend.get(url);
    return response.data;
  } catch (error) {
    logger.error('获取任务列表失败', error);
    throw error;
  }
}

export async function createTask(data: CreateTaskRequest): Promise<Task> {
  try {
    const response = await axiosForBackend.post('/api/tasks', data);
    return response.data;
  } catch (error) {
    logger.error('创建任务失败', error);
    throw error;
  }
}

export async function updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
  try {
    const response = await axiosForBackend.patch(`/api/tasks/${id}`, data);
    return response.data;
  } catch (error) {
    logger.error('更新任务失败', error);
    throw error;
  }
}

export async function deleteTask(id: string): Promise<{ success: boolean }> {
  try {
    const response = await axiosForBackend.delete(`/api/tasks/${id}`);
    return response.data;
  } catch (error) {
    logger.error('删除任务失败', error);
    throw error;
  }
}
