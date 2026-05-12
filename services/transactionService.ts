import { apiService } from "./api";
import { Transaction, Transactions } from "@/types/Transaction";

type TransactionParams = {
	subAccountId?: string
	isGoal?: boolean
	page?: number
	size?: number
	sortBy?: string
	sortDir?: string
}

export const transactionService = {
	// Récupérer l'historique des transactions d'un sous-compte
	async getTransactions({
		subAccountId, isGoal = false, page = 0, size = 50, sortBy = "createdAt", sortDir = "desc"
	}: TransactionParams): Promise<Transaction[]> {
		const params: TransactionParams = {page, size, sortBy, sortDir}
		if (isGoal) params.isGoal = true
		if (subAccountId) params.subAccountId = subAccountId

		return (await (apiService.get<Transactions>(`/transactions/subAccount`, params))).content
	},

	async getTransactionByGoaldId(goalId: string): Promise<Transaction[]> {
		return await apiService.get<Transaction[]>(`/transactions/goal/${goalId}`)
	}
};
