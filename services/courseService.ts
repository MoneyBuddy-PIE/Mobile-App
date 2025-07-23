import { apiService } from "./api";
import { Course, CompleteCourseRequest } from "@/types/Course";

export const courseService = {
	// Récupérer tous les cours
	async getAllCourses(): Promise<Course[]> {
		return apiService.get<Course[]>("/courses");
	},

	// Récupérer un cours par ID
	async getCourseById(id: string): Promise<Course> {
		return apiService.get<Course>(`/courses/${id}`);
	},

	// Marquer un cours comme terminé
	async completeCourse(id: string, data: CompleteCourseRequest): Promise<void> {
		return apiService.put<void>(`/courses/complete/${id}`, data);
	},

	// Récupérer les cours par rôle
	async getCoursesByRole(role: string): Promise<Course[]> {
		if(role === "OWNER") role = "PARENT"; 
		const allCourses = await this.getAllCourses();
		return allCourses.filter((course) => course.subAccountRole === role);
	},
};
