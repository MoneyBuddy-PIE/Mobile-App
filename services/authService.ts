import { apiService } from "./api";
import { LoginRequest, RegisterRequest, AuthResponse, SubAccountRegisterRequest } from "@/types/api";
import { clear } from "@/utils/storage";
import { router } from "expo-router";
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const authService = {
	async login(credentials: LoginRequest): Promise<AuthResponse> {
		return apiService.post<AuthResponse>("/auth/login", credentials);
	},

	async register(data: RegisterRequest): Promise<AuthResponse> {
		return apiService.post<AuthResponse>("/auth/register", data);
	},

	async logout(refreshToken: string): Promise<void> {
		try {
			await apiService.post("/auth/logout", {refreshToken});
			await clear();
			router.replace("/(auth)/login");
		} catch (error) {
			console.error("Logout error:", error);
			router.replace("/(auth)/login");
		}
	},

	async silentLogout(): Promise<void> {
		try {
			await clear();
		} catch (error) {
			console.error("Silent logout error:", error);
		}
	},

	async subAccountLogin(subAccountId: string, pin?: string): Promise<any> {
		return apiService.post<any>("/auth/subAccount/login", {
			id: subAccountId,
			...(pin && { pin }),
		});
	},

	async subAccountRegister(data: SubAccountRegisterRequest): Promise<any> {
		return apiService.post<any>("/subAccount", data);
	},

	async refreshUserData(): Promise<void> {
		try {
			await apiService.get("/auth/me");
		} catch (error) {
			console.error("Failed to refresh user data:", error);
		}
	},

	async refreshToken(refreshToken: string): Promise<AuthResponse> {
		return await apiService.get<AuthResponse>("/auth/me", {refreshToken});
	}
};

export const signInWithGoogle = async () => {

	GoogleSignin.configure({
  webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
});

  await GoogleSignin.hasPlayServices();

  const userInfo = await GoogleSignin.signIn();

  return {
    idToken: userInfo.data?.idToken,
    user: userInfo.data?.user,
  };
};

export const signOutGoogle = async () => {
  await GoogleSignin.signOut();
};
