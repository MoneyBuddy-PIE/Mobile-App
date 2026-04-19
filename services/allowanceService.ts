import { apiService } from "./api"
import { Allowance, AllowanceRequest, UpdateAllowanceRequest } from "@/types/Allowance"
import { logger } from "@/utils/logger"

export const allowanceService = {
    // Récupérer toutes les allowances du parent connecté
    async getAll(): Promise<Allowance[]> {
        return apiService.get<Allowance[]>("/allowance")
    },

    // Récupérer l'allowance d'un enfant spécifique (filtrage client-side)
    async getByChildId(childId: string): Promise<Allowance | null> {
        try {
            const allowances = await allowanceService.getAll()
            return allowances.find((a) => a.subAccountIdChild === childId) ?? null
        } catch (error) {
            logger.error("Error fetching allowance for child:", error)
            return null
        }
    },

    // Récupérer une allowance par son ID
    async getById(id: string): Promise<Allowance> {
        return apiService.get<Allowance>(`/allowance/${id}`)
    },

    // Créer une nouvelle allowance
    async create(data: AllowanceRequest): Promise<Allowance> {
        return apiService.post<Allowance>("/allowance", data)
    },

    // Mettre à jour une allowance existante
    async update(id: string, data: UpdateAllowanceRequest): Promise<Allowance> {
        return apiService.put<Allowance>(`/allowance/${id}`, data)
    },
}
