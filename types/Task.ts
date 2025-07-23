export interface Task {
	id: string;
	description: string;
	category: string;
	reward: string;
	dateLimit: string;
	subaccountIdParent: string;
	subaccountIdChild: string;
	accountId: string;
	createdAt: string;
	updatedAt: string;
	done: boolean;
}

export interface CreateTaskRequest {
	description: string;
	category: string;
	subAccountId: string;
	reward: string;
	dateLimit: string;
}