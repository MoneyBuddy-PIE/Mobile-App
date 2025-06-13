import { useState } from "react";
import { authService } from "../services/authService";
import { LoginRequest, RegisterRequest, AuthResponse } from "../types/api";

export function useAuth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (credentials: LoginRequest): Promise<AuthResponse | null> => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.login(credentials);
            return response;
        } catch (err: any) {
            setError(err.response?.data?.message || "Login failed");
            return null;
        } finally {
            setLoading(false);
        }
    };

    const register = async (data: RegisterRequest): Promise<AuthResponse | null> => {
        try {
            setLoading(true);
            setError(null);

            // Validate passwords match
            if (data.password !== data.confirmPassword) {
                setError("Passwords do not match");
                return null;
            }

            const response = await authService.register(data);
            // Store token here
            // await AsyncStorage.setItem('authToken', response.token);
            return response;
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed");
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { login, register, loading, error };
}
