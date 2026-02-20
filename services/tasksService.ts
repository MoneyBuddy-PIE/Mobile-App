import { logger } from '@/utils/logger';
import { apiService } from './api';
import { Task, CreateTaskRequest } from '@/types/Task';

export const tasksService = {
    // Récupérer toutes les tâches
    async getAllTasks(): Promise<Task[]> {
        return apiService.get<Task[]>('/tasks');
    },

    // Récupérer les tâches d'un enfant spécifique
    async getTasksByChild(
        childId: string,
        status?: 'PENDING' | 'PRE_VALIDATE' | 'COMPLETED' | 'REFUSED',
        type?: 'PONCTUAL' | 'WEEKLY' | 'MONTHLY',
    ): Promise<Task[]> {
        const params = new URLSearchParams({ childId });
        if (status) params.append('status', status);
        if (type) params.append('type', type);
        const url = `/tasks?${params.toString()}`;
        return apiService.get<Task[]>(url);
    },

    // Créer une nouvelle tâche
    async createTask(data: CreateTaskRequest): Promise<Task> {
        return apiService.post<Task>('/tasks', data);
    },

    // Récupérer une tâche par ID
    async getTaskById(id: string): Promise<Task> {
        return apiService.get<Task>(`/tasks/${id}`);
    },

    // Mettre à jour une tâche
    async updateTask(id: string, data: Partial<CreateTaskRequest>): Promise<Task> {
        return apiService.put<Task>(`/tasks/${id}`, data);
    },

    // Supprimer une tâche
    async deleteTask(id: string): Promise<void> {
        return apiService.delete(`/tasks/${id}`);
    },

    // Marquer une tâche comme terminée
    async completeTask(id: string, done?: boolean): Promise<{ token: string; error: string }> {
        return apiService.put<{ token: string; error: string }>(`/tasks/complete/${id}`, { done: done ?? true });
    },

    // Pré-valider une tâche
    async preValidateTask(id: string): Promise<void> {
        return apiService.put(`/tasks/prevalidation/${id}`);
    },
};
