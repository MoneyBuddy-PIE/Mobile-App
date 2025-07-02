import { useEffect, useState } from "react";
import { router } from "expo-router";
import { TokenStorage, UserStorage } from "@/utils/storage";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { Account } from "@/types/Account";

interface AuthState {
	isLoading: boolean;
	isAuthenticated: boolean;
	user: Account | null;
	error: string | null;
}

export const useAuth = () => {
	const [authState, setAuthState] = useState<AuthState>({
		isLoading: true,
		isAuthenticated: false,
		user: null,
		error: null,
	});

	useEffect(() => {
		checkAuthStatus();
	}, []);

	const checkAuthStatus = async () => {
		try {
			const token = await TokenStorage.getToken();

			if (!token) {
				setAuthState({
					isLoading: false,
					isAuthenticated: false,
					user: null,
					error: null,
				});
				return;
			}

			const cachedUser = await UserStorage.getUser();
			if (cachedUser) {
				setAuthState({
					isLoading: false,
					isAuthenticated: true,
					user: cachedUser,
					error: null,
				});
			}

			try {
				const userData = await userService.getAccount();
				await UserStorage.setUser(userData);

				setAuthState({
					isLoading: false,
					isAuthenticated: true,
					user: userData,
					error: null,
				});
			} catch (error: any) {
				setAuthState({
					isLoading: false,
					isAuthenticated: false,
					user: null,
					error: error.message || "Authentication failed",
				});
			}
		} catch (error: any) {
			setAuthState({
				isLoading: false,
				isAuthenticated: false,
				user: null,
				error: error.message || "Failed to check authentication status",
			});
		}
	};

	const login = async (email: string, password: string) => {
		try {
			const response = await authService.login({ email, password });
			await TokenStorage.saveToken(response.token);

			const userData = await userService.getAccount();
			await UserStorage.setUser(userData);

			setAuthState({
				isLoading: false,
				isAuthenticated: true,
				user: userData,
				error: null,
			});

			router.replace("/(app)/accounts");
			return { success: true };
		} catch (error: any) {
			const errorMessage = error.response?.data?.message || "Login failed";
			setAuthState((prev) => ({ ...prev, error: errorMessage }));
			return { success: false, error: errorMessage };
		}
	};

	const logout = async () => {
		setAuthState({
			isLoading: true,
			isAuthenticated: false,
			user: null,
			error: null,
		});

		await authService.logout();

		setAuthState({
			isLoading: false,
			isAuthenticated: false,
			user: null,
			error: null,
		});
	};

	const refreshUserData = async () => {
		if (!authState.isAuthenticated) return;

		try {
			const userData = await userService.getAccount();
			await UserStorage.setUser(userData);
			setAuthState((prev) => ({ ...prev, user: userData }));
		} catch (error) {
			console.error("Failed to refresh user data:", error);
		}
	};

	return {
		...authState,
		login,
		logout,
		refreshUserData,
		checkAuthStatus,
	};
};
