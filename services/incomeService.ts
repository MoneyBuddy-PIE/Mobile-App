import { apiService } from "./api"
import { Income, GetIncomesParams, IncomeStatus } from "@/types/Income"
import { logger } from "@/utils/logger"

export const incomeService = {
    // Récupérer la liste des incomes (filtrable par childId, parentId, status)
    async getIncomes(params: GetIncomesParams): Promise<Income[]> {
        const query = new URLSearchParams()
        if (params.childId) query.append("childId", params.childId)
        if (params.parentId) query.append("parentId", params.parentId)
        if (params.status) query.append("status", params.status)
        return apiService.get<Income[]>(`/incomes?${query.toString()}`)
    },

    // Récupérer un income par son ID
    async getIncomeById(id: string): Promise<Income> {
        return apiService.get<Income>(`/incomes/${id}`)
    },

    // Mettre à jour le statut d'un income (PENDING / ACCEPTED / REFUSED)
    async updateIncomeStatus(id: string, status: IncomeStatus): Promise<{ message: string; status: string }> {
        return apiService.put<{ message: string; status: string }>(`/incomes/${id}`, { status })
    },

    // Supprimer un income
    async deleteIncome(id: string): Promise<{ message: string; status: string }> {
        return apiService.delete<{ message: string; status: string }>(`/incomes/${id}`)
    },

    // Verser les revenus en attente à l'enfant
    async sendIncome(subAccountId: string): Promise<{ message: string; status: string }> {
        try {
            return await apiService.post<{ message: string; status: string }>("/incomes/send", { subAccountId })
        } catch (error: any) {
            logger.error("Error sending income:", error)
            throw error
        }
    },
}
