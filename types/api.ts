export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
	pin: string;
}

export interface AuthResponse {
	token: string;
	refreshToken: string
	error: string;
}

export interface ApiError {
	message: string;
	code?: string;
	details?: any;
}

export interface SubAccountRegisterRequest {
	name: string;
	role: string;
	pin?: string;
}

export type Pagination<T> = {
	content: T[],
	empty: boolean,
	first: boolean
	last: boolean
	number: number
	numberOfElements: number
	pageable: {
		offset: number
		pageNumber: number
		pageSize: number
		paged: boolean
		sort: {
			empty: boolean, 
			sorted: boolean, 
			unsorted: boolean
		}
		unpaged: boolean
	}
	size: number
	sort: {
		empty: boolean, 
		sorted: boolean, 
		unsorted: boolean
	}
	totalElements: number
	totalPages: number
}