import { useEffect } from "react";
import { router } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { TokenStorage, UserStorage } from "../utils/storage";

export default function Index() {
	useEffect(() => {
		checkAuthState();
	}, []);

	const checkAuthState = async () => {
		try {
			const token = await TokenStorage.getToken();
			if (token) {
				// Check if user has selected an account
				const selectedAccountId = await UserStorage.getSubAccountId();
				if (selectedAccountId) {
					router.replace("/(app)/home");
				} else {
					router.replace("/(app)/accounts");
				}
			} else {
				router.replace("/(auth)/login");
			}
		} catch (error) {
			router.replace("/(auth)/login");
		}
	};

	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<ActivityIndicator size="large" />
			<Text>Loading...</Text>
		</View>
	);
}
