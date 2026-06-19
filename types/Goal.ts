export type GoalStatus = 'ACTIVATED' | 'DONE' | 'USED';
export const GoalStatus = { ACTIVATED: 'ACTIVATED' as GoalStatus, DONE: 'DONE' as GoalStatus, USED: 'USED' as GoalStatus };

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
    updatedAt: string | null;
}

export interface CreateGoalRequest {
    name: string;
    amount: number;
    emoji?: string;
}

export interface GoalMoneyRequest {
    transferMoney: number;
}
