import { apiService } from "./api";
import { LoginRequest, RegisterRequest, AuthResponse } from "../types/api";
import { clear } from "../utils/storage";
import { router } from "expo-router";

export const authService = {
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        return apiService.post<AuthResponse>("/auth/login", credentials);
    },

    async register(data: RegisterRequest): Promise<AuthResponse> {
        return apiService.post<AuthResponse>("/auth/register", data);
    },

    async logout(): Promise<void> {
        await clear();
        router.replace("/(auth)/login");
    },

    async subAccountLogin(subAccountId: string, pin?: string): Promise<any> {
        return apiService.post<any>("/auth/subAccount/login", { id: subAccountId, pin });
    }
};
