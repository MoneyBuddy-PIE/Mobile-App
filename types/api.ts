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

export type DEVICE_PLATFORM = 'IOS' | 'ANDROID';

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
    role: string;
    pin: string;
    iconStyle?: string;
    iconName?: string;
}
