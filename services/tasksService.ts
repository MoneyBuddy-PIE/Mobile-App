import { apiService } from "./api";
import { Task, CreateTaskRequest, TaskStatus } from "@/types/Task";

type GetTasksParams = {
    childId?: string;
    status?: TaskStatus
    type?: string;
}

export const tasksService = {
	// Récupérer toutes les tâches
	async getAllTasks(params: GetTasksParams): Promise<Task[]> {
		const { childId, status, type } = params;
		const queryParams = new URLSearchParams();

		if (childId)
			queryParams.append('childId', childId);
		
		if (status)
			queryParams.append('status', status);
		
		if (type)
			queryParams.append('type', type);

		return apiService.get<Task[]>(`/tasks?${queryParams.toString()}`);
	},

	// Créer une nouvelle tâche
	async createTask(data: CreateTaskRequest): Promise<Task> {
		return apiService.post<Task>("/tasks", data);
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
	async completeTask(id: string): Promise<{ token: string; error: string }> {
		return apiService.put<{ token: string; error: string }>(`/tasks/complete/${id}`);
	},

	// Récupérer les tâches par catégorie
	// async getTasksByCategory(category: string): Promise<Task[]> {
	// 	const allTasks = await this.getAllTasks();
	// 	return allTasks.filter((task) => task.category.toLowerCase() === category.toLowerCase());
	// },

	// // Récupérer les tâches non terminées
	// async getPendingTasks(): Promise<Task[]> {
	// 	const allTasks = await this.getAllTasks();
	// 	return allTasks.filter((task) => !task.done);
	// },

	// // Récupérer les tâches terminées
	// async getCompletedTasks(): Promise<Task[]> {
	// 	const allTasks = await this.getAllTasks();
	// 	return allTasks.filter((task) => task.done);
	// },
};
