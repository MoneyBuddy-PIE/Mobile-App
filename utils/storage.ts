// utils/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Account, SubAccount } from "@/types/Account";

const STORAGE_KEYS = {
	TOKEN: "auth_token",
	REFRESH_TOKEN: "refresh_token",
	SUB_ACCOUNT_TOKEN: "sub_account_token",
	SUB_ACCOUNT_ID: "sub_account_id",
	SUB_ACCOUNT: "sub_account_data",
	USER: "user_data",
	REMEMBER_ME: "remember_me",
} as const;

export const TokenStorage = {
	async saveToken(token: string): Promise<void> {
		try {
			await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
		} catch (error) {
			console.error("Failed to save token:", error);
			throw new Error("Failed to save authentication data");
		}
	},

	async setToken(token: string): Promise<void> {
		return this.saveToken(token);
	},

	async getToken(): Promise<string | null> {
		try {
			return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
		} catch (error) {
			console.error("Failed to get token:", error);
			return null;
		}
	},

	async removeToken(): Promise<void> {
		try {
			await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
		} catch (error) {
			console.error("Failed to remove token:", error);
		}
	},

	async saveRefreshToken(refreshToken: string): Promise<void> {
		try {
			await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
		} catch (error) {
			console.error("Failed to save refresh token:", error);
			throw new Error("Failed to save refresh token");
		}
	},

	async getRefreshToken(): Promise<string | null> {
		try {
			return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
		} catch (error) {
			console.error("Failed to get refresh token:", error);
			return null;
		}
	},

	async saveSubAccountToken(token: string): Promise<void> {
		try {
			await AsyncStorage.setItem(STORAGE_KEYS.SUB_ACCOUNT_TOKEN, token);
		} catch (error) {
			console.error("Failed to save sub-account token:", error);
			throw new Error("Failed to save sub-account authentication data");
		}
	},

	async setSubAccountToken(token: string): Promise<void> {
		// Alias for saveSubAccountToken for consistency
		return this.saveSubAccountToken(token);
	},

	async getSubAccountToken(): Promise<string | null> {
		try {
			return await AsyncStorage.getItem(STORAGE_KEYS.SUB_ACCOUNT_TOKEN);
		} catch (error) {
			console.error("Failed to get sub-account token:", error);
			return null;
		}
	},

	async clear(): Promise<void> {
		try {
			await AsyncStorage.multiRemove([
				STORAGE_KEYS.TOKEN,
				STORAGE_KEYS.REFRESH_TOKEN,
				STORAGE_KEYS.SUB_ACCOUNT_TOKEN,
				STORAGE_KEYS.SUB_ACCOUNT_ID,
			]);
		} catch (error) {
			console.error("Failed to clear tokens:", error);
		}
	},
};

export const UserStorage = {
	async saveUser(user: Account): Promise<void> {
		try {
			await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
		} catch (error) {
			console.error("Failed to save user data:", error);
			throw new Error("Failed to save user data");
		}
	},

	async setUser(user: Account): Promise<void> {
		return this.saveUser(user);
	},

	async getUser(): Promise<Account | null> {
		try {
			const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
			return userData ? JSON.parse(userData) : null;
		} catch (error) {
			console.error("Failed to get user data:", error);
			return null;
		}
	},

	async clearUser(): Promise<void> {
		try {
			await AsyncStorage.removeItem(STORAGE_KEYS.USER);
		} catch (error) {
			console.error("Failed to clear user data:", error);
		}
	},

	// Sub-account methods
	async setSubAccountId(id: string): Promise<void> {
		try {
			await AsyncStorage.setItem(STORAGE_KEYS.SUB_ACCOUNT_ID, id);
		} catch (error) {
			console.error("Failed to save sub-account ID:", error);
			throw new Error("Failed to save sub-account ID");
		}
	},

	async getSubAccountId(): Promise<string | null> {
		try {
			return await AsyncStorage.getItem(STORAGE_KEYS.SUB_ACCOUNT_ID);
		} catch (error) {
			console.error("Failed to get sub-account ID:", error);
			return null;
		}
	},

	async setSubAccount(subAccount: SubAccount): Promise<void> {
		try {
			await AsyncStorage.setItem(STORAGE_KEYS.SUB_ACCOUNT, JSON.stringify(subAccount));
		} catch (error) {
			console.error("Failed to save sub-account data:", error);
			throw new Error("Failed to save sub-account data");
		}
	},

	async getSubAccount(): Promise<SubAccount | null> {
		try {
			const subAccountData = await AsyncStorage.getItem(STORAGE_KEYS.SUB_ACCOUNT);
			return subAccountData ? JSON.parse(subAccountData) : null;
		} catch (error) {
			console.error("Failed to get sub-account data:", error);
			return null;
		}
	},

	async clearSubAccount(): Promise<void> {
		try {
			await AsyncStorage.multiRemove([
				STORAGE_KEYS.SUB_ACCOUNT_ID,
				STORAGE_KEYS.SUB_ACCOUNT,
				STORAGE_KEYS.SUB_ACCOUNT_TOKEN,
			]);
		} catch (error) {
			console.error("Failed to clear sub-account data:", error);
		}
	},
};

export const PreferencesStorage = {
	async setRememberMe(value: boolean): Promise<void> {
		try {
			await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, JSON.stringify(value));
		} catch (error) {
			console.error("Failed to save remember me preference:", error);
		}
	},

	async getRememberMe(): Promise<boolean> {
		try {
			const value = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
			return value ? JSON.parse(value) : false;
		} catch (error) {
			console.error("Failed to get remember me preference:", error);
			return false;
		}
	},
};

export async function clear(): Promise<void> {
	try {
		const allKeys = await AsyncStorage.getAllKeys();

		const appKeys = allKeys.filter((key) => Object.values(STORAGE_KEYS).includes(key as any));

		if (appKeys.length > 0) {
			await AsyncStorage.multiRemove(appKeys);
		}
	} catch (error) {
		console.error("Failed to clear storage:", error);
		for (const key of Object.values(STORAGE_KEYS)) {
			try {
				await AsyncStorage.removeItem(key);
			} catch (err) {
				console.error(`Failed to remove ${key}:`, err);
			}
		}
	}
}

export async function debugStorage(): Promise<void> {
	if (__DEV__) {
		try {
			const allKeys = await AsyncStorage.getAllKeys();
			const allData = await AsyncStorage.multiGet(allKeys);
			console.log("=== Storage Debug ===");
			allData.forEach(([key, value]) => {
				console.log(`${key}: ${value}`);
			});
			console.log("==================");
		} catch (error) {
			console.error("Storage debug failed:", error);
		}
	}
}
