import { apiService } from './api';
import { Allowance, AllowanceRequest, UpdateAllowanceRequest } from '@/types/Allowance';
import { logger } from '@/utils/logger';

export const allowanceService = {
    async getAll(): Promise<Allowance[]> {
        return apiService.get<Allowance[]>('/allowance');
    },

    async getByChildId(childId: string): Promise<Allowance | null> {
        try {
            const allowances = await allowanceService.getAll();
            return allowances.find((a) => a.subAccountIdChild === childId) ?? null;
        } catch (error) {
            logger.error('Error fetching allowance for child:', error);
            return null;
        }
    },

    async getById(id: string): Promise<Allowance> {
        return apiService.get<Allowance>(`/allowance/${id}`);
    },

    async create(data: AllowanceRequest): Promise<Allowance> {
        return apiService.post<Allowance>('/allowance', data);
    },

    async update(id: string, data: UpdateAllowanceRequest): Promise<Allowance> {
        return apiService.put<Allowance>(`/allowance/${id}`, data);
    },
};
