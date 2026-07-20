export interface ReceiptItem {
    amount: number;
    description: string;
}

export interface ReceiptRow {
    ocr_confidence: number;
    merchant_name: string;
    date: string;
    currency: string;
    total: number;
    ocr_text: string;
    items: ReceiptItem[];
}

export interface Receipt {
    message: string;
    success: boolean;
    ocr_type: string;
    request_id: string;
    receipts: ReceiptRow[];
}
