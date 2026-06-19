import { AllowanceFrequency } from './Allowance';
import { WeekDay } from './Task';

export type IncomeStatus = 'REFUSED' | 'ACCEPTED' | 'PENDING';

export interface IncomeSetting {
    id: string;
    subAccountId: string;
    preValidate: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IncomeSubAccount {
    id: string;
    accountId: string;
    name: string;
    setting?: IncomeSetting;
    role: string;
    money: number;
    income: number;
    coin: number;
    iconStyle: string;
    iconName: string;
    createdAt: string;
    updatedAt: string;
    lastConnexion: string;
    active: boolean;
}

export interface IncomeAllowance {
    id: string;
    accountId: string;
    subAccountId: string;
    subAccountIdChild: string;
    subAccount: IncomeSubAccount;
    frequency: AllowanceFrequency;
    amount: number;
    weeklyDay: WeekDay;
    startDate: string;
    nextExecution: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Income {
    id: string;
    accountId: string;
    subAccountId: string;
    subAccountIdChild: string;
    subAccount: IncomeSubAccount;
    task: string | null;
    allowance: IncomeAllowance | null;
    amount: number;
    status: IncomeStatus;
    createdAt: string;
    updatedAt: string;
}

export interface GetIncomesParams {
    childId?: string;
    parentId?: string;
    status?: IncomeStatus;
}

export interface UpdateIncomeRequest {
    status: IncomeStatus;
}
