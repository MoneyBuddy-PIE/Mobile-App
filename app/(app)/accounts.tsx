import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { router } from "expo-router";
import { TokenStorage, UserStorage } from "../../utils/storage";
import { userService } from "../../services/userService";
import { Account } from "../../types/Account";
import { authService } from "../../services/authService";

export default function Accounts() {
	const [user, setUser] = useState<Account | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadUserProfile();
	}, []);

	const loadUserProfile = async () => {
		try {
			const userData = await userService.getAccount();
			setUser(userData);
			await UserStorage.setUser(userData);
		} catch (error) {
			console.error("Error loading profile:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		await authService.logout();
	};

	const navigateToAccount = async (accountId: string) => {
		await UserStorage.setSubAccountId(accountId);
		router.replace("/(app)/home");
	};

	if (loading) {
		return (
			<View style={[styles.container, styles.center]}>
				<ActivityIndicator size="large" />
				<Text>Loading...</Text>
			</View>
		);
	}

	return <></>
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#fff",
	},
	center: {
		justifyContent: "center",
		alignItems: "center",
	},
})