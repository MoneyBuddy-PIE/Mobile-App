import { apiService } from "./api";


export const progressService = {

    async validateSection (sectionId: string): Promise<boolean> {
        const res = await apiService.put<{message: string, status: string}>(`/progress/section/${sectionId}`, {score: 100});
        return res.message === 'Completed';
    },

    async validateCourse (courseId: string): Promise<boolean> {
        const res = await apiService.put<{message: string, status: string}>(`/progress/course/${courseId}`);
        return res.message === 'Completed';
    },

}