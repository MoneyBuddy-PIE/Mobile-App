import AsyncStorage from "@react-native-async-storage/async-storage";
import { Account, SubAccount } from "../types/Account";

export const TokenStorage = {
    async setToken(token: string) {
        await AsyncStorage.setItem("authToken", token);
    },

    async getToken(): Promise<string | null> {
        return await AsyncStorage.getItem("authToken");
    },

    async removeToken() {
        await AsyncStorage.removeItem("authToken");
    },

    async setSubAccountToken(token: string) {
        await AsyncStorage.setItem("subAccountToken", token);
    },  

    async getSubAccountToken(): Promise<string | null> {
        return await AsyncStorage.getItem("subAccountToken");
    },

    async removeSubAccountToken() {
        await AsyncStorage.removeItem("subAccountToken");
    }
};

export const UserStorage = {
    async setUser(user: Account) {
        await AsyncStorage.setItem("user", JSON.stringify(user));
    },

    async getUser(): Promise<object | null> {
        const user = await AsyncStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    },

    async removeUser() {
        await AsyncStorage.removeItem("user");
    },

    async setSubAccountId(subAccountId: string) {
        await AsyncStorage.setItem("subAccountId", subAccountId);
    },

    async getSubAccountId(): Promise<string | null> {
        return await AsyncStorage.getItem("subAccountId");
    },

    async removeSubAccountId() {
        await AsyncStorage.removeItem("subAccountId");
    },

    async setSubAccount(subAccount: SubAccount) {
        await AsyncStorage.setItem("subAccount", JSON.stringify(subAccount));
    },

    async getSubAccount(): Promise<SubAccount | null> {
        const subAccount = await AsyncStorage.getItem("subAccount");
        return subAccount ? JSON.parse(subAccount) : null;
    },

    async removeSubAccount() {
        await AsyncStorage.removeItem("subAccount");
    }
};

export const clear = async () => {
    await AsyncStorage.clear();
    await TokenStorage.removeToken();
    await UserStorage.removeUser();
    await UserStorage.removeSubAccountId();
    await UserStorage.removeSubAccount();
    await TokenStorage.removeSubAccountToken();
    console.log("All storage cleared");
}