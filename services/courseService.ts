import { Course } from "@/types/Chapter";
import { apiService } from "./api";


export const courseService = {

	async getCourseById(courseId: string): Promise<Course> {
		return apiService.get<Course>(`/courses/${courseId}`);
	},
    
};
