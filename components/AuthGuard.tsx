import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { router, useSegments } from "expo-router";
import { useAuthContext } from "@/contexts/AuthContext";

interface AuthGuardProps {
	children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
	const { isLoading, isAuthenticated } = useAuthContext();
	const segments = useSegments();

	useEffect(() => {
		if (isLoading) return;

		const inAuthGroup = segments[0] === "(auth)";
		const inAppGroup = segments[0] === "(app)";
		const isRootIndex = segments[0] === "index";

		if (!isAuthenticated && inAppGroup) {
			console.log("User not authenticated, redirecting to login...");
			router.replace("/(auth)/login");
		} else if (isAuthenticated && (inAuthGroup || isRootIndex)) {
			console.log("User authenticated, redirecting to accounts...");
			router.replace("/(app)/accounts");
		}
	}, [isLoading, isAuthenticated, segments]);

	if (isLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#007AFF" />
				<Text style={styles.loadingText}>Checking authentication...</Text>
			</View>
		);
	}

	if (!isAuthenticated && segments[0] === "(app)") {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#007AFF" />
			</View>
		);
	}

	return <>{children}</>;
};

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#fff",
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: "#666",
	},
});
