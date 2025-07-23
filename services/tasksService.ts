import { apiService } from "./api"
import { Task, CreateTaskRequest } from "@/types/Task"

export const tasksService = {
	async getAllTasks(): Promise<Task[]> {
		return apiService.get<Task[]>("/tasks");
	},

	async createTask(data: CreateTaskRequest): Promise<Task> {
		return apiService.post<Task>("/tasks", data);
	},
};