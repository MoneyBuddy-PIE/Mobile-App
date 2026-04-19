import { WeekDay } from "./Task"

export enum AllowanceFrequency {
    WEEKLY = "WEEKLY",
    BIWEEKLY = "BIWEEKLY",
    MONTHLY = "MONTHLY"
}

export interface AllowanceSubAccount {
    id: string
    accountId: string
    name: string
    setting?: {
        id: string
        subAccountId: string
        preValidate: boolean
        createdAt: string
        updatedAt: string
    }
    role: string
    money: number
    income: number
    coin: number
    iconStyle: string
    iconName: string
    createdAt: string
    updatedAt: string
    lastConnexion: string
    active: boolean
}

export interface Allowance {
    id: string
    accountId: string
    subAccountId: string
    subAccountIdChild: string
    subAccount?: AllowanceSubAccount
    frequency: AllowanceFrequency
    amount: number
    weeklyDay: WeekDay        // Singulier — correspond à l'API
    startDate: string         // Format YYYY-MM-DD
    nextExecution: string     // Format YYYY-MM-DD
    active: boolean
    createdAt: string
    updatedAt: string
}

// Corps du POST /allowance
export interface AllowanceRequest {
    subAccountIdChild: string
    frequency: AllowanceFrequency
    amount: number
    active: boolean
    weeklyDay?: WeekDay       // Requis si frequency === WEEKLY
    startDate: string         // Format YYYY-MM-DD
}

// Corps du PUT /allowance/{id}
export interface UpdateAllowanceRequest {
    subAccountIdChild?: string
    frequency?: AllowanceFrequency
    amount?: number
    weeklyDay?: WeekDay
    startDate?: string
    active?: boolean
    weeklyDayValid?: boolean
}
