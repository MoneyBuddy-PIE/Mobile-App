import { Goal, GoalStatus } from "@/types/Goal";
import { apiService } from "./api";

type GetGoalParams = {
    childId?: string;
    status?: GoalStatus;
    type?: string;
}

export type CreateGoalRequest = {
    name: string;
    amount: number;
    emoji: string;
    subaccountIdChild: string;
}

export type UpdateGoalRequest = {
    name?: string;
    amount?: number;
    emoji?: string;
}

export type DepositToGoalRequest = {
    depositAmount: number;
}

export const goalsService = {

    async getAllGoals(params: GetGoalParams): Promise<Goal[]> {
        const { childId, status, type } = params;
        const queryParams = new URLSearchParams();
        if (childId) queryParams.append("childId", childId);
        if (status) queryParams.append("status", status);
        if (type) queryParams.append("type", type);
        return apiService.get<Goal[]>(`/goals?${queryParams.toString()}`);
    },

    async createGoal(data: CreateGoalRequest): Promise<Goal> {
        return apiService.post<Goal>("/goals", data);
    },

    async updateGoal(id: string, data: UpdateGoalRequest): Promise<Goal> {
        return apiService.put<Goal>(`/goals/${id}`, data);
    },

    async deleteGoal(id: string): Promise<void> {
        return apiService.delete<void>(`/goals/${id}`);
    },

    async depositToGoal(id: string, data: DepositToGoalRequest): Promise<Goal> {
        return apiService.put<Goal>(`/goals/${id}/deposit`, data);
    },

    async completeGoal(id: string): Promise<Goal> {
        return apiService.put<Goal>(`/goals/${id}/complete`, {});
    },

    async useGoal(id: string): Promise<Goal> {
        return apiService.put<Goal>(`/goals/${id}/use`, {});
    },
};
