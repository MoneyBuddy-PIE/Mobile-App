import type { Income } from './Income';

export type TaskType = 'PONCTUAL' | 'WEEKLY' | 'MONTHLY';
export const TaskType = { PONCTUAL: 'PONCTUAL' as TaskType, WEEKLY: 'WEEKLY' as TaskType, MONTHLY: 'MONTHLY' as TaskType };

export type TaskStatus = 'PENDING' | 'PRE_VALIDATE' | 'COMPLETED' | 'REFUSED';
export const TaskStatus = {
    PENDING: 'PENDING' as TaskStatus,
    PRE_VALIDATE: 'PRE_VALIDATE' as TaskStatus,
    COMPLETED: 'COMPLETED' as TaskStatus,
    REFUSED: 'REFUSED' as TaskStatus,
};

export type WeekDay = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export const WeekDay = {
    MONDAY: 'MONDAY' as WeekDay,
    TUESDAY: 'TUESDAY' as WeekDay,
    WEDNESDAY: 'WEDNESDAY' as WeekDay,
    THURSDAY: 'THURSDAY' as WeekDay,
    FRIDAY: 'FRIDAY' as WeekDay,
    SATURDAY: 'SATURDAY' as WeekDay,
    SUNDAY: 'SUNDAY' as WeekDay,
};

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
