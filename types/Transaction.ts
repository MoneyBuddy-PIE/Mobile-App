export type TransactionType = 'CREDIT' | 'DEBIT';

export type TransactionCategory = 'COIN' | 'MONEY';

export interface Transaction {
    id: string;
    accountId: string;
    childId: string;
    parentId: string;
    goalId: string | null;
    incomeId: string | null;
    type: TransactionType;
    category: TransactionCategory | null;
    createdAt: string;
    updatedAt: string;
    amount: string;
    oldAmount: string;
    newAmount: string;
    description: string;
}

export interface AddExpenseRequest {
    subAccountId: string;
    amount: string;
    description: string;
}

export interface AddMoney {
    subAccountId: string;
    amount: number;
    description?: string;
    goalId?: string;
}

export interface CollectAllIncome {
    subAccountId: string;
}
