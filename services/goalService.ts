import { Goal, GoalStatus } from "@/types/Goal";
import { apiService } from "./api";


type GetGoalParams = {
    childId?: string;
    status?: GoalStatus
    type?: string;
}

export const goalsService = { 

    async getAllGoals(params: GetGoalParams): Promise<Goal[]> {
		const { childId, status, type } = params;
		const queryParams = new URLSearchParams();

		if (childId)
			queryParams.append('childId', childId);
		
		if (status)
			queryParams.append('status', status);
		
		if (type)
			queryParams.append('type', type);

		return apiService.get<Goal[]>(`/goals?${queryParams.toString()}`);
	},
}