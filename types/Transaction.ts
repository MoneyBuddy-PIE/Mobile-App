export interface Transaction {
	id: string;
	childId: string;
	parentId: string;
	type: "CREDIT" | "DEBIT";
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
