import { apiService } from "./api";
import { Chapter, ChapterResponse, Course } from "@/types/Chapter";

export interface ChapterParams {
	page?: number;
	size?: number;
	sortBy?: string;
	sortDir?: "asc" | "desc";
}

export const chapterService = {
	async getChapters(params: ChapterParams = {}): Promise<ChapterResponse> {
		const searchParams = {
			page: params.page || 0,
			size: params.size || 10,
			sortBy: params.sortBy || "order",
			sortDir: params.sortDir || "asc",
		};

		return apiService.get<ChapterResponse>("/chapters", searchParams);
	},

	async getChapterById(chapterId: string): Promise<Chapter> {
		return apiService.get<Chapter>(`/chapters/${chapterId}`);
	},

    async getChapterCourses(chapterId: string): Promise<Course[]> {
        return apiService.get<Course[]>(`/courses/chapter/${chapterId}`);
    },

	async getChaptersByRole(role: string): Promise<Chapter[]> {
		if (role === "OWNER") role = "PARENT";
		const response = await this.getChapters({ size: 100 });
		return response.content.filter((chapter) => chapter.subAccountRole === role);
	},

	async getAllChapters(): Promise<Chapter[]> {
		const response = await this.getChapters({ size: 1000 });
		return response.content;
	},
};
