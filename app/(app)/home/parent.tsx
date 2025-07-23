import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Link, router } from "expo-router";
import { TokenStorage, UserStorage } from "@/utils/storage";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { SubAccount } from "@/types/Account";

export default function Home() {
	const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
	const [loading, setLoading] = useState(true);

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

			const accountToken = await authService.subAccountLogin(accountId, "1234");
			await TokenStorage.setSubAccountToken(accountToken.token);

			if (!accountToken) {
				router.replace("/(app)/accounts");
				return;
			}

			const accountDetails = await userService.getSubAccount();
			await UserStorage.setSubAccount(accountDetails);
			setSubAccount(accountDetails);
		} catch (error) {
			console.error("Error loading selected account:", error);
			router.replace("/(app)/accounts");
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<View style={[styles.container, styles.center]}>
				<ActivityIndicator size="large" color="#007AFF" />
				<Text style={styles.loadingText}>Loading account...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View style={styles.header}>
					<View>
						<Text style={styles.nameText}>{subAccount?.name || "User"}</Text>
						<Text style={styles.roleText}>{subAccount?.role || "Member"} Account</Text>
					</View>
				</View>

				{/* Quick Actions */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Quick Actions</Text>
					<View style={styles.actionGrid}>
						<Link href={"/tasks/parent"} asChild>
							<TouchableOpacity style={styles.actionCard}>
								<Text style={styles.actionIcon}>💰</Text>
								<Text style={styles.actionText}>Add Tasks</Text>
							</TouchableOpacity>
						</Link>
						<TouchableOpacity style={styles.actionCard}>
							<Text style={styles.actionIcon}>💸</Text>
							<Text style={styles.actionText}>Add Expense</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.actionCard}>
							<Text style={styles.actionIcon}>📊</Text>
							<Text style={styles.actionText}>View Reports</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.actionCard}>
							<Text style={styles.actionIcon}>🎯</Text>
							<Text style={styles.actionText}>Set Goals</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f9fa",
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	center: {
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 12,
		fontSize: 16,
		color: "#666",
	},
	header: {
		paddingTop: 60,
		paddingBottom: 30,
	},
	welcomeText: {
		fontSize: 18,
		color: "#666",
		marginBottom: 4,
	},
	nameText: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 4,
	},
	roleText: {
		fontSize: 16,
		color: "#007AFF",
		fontWeight: "600",
	},
	section: {
		marginBottom: 30,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 16,
	},
	actionGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
	},
	actionCard: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 20,
		width: "48%",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	actionIcon: {
		fontSize: 32,
		marginBottom: 8,
	},
	actionText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#333",
		textAlign: "center",
	},
	menuItem: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	menuItemText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
	},
	menuItemIcon: {
		fontSize: 18,
		color: "#666",
	},
	logoutText: {
		color: "#f44336",
	},
});
