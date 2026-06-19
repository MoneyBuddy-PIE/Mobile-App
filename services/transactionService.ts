import { apiService } from './api';
import { Transaction, Transactions, AddExpenseRequest } from '@/types/Transaction';
import { logger } from '@/utils/logger';

export interface AddMoneyResponse {
    success: boolean;
    message?: string;
}

type TransactionParams = {
    subAccountId?: string;
    isGoal?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
};

export const transactionService = {
    async getTransactions({
        subAccountId,
        isGoal = false,
        page = 0,
        size = 50,
        sortBy = 'createdAt',
        sortDir = 'desc',
    }: TransactionParams): Promise<Transaction[]> {
        const params: TransactionParams = { page, size, sortBy, sortDir };
        if (isGoal) params.isGoal = true;
        if (subAccountId) params.subAccountId = subAccountId;

        return (await apiService.get<Transactions>('/transactions/subAccount', params)).content;
    },

    async getTransactionsBySubAccount(subAccountId: string): Promise<Transaction[]> {
        return (await apiService.get<Transactions>('/transactions/subAccount', { subAccountId })).content;
    },

    async getTransactionByGoalId(goalId: string): Promise<Transaction[]> {
        return apiService.get<Transaction[]>(`/transactions/goal/${goalId}`);
    },

    async addExpense(data: AddExpenseRequest): Promise<AddMoneyResponse> {
        try {
            await apiService.post('/money?isAdd=false', data);
            return { success: true };
        } catch (error: any) {
            logger.error('Error adding expense:', error);
            return {
                success: false,
                message: error.response?.data?.message || "Erreur lors de l'ajout de la dépense",
            };
        }
    },
};
