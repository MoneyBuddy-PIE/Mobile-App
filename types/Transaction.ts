import { Pagination } from './api';

export type TransactionType = 'CREDIT' | 'DEBIT';
export const TransactionType = { CREDIT: 'CREDIT' as TransactionType, DEBIT: 'DEBIT' as TransactionType };

export type TransactionCategory = 'COIN' | 'MONEY';
export const TransactionCategory = { COIN: 'COIN' as TransactionCategory, MONEY: 'MONEY' as TransactionCategory };

export interface Transaction {
    id: string;
    accountId: string;
    childId: string;
    parentId: string | null;
    goalId: string | null;
    incomeId: string | null;
    type: TransactionType;
    category: TransactionCategory | null;
    createdAt: string;
    updatedAt: string | null;
    amount: string;
    oldAmount: string;
    newAmount: string;
    description: string;
    emoji?: string;
}

export type Transactions = Pagination<Transaction>;

export interface AddExpenseRequest {
    subAccountId: string;
    amount: number;
    emoji: string;
    description?: string;
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
