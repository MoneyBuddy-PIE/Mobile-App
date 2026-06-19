import { apiService } from './api';
import {
    ChapterWithProgress,
    ChapterWithoutCoursesWithProgress,
    CourseWithProgress,
    CourseWithoutSectionsWithProgress,
    PageChapterWithoutCoursesWithProgress,
    PageCourseWithoutSectionsWithProgress,
} from '@/types/Chapter';

export interface ChapterParams {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    category?: string;
}

export interface CompleteSectionRequest {
    score: number;
}

export const chapterService = {
    async getChapters(params: ChapterParams = {}): Promise<PageChapterWithoutCoursesWithProgress> {
        const searchParams: Record<string, any> = {
            page: params.page ?? 0,
            size: params.size ?? 10,
            sortBy: params.sortBy ?? 'order',
            sortDir: params.sortDir ?? 'asc',
        };

        if (params.category) searchParams.category = params.category;

        return apiService.get<PageChapterWithoutCoursesWithProgress>('/chapters', searchParams);
    },

    async getChapterById(chapterId: string): Promise<ChapterWithProgress> {
        return apiService.get<ChapterWithProgress>(`/chapters/${chapterId}`);
    },

    async getChapterCourses(chapterId: string): Promise<CourseWithoutSectionsWithProgress[]> {
        const response = await apiService.get<PageCourseWithoutSectionsWithProgress>(`/courses/chapter/${chapterId}`);
        return response.content ?? [];
    },

    async getChaptersByCategory(category = '*'): Promise<ChapterWithoutCoursesWithProgress[]> {
        if (category === 'ALL') category = '*';
        const response = await chapterService.getChapters({ size: 100, category });
        return response.content;
    },

    async getChaptersByRole(role: string): Promise<ChapterWithoutCoursesWithProgress[]> {
        if (role === 'OWNER') role = 'PARENT';
        const response = await chapterService.getChapters({ size: 100 });
        return response.content.filter((chapter) => (chapter as any).subAccountRole === role);
    },

    async getAllChapters(): Promise<ChapterWithoutCoursesWithProgress[]> {
        const response = await chapterService.getChapters({ size: 1000 });
        return response.content;
    },

    async getCourse(courseId: string): Promise<CourseWithProgress> {
        return apiService.get<CourseWithProgress>(`/courses/${courseId}`);
    },

    async completeCourse(courseId: string): Promise<void> {
        return apiService.put(`/progress/course/${courseId}`);
    },

    async completeSection(sectionId: string, score: number): Promise<void> {
        return apiService.put(`/progress/section/${sectionId}`, { score });
    },
};
