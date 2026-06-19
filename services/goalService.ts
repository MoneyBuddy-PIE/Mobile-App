import { Goal, GoalStatus, CreateGoalRequest, GoalMoneyRequest } from '@/types/Goal';
import { apiService } from './api';

type GetGoalParams = {
    childId?: string;
    status?: GoalStatus;
};

export type UpdateGoalRequest = {
    name?: string;
    amount?: number;
    emoji?: string;
};

export const goalsService = {
    async getAllGoals(params: GetGoalParams): Promise<Goal[]> {
        const { childId, status } = params;
        const queryParams = new URLSearchParams();
        if (childId) queryParams.append('childId', childId);
        if (status) queryParams.append('goalStatus', status);
        return apiService.get<Goal[]>(`/goals?${queryParams.toString()}`);
    },

    async getGoals(childId?: string, goalStatus?: GoalStatus): Promise<Goal[]> {
        return goalsService.getAllGoals({ childId, status: goalStatus });
    },

    async getGoalById(id: string): Promise<Goal> {
        return apiService.get<Goal>(`/goals/${id}`);
    },

    async createGoal(data: CreateGoalRequest): Promise<void> {
        return apiService.post<void>('/goals', data);
    },

    async updateGoal(id: string, data: UpdateGoalRequest): Promise<Goal> {
        return apiService.put<Goal>(`/goals/${id}`, data);
    },

    async deleteGoal(id: string): Promise<void> {
        return apiService.delete<void>(`/goals/${id}`);
    },

    async addMoneyToGoal(id: string, data: GoalMoneyRequest): Promise<string> {
        return apiService.post<string>(`/goals/add/${id}`, data);
    },

    async removeMoneyFromGoal(id: string, data: GoalMoneyRequest): Promise<string> {
        return apiService.post<string>(`/goals/remove/${id}`, data);
    },

    async transferGoal(id: string): Promise<string> {
        return apiService.post<string>(`/goals/transfer/${id}`, {});
    },
};
