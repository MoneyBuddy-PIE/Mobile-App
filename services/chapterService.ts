import { apiService } from "./api";
import { Chapter, ChapterParentCategory, ChapterResponse, Course } from "@/types/Chapter";

export interface ChapterParams {
	page?: number;
	size?: number;
	sortBy?: string;
	sortDir?: "asc" | "desc";
	category?: string;
}

export const chapterService = {
	async getChapters(params: ChapterParams = {}): Promise<ChapterResponse> {
		const searchParams = {
			page: params.page || 0,
			size: params.size || 10,
			sortBy: params.sortBy || "order",
			sortDir: params.sortDir || "asc",
			category: params.category || "*",
		};

		return apiService.get<ChapterResponse>("/chapters", searchParams);
	},

	async getChapterById(chapterId: string): Promise<Chapter> {
		return apiService.get<Chapter>(`/chapters/${chapterId}`);
	},

    async getChapterCourses(chapterId: string): Promise<Course[]> {
        return (await apiService.get<{content: Course[]}>(`/courses/chapter/${chapterId}`)).content;
    },

	async getChaptersByCategory(category = "*"): Promise<Chapter[]> {
		if (category === ChapterParentCategory.ALL) category = "*";
		const response = await this.getChapters({ size: 100, category });
		return response.content;
	},

	async getAllChapters(): Promise<Chapter[]> {
		const response = await this.getChapters({ size: 1000 });
		return response.content;
	},
};
