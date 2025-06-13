import { apiService } from "./api";
import { Account, SubAccount } from "../types/Account";

export const userService = {
	async getAccount(): Promise<Account> {
		return apiService.get<Account>("/auth/me");
	},

    async getSubAccount(): Promise<SubAccount> {
        return apiService.get<SubAccount>("/auth/subAccount/me");
    }
};
