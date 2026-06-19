import { logger } from '@/utils/logger';
import { apiService } from './api';
import { Task, CreateTaskRequest, TaskUpdate, TaskStatus, TaskHistory } from '@/types/Task';

type GetTasksParams = {
    childId?: string;
    status?: TaskStatus;
    type?: string;
};

export const tasksService = {
    async getAllTasks(params: GetTasksParams = {}): Promise<Task[]> {
        const { childId, status, type } = params;
        const queryParams = new URLSearchParams();

        if (childId) queryParams.append('childId', childId);
        if (status) queryParams.append('status', status);
        if (type) queryParams.append('type', type);

        const query = queryParams.toString();
        return apiService.get<Task[]>(query ? `/tasks?${query}` : '/tasks');
    },

    async getTasksByChild(
        childId: string,
        status?: 'PENDING' | 'PRE_VALIDATE' | 'COMPLETED' | 'REFUSED',
        type?: 'PONCTUAL' | 'WEEKLY' | 'MONTHLY',
    ): Promise<Task[]> {
        const params = new URLSearchParams({ childId });
        if (status) params.append('status', status);
        if (type) params.append('type', type);
        return apiService.get<Task[]>(`/tasks?${params.toString()}`);
    },

    async createTask(data: CreateTaskRequest): Promise<Task> {
        return apiService.post<Task>('/tasks', data);
    },

    async getTaskById(id: string): Promise<Task> {
        return apiService.get<Task>(`/tasks/${id}`);
    },

    async updateTask(id: string, data: Partial<TaskUpdate>): Promise<Task> {
        return apiService.put<Task>(`/tasks/${id}`, data);
    },

    async deleteTask(id: string): Promise<void> {
        return apiService.delete(`/tasks/${id}`);
    },

    async completeTask(id: string, done?: boolean): Promise<{ token: string; error: string }> {
        return apiService.put<{ token: string; error: string }>(`/tasks/complete/${id}`, { done: done ?? true });
    },

    async preValidateTask(id: string): Promise<void> {
        return apiService.put(`/tasks/prevalidation/${id}`);
    },

    async getTaskHistory(taskId: string): Promise<TaskHistory[]> {
        return apiService.get<TaskHistory[]>(`/tasks/history/${taskId}`);
    },
};
