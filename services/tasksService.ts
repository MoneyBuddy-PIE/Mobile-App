import { logger } from "@/utils/logger";
import { apiService } from "./api";
import { Task, CreateTaskRequest } from "@/types/Task";

export const tasksService = {
	// Récupérer toutes les tâches
	async getAllTasks(source: string): Promise<Task[]> {
		// const endpoint = `/tasks?source=${source}`;
		// console.log("Fetching all tasks from endpoint:", endpoint);
		return apiService.get<Task[]>('/tasks?source=' + source);
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

	// Récupérer les tâches d'un enfant spécifique
	async getTasksByChild(childId: string, role: string): Promise<Task[]> {
		logger.log(`Fetching tasks for child ID: ${childId} with role: ${role}`);
		if (role === "OWNER") role = "PARENT"
		const allTasks = await this.getAllTasks(role);
		logger.log("All tasks loaded:", allTasks);
		return allTasks.filter((task) => task.subaccountIdChild === childId);
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
