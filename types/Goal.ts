export type GoalStatus = 'ACTIVATED' | 'DONE' | 'USED';

export interface Goal {
    id: string;
    name: string;
    amount: number;
    emoji: string;
    depositStatement: number;
    goalStatus: GoalStatus;
    progression: number;
    subaccountIdChild: string;
    accountId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateGoalRequest {
    name: string;
    amount: number;
    emoji?: string;
}

export interface GoalMoneyRequest {
    transferMoney: number;
}
