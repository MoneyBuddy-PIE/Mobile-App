import React, { createContext, useContext, useEffect, useState } from "react";
import { TokenStorage, UserStorage } from "@/utils/storage";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { Account } from "@/types/Account";

interface AuthContextType {
	isLoading: boolean;
	isAuthenticated: boolean;
	user: Account | null;
	login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
	logout: () => Promise<void>;
	refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [user, setUser] = useState<Account | null>(null);

	useEffect(() => {
		checkAuthStatus();

		const interval = setInterval(() => {
			checkAuthStatus();
		}, 5 * 60 * 1000);

		return () => clearInterval(interval);
	}, []);

	const checkAuthStatus = async () => {
		try {
			const token = await TokenStorage.getToken();
            const subaccountToken = await TokenStorage.getSubAccountToken();
            console.log("Subaccount token:", subaccountToken);

			if (!token) {
				setIsAuthenticated(false);
				setUser(null);
				setIsLoading(false);
				return;
			}

			try {
				const userData = await userService.getAccount();
				await UserStorage.setUser(userData);
				setUser(userData);
				setIsAuthenticated(true);
			} catch (error: any) {
				console.log("Token validation failed:", error);
				setIsAuthenticated(false);
				setUser(null);
			}
		} catch (error) {
			console.error("Auth check error:", error);
			setIsAuthenticated(false);
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	};

	const login = async (email: string, password: string) => {
		try {
			const response = await authService.login({ email, password });
			await TokenStorage.saveToken(response.token);

			const userData = await userService.getAccount();
			await UserStorage.setUser(userData);

			setUser(userData);
			setIsAuthenticated(true);

			return { success: true };
		} catch (error: any) {
			const errorMessage = error.response?.data?.message || "Login failed";
			return { success: false, error: errorMessage };
		}
	};

	const logout = async () => {
		setIsLoading(true);

		try {
			await authService.logout();
		} finally {
			setIsAuthenticated(false);
			setUser(null);
			setIsLoading(false);
		}
	};

	const refreshUserData = async () => {
		if (!isAuthenticated) return;

		try {
			const userData = await userService.getAccount();
			await UserStorage.setUser(userData);
			setUser(userData);
		} catch (error) {
			console.error("Failed to refresh user data:", error);
		}
	};

	return (
		<AuthContext.Provider
			value={{
				isLoading,
				isAuthenticated,
				user,
				login,
				logout,
				refreshUserData,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuthContext = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}
	return context;
};
