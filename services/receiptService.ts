import { apiService } from './api';
import { Receipt } from '@/types/Receipt';
import { logger } from '@/utils/logger';

export interface ScanReceiptResponse {
    success: boolean;
    data?: Receipt;
    message?: string;
}

export const receiptService = {
    async scanReceipt(imageUri: string): Promise<ScanReceiptResponse> {
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: imageUri,
                name: 'receipt.jpg',
                type: 'image/jpeg',
            } as any);

            const data = await apiService.postFormData<Receipt>('/receipt', formData);
            return { success: true, data };
        } catch (error: any) {
            logger.error('Error scanning receipt:', {
                name: error?.name,
                message: error?.message,
                code: error?.code,
                status: error?.response?.status,
                responseData: error?.response?.data,
                stack: error?.stack,
            });
            return {
                success: false,
                message: error.response?.data?.message || 'Impossible de scanner le reçu',
            };
        }
    },
};
