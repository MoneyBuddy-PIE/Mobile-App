import { apiService } from "./api";
import { Account, SubAccount } from "@/types/Account";

export const userService = {
	async getAccount(): Promise<Account> {
		return apiService.get<Account>("/auth/me");
	},

	async getSubAccount(): Promise<SubAccount> {
		return apiService.get<SubAccount>("/auth/subAccount/me");
	},

	async verifyUser(): Promise<boolean> {
		try {
			await this.getAccount();

			return true;
		} catch (error: any) {
			console.log("Token verification failed:", error.response?.status);

			if (error.response?.status === 401 || error.response?.status === 403) {
				return false;
			}

			return false;
		}
	},
};
