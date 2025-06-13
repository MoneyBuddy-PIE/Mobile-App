import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { TokenStorage, UserStorage } from "../../utils/storage";
import { authService } from "../../services/authService";
import { userService } from "../../services/userService";

export default function Home() {
	const [selectedAccountId, setSelectedAccountId] = useState<string>("");

	useEffect(() => {
		loadSelectedAccount();
	}, []);

	const loadSelectedAccount = async () => {
		try {
			const accountId = await UserStorage.getSubAccountId();

			if (!accountId) {
				router.replace("/(app)/accounts");
				return;
			}

			setSelectedAccountId(accountId);

            const accountToken = await authService.subAccountLogin(accountId, "1234");
            await TokenStorage.setSubAccountToken(accountToken.token);

            if (!accountToken) {
                router.replace("/(app)/accounts");
                return;
            }

            const accountDetails = await userService.getSubAccount();
            await UserStorage.setSubAccount(accountDetails);
        } catch (error) {
			console.error("Error loading selected account:", error);
			router.replace("/(app)/accounts");
		}
	};

	const switchAccount = () => {
		router.push("/(app)/accounts");
	};

	const handleLogout = async () => {
		await authService.logout();
	};

	return <></>;
}
