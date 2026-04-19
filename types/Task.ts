export enum TaskType {
	PONCTUAL = 'PONCTUAL',
	WEEKLY = 'WEEKLY',
	MONTHLY = 'MONTHLY',
}

export enum TaskStatus {
	PENDING = 'PENDING',
	COMPLETED = 'COMPLETED',
	REFUSED = 'REFUSED',
	PRE_VALIDATE = 'PRE_VALIDATE'
}

export enum WeekDay {
	MONDAY = 'MONDAY',
	TUESDAY = 'TUESDAY',
	WEDNESDAY = 'WEDNESDAY',
	THURSDAY = 'THURSDAY',
	FRIDAY = 'FRIDAY',
	SATURDAY = 'SATURDAY',
	SUNDAY = 'SUNDAY'
}

export interface Task {
	id: string;
	description: string;
	category: string;
	coinReward: string;
	moneyReward: string;
	dateLimit: string;
	type: TaskType;
	status: TaskStatus;
	subaccountIdParent: string;
	subaccountIdChild: string;
	accountId: string;
	createdAt: string;
	updatedAt: string;
	done: boolean;
	weeklyDays:WeekDay[]
}

export interface CreateTaskRequest {
	description: string;
	type: string;
	subAccountId: string;
	moneyReward: number;
	coinReward: number
	dateLimit: string;
	prevalidation: boolean
	monthlyDay?: number
	weeklyDays?: WeekDay[]
	disable?: boolean
}