

export enum GoalStatus {
    ACTIVATED = "ACTIVATED",
    DONE = "DONE",
    USED = "USED"
}

export type Goal = {
    id: string
    subaccountIdChild: string
    accountId: string
    
    name: string
    amount: number
    emoji: string
    depositStatement: number
    goalStatus: GoalStatus
    progression: number
    createdAt: string
    updatedAt: string
  }
  