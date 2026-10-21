import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { Check, Trash2, Plus } from 'lucide-react';

import { Button } from '@client/src/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@client/src/components/ui/form';
import { Input } from '@client/src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@client/src/components/ui/card';
import { Badge } from '@client/src/components/ui/badge';
import { Label } from '@client/src/components/ui/label';
import { Empty, EmptyDescription } from '@client/src/components/ui/empty';

import { tasksApi } from '@client/src/api';
import type { Task, TaskPriority } from '@shared/api.interface';

const taskSchema = z.object({
  title: z.string().min(1, '请输入任务标题'),
  priority: z.enum(['high', 'medium', 'low']),
});

type TaskFormData = z.infer<typeof taskSchema>;

const priorityLabel: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const priorityVariant: Record<TaskPriority, 'destructive' | 'default' | 'secondary'> = {
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
};

type FilterValue = 'all' | TaskPriority;

const TaskManagerPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterValue>('all');

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: '', priority: 'medium' },
  });

  const loadTasks = async (priorityFilter: FilterValue) => {
    setLoading(true);
    try {
      const priority = priorityFilter === 'all' ? undefined : priorityFilter;
      const res = await tasksApi.getTasks(priority);
      setTasks(res.items);
    } catch (error) {
      logger.error('加载任务失败', error);
      toast.error('加载任务失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks(filter);
  }, [filter]);

  const handleSubmit = async (data: TaskFormData) => {
    try {
      await tasksApi.createTask({
        title: data.title,
        priority: data.priority,
      });
      form.reset({ title: '', priority: 'medium' });
      toast.success('任务创建成功');
      loadTasks(filter);
    } catch (error) {
      logger.error('创建任务失败', error);
      toast.error('创建任务失败');
    }
  };

  const handleToggle = async (task: Task) => {
    try {
      await tasksApi.updateTask(task.id, { completed: !task.completed });
      toast.success(task.completed ? '已标记为未完成' : '已标记为完成');
      loadTasks(filter);
    } catch (error) {
      logger.error('更新任务失败', error);
      toast.error('更新任务失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await tasksApi.deleteTask(id);
      toast.success('任务已删除');
      loadTasks(filter);
    } catch (error) {
      logger.error('删除任务失败', error);
      toast.error('删除任务失败');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">智能任务管理</h1>
          <p className="text-slate-500">高效管理你的日常任务</p>
        </div>

        <Card className="mb-6 shadow-sm border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">添加新任务</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex flex-wrap gap-3 items-end"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[200px]">
                      <FormControl>
                        <Input placeholder="请输入任务标题" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem className="w-32">
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="优先级" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">高优先级</SelectItem>
                          <SelectItem value="medium">中优先级</SelectItem>
                          <SelectItem value="low">低优先级</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">
                  <Plus className="w-4 h-4 mr-1" />
                  添加
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">任务列表</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="priority-filter" className="text-sm text-slate-500">
                筛选：
              </Label>
              <Select
                value={filter}
                onValueChange={(v) => setFilter(v as FilterValue)}
              >
                <SelectTrigger id="priority-filter" className="w-28 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="high">高</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="low">低</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-slate-400">加载中...</div>
            ) : tasks.length === 0 ? (
              <Empty>
                <EmptyDescription>暂无任务</EmptyDescription>
              </Empty>
            ) : (
              <ul className="space-y-2">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className={`h-6 w-6 rounded-full flex-shrink-0 ${
                        task.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : ''
                      }`}
                      onClick={() => handleToggle(task)}
                      aria-label={task.completed ? '标记为未完成' : '标记为完成'}
                    >
                      {task.completed && <Check className="h-3 w-3" />}
                    </Button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          task.completed
                            ? 'line-through text-slate-400'
                            : 'text-slate-700'
                        }`}
                      >
                        {task.title}
                      </p>
                    </div>

                    <Badge variant={priorityVariant[task.priority]} className="flex-shrink-0">
                      {priorityLabel[task.priority]}
                    </Badge>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
                      onClick={() => handleDelete(task.id)}
                      aria-label="删除任务"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskManagerPage;
