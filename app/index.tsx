import { useEffect } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuthContext } from "@/contexts/AuthContext";

export default function Index() {
	const { isLoading, isAuthenticated } = useAuthContext();

	useEffect(() => {
		if (!isLoading) {
			if (isAuthenticated) {
				router.replace("/(app)/accounts");
			}
		}
	}, [isLoading, isAuthenticated]);

	if (isLoading) {
		return (
			<View style={[styles.container, styles.center]}>
				<ActivityIndicator size="large" color="#007AFF" />
				<Text style={styles.loadingText}>Loading...</Text>
			</View>
		);
	}

	const navigateToLogin = () => {
		router.push("/(auth)/login");
	};

	const navigateToSignUp = () => {
		router.push("/(auth)/register");
	};

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<View style={styles.header}>
					<Text style={styles.title}>Welcome to MoneyBuddy</Text>
					<Text style={styles.subtitle}>Manage your finances with ease</Text>
				</View>

				<View style={styles.buttonContainer}>
					<TouchableOpacity style={styles.primaryButton} onPress={navigateToLogin}>
						<Text style={styles.primaryButtonText}>Login</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.secondaryButton} onPress={navigateToSignUp}>
						<Text style={styles.secondaryButtonText}>Sign Up</Text>
					</TouchableOpacity>
				</View>
			</View>

			<View style={styles.footer}>
				<Text style={styles.footerText}>Secure • Simple • Smart</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	center: {
		justifyContent: "center",
		alignItems: "center",
	},
	content: {
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: 40,
	},
	header: {
		alignItems: "center",
		marginBottom: 60,
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#333",
		textAlign: "center",
		marginBottom: 16,
	},
	subtitle: {
		fontSize: 18,
		color: "#666",
		textAlign: "center",
		lineHeight: 24,
	},
	buttonContainer: {
		gap: 16,
	},
	primaryButton: {
		backgroundColor: "#007AFF",
		paddingVertical: 16,
		paddingHorizontal: 32,
		borderRadius: 12,
		alignItems: "center",
	},
	primaryButtonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "600",
	},
	secondaryButton: {
		backgroundColor: "transparent",
		paddingVertical: 16,
		paddingHorizontal: 32,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: "#007AFF",
		alignItems: "center",
	},
	secondaryButtonText: {
		color: "#007AFF",
		fontSize: 18,
		fontWeight: "600",
	},
	footer: {
		paddingBottom: 50,
		alignItems: "center",
	},
	footerText: {
		fontSize: 14,
		color: "#999",
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: "#666",
	},
});
