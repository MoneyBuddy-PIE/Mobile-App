import { WeekDay } from "./Task"


export enum AllowanceFrequency {
    WEEKLY = "WEEKLY",
    BIWEEKLY = "BIWEEKLY",
    MONTHLY = "MONTHLY"
}

export type AllowanceRequest = {
    subAccountIdChild: string
    frequency: AllowanceFrequency
    amount: number
    active: boolean
    weeklyDay?: WeekDay[]
    startDate: string
}

export type Allowance = {
    id: string
    accountId: string
    subAccountId: string
    subAccountIdChild: string
    frequency: AllowanceFrequency
    amount: number
    weeklyDay: WeekDay[]
    startDate: string
    nextExecution: string
    active: boolean
    createdAt: string
    updatedAt: string
}