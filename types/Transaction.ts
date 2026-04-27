export enum TransactionType {
	CREDIT = 'CREDIT',
	DEBIT = "DEBIT"
}

export enum TransactionCategory {
	COIN = 'COIN',
	MONEY = "MONEY"
}

export interface Transaction {
	id: string;
	childId: string;
	parentId: string;
	type: TransactionType;
	category: TransactionCategory
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
