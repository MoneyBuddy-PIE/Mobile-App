import { SubAccount } from './Account';

export type TaskType = 'PONCTUAL' | 'WEEKLY' | 'MONTHLY';

export type TaskStatus = 'PENDING' | 'PRE_VALIDATE' | 'COMPLETED' | 'REFUSED';

export type WeekDay = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export type IncomeStatus = 'REFUSED' | 'ACCEPTED' | 'PENDING';

export type AllowanceFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export interface Allowance {
    id: string;
    accountId: string;
    subAccountId: string;
    subAccountIdChild: string;
    subAccount: SubAccount | null;
    frequency: AllowanceFrequency;
    amount: number;
    weeklyDay: WeekDay | null;
    startDate: string | null;
    nextExecution: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string | null;
}

export interface Income {
    id: string;
    accountId: string;
    subAccountId: string;
    subAccountIdChild: string;
    subAccount: SubAccount | null;
    task: Task | null;
    allowance: Allowance | null;
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

export interface TaskHistory {
    id: string;
    taskId: string;
    subAccounttId: string;
    accountId: string;
    status: TaskStatus;
    type: TaskType;
    coinReward: number;
    moneyReward: number;
    createdAt: string;
    updatedAt: string;
}

export interface TaskWithHistory extends Task {
    taskHistory: TaskHistory[];
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

export interface TaskUpdate {
    description?: string;
    type?: TaskType;
    subAccountId?: string;
    coinReward?: number;
    moneyReward?: number;
    dateLimit?: string;
    weeklyDays?: WeekDay[];
    monthlyDay?: number;
    preValidate?: boolean;
    disable?: boolean;
}

export interface TaskComplete {
    done: boolean;
}

export interface UpdateIncomeRequest {
    status: IncomeStatus;
}

export interface CreateAllowance {
    subAccountIdChild: string;
    frequency: AllowanceFrequency;
    amount?: number;
    active?: boolean;
    weeklyDay?: WeekDay;
    startDate?: string;
}

export interface UpdateAllowance {
    subAccountIdChild?: string;
    frequency?: AllowanceFrequency;
    amount?: number;
    weeklyDay?: WeekDay;
    startDate?: string;
    active?: boolean;
    weeklyDayValid?: boolean;
}
