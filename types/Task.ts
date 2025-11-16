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
    status: 'PENDING' | 'PRE_VALIDATE' | 'COMPLETED' | 'REFUSED';
    preValidate: boolean;
}

export interface CreateTaskRequest {
    description: string;
    category: string;
    subAccountId: string;
    reward: string;
    dateLimit: string;
    prevalidation: boolean;
}
