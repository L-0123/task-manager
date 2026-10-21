import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { TaskService } from './task.service';
import type {
  TaskListResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskPriority,
} from '@shared/api.interface';

@Controller('api/tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async list(@Query('priority') priority?: string): Promise<TaskListResponse> {
    const validPriority =
      priority && ['high', 'medium', 'low'].includes(priority)
        ? (priority as TaskPriority)
        : undefined;
    return this.taskService.list(validPriority);
  }

  @Post()
  async create(@Body() dto: CreateTaskRequest) {
    return this.taskService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTaskRequest) {
    return this.taskService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.taskService.remove(id);
  }
}
