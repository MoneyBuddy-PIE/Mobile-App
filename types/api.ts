import { SubAccountRole } from './Account';

export interface LoginRequest {
    email: string;
    password: string;
}

/** Alias matching the API schema name */
export type AuthRequest = LoginRequest;

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    pin: string;
}

export interface AuthResetPassword {
    password: string;
    confirmPassword: string;
    pin: string;
}

export type DEVICE_PLATFORM = 'IOS' | 'ANDROID';

/** Alias matching the API schema name */
export type DevicePlatform = DEVICE_PLATFORM;

export interface DeviceLoginRequest {
    userId: string;
    token: string;
    devicePlatform: DEVICE_PLATFORM;
}

export interface AuthResponse {
    token: string;
    error: string;
}

export interface ApiError {
    message: string;
    code?: string;
    details?: any;
}

export interface SubAccountRegisterRequest {
    name: string;
    role: SubAccountRole;
    pin: string;
    iconStyle?: string;
    iconName?: string;
}

/** Alias matching the API schema name */
export type SubAccountDto = SubAccountRegisterRequest;

export interface UpdateSubAccountDto {
    name?: string;
    iconStyle?: string;
    iconName?: string;
}

export interface AuthSubAccountRequest {
    id: string;
    pin?: string;
}

export interface ResponseDto {
    message: string;
    status: string;
}

export interface CompleteSection {
    score: number;
}
