import { apiService } from "./api";
import { Transaction, AddExpenseRequest } from "@/types/Transaction";
import { logger } from "@/utils/logger";

export interface AddMoneyResponse {
	success: boolean;
	message?: string;
}

export const transactionService = {
	// Récupérer l'historique des transactions d'un sous-compte
	async getTransactionsBySubAccount(subAccountId: string): Promise<Transaction[]> {
		return apiService.get<Transaction[]>(`/transactions/subAccount/${subAccountId}`);
	},

	// Ajouter une dépense (retirer de l'argent)
	async addExpense(data: AddExpenseRequest): Promise<AddMoneyResponse> {
		try {
			await apiService.post("/money?isAdd=false", data);
			return { success: true };
		} catch (error: any) {
			logger.error("Error adding expense:", error);
			return {
				success: false,
				message: error.response?.data?.message || "Erreur lors de l'ajout de la dépense",
			};
		}
	},
};
