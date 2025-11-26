import { apiService } from './api';
import { Goal, CreateGoalRequest } from '@/types/Goal';

export const goalsService = {
    async getGoals(): Promise<Goal[]> {
        return apiService.get<Goal[]>('/goals');
    },

    async getGoalById(goalId: string): Promise<Goal> {
        return apiService.get<Goal>(`/goals/${goalId}`);
    },

    async createGoal(goalData: CreateGoalRequest): Promise<Goal> {
        return apiService.post<Goal>('/goals', goalData);
    },

    async updateGoal(goalId: string, goalData: Partial<CreateGoalRequest>): Promise<Goal> {
        return apiService.put<Goal>(`/goals/${goalId}`, goalData);
    },

    async deleteGoal(goalId: string): Promise<void> {
        return apiService.delete<void>(`/goals/${goalId}`);
    },
};
