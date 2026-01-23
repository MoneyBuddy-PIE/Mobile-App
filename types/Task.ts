export type TaskType = 'PONCTUAL' | 'WEEKLY' | 'MONTHLY';

export type TaskStatus = 'PENDING' | 'PRE_VALIDATE' | 'COMPLETED' | 'REFUSED';

export type WeekDay = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export type IncomeStatus = 'REFUSED' | 'ACCEPTED' | 'PENDING';

export interface Income {
    id: string;
    accountId: string;
    subAccountId: string;
    subAccountIdChild: string;
    amount: number;
    status: IncomeStatus;
    createdAt: string;
    updatedAt: string;
}

export interface Task {
    id: string;
    description: string;
    type: TaskType;
    status: TaskStatus;
    preValidate: boolean;
    disable: boolean;
    subaccountIdParent: string;
    subaccountIdChild: string;
    accountId: string;
    moneyReward: number;
    coinReward: number;
    weeklyDays: WeekDay[];
    monthlyDay: number;
    dateLimit: string;
    createdAt: string;
    updatedAt: string;
    income?: Income;
}

export interface CreateTaskRequest {
    description: string;
    type: TaskType;
    subAccountId: string;
    coinReward: number;
    moneyReward: number;
    dateLimit: string;
    weeklyDays: WeekDay[];
    monthlyDay: number;
    prevalidation: boolean;
}
