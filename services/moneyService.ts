import { logger } from "@/utils/logger";
import { apiService } from "./api";

export interface AddMoneyRequest {
	subAccountId: string;
	amount: string;
	description: string;
}

export interface AddMoneyResponse {
	success: boolean;
	message?: string;
}

export const moneyService = {
	async addMoney(data: AddMoneyRequest): Promise<AddMoneyResponse> {
		try {
			await apiService.post("/money?isAdd=true", data);
			return { success: true };
		} catch (error: any) {
			logger.error("Error adding money:", error);
			return {
				success: false,
				message: error.response?.data?.message || "Erreur lors de l'ajout d'argent",
			};
		}
	},
};
