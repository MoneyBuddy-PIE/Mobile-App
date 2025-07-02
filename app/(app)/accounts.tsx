import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { UserStorage } from "@/utils/storage";
import { Account } from "@/types/Account";
import { useAuthContext } from "@/contexts/AuthContext";
import AccountCard from "@/components/AccountCard";

export default function Accounts() {
	const { logout, user: contextUser, refreshUserData } = useAuthContext();
	const [user, setUser] = useState<Account | null>(contextUser);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (contextUser) {
			setUser(contextUser);
		} else {
			// Sinon on le charge
			loadUserProfile();
		}
	}, [contextUser]);

	const loadUserProfile = async () => {
		setLoading(true);
		try {
			await refreshUserData();
		} catch (error) {
			console.error("Error loading profile:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		await logout();
	};

	const navigateToAccount = async (accountId: string) => {
		await UserStorage.setSubAccountId(accountId);
		router.replace("/(app)/home");
	};

	if (loading) {
		return (
			<View style={[styles.container, styles.center]}>
				<ActivityIndicator size="large" color="#007AFF" />
				<Text style={styles.loadingText}>Loading accounts...</Text>
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Header avec bouton logout */}
				<View style={styles.header}>
					<View>
						<Text style={styles.title}>Your Accounts</Text>
						<Text style={styles.subtitle}>Welcome back, {user?.username || "User"}</Text>
					</View>
					<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
						<Text style={styles.logoutText}>Logout</Text>
					</TouchableOpacity>
				</View>

				{/* Sub Accounts Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Sub-Accounts ({user?.subAccounts?.length || 0})</Text>
					<Text style={styles.sectionSubtitle}>Select an account to continue</Text>
				</View>

				{/* Account Cards */}
				<View style={styles.cardsContainer}>
					{user?.subAccounts && user.subAccounts.length > 0 ? (
						user.subAccounts.map((account) => (
							<AccountCard
								key={account.id}
								account={account}
								onPress={() => navigateToAccount(account.id)}
							/>
						))
					) : (
						<View style={styles.emptyState}>
							<Text style={styles.emptyTitle}>No accounts found</Text>
							<Text style={styles.emptyText}>
								You don't have any sub-accounts yet. Create one to get started.
							</Text>
						</View>
					)}
				</View>

				{/* Add some bottom padding */}
				<View style={styles.bottomPadding} />
			</ScrollView>
		</SafeAreaView>
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
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		paddingTop: 20,
		paddingBottom: 24,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 16,
		color: "#666",
	},
	logoutButton: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		backgroundColor: "#fff",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#ddd",
	},
	logoutText: {
		fontSize: 14,
		color: "#f44336",
		fontWeight: "600",
	},
	section: {
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 22,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 4,
	},
	sectionSubtitle: {
		fontSize: 16,
		color: "#666",
	},
	cardsContainer: {
		gap: 16,
		marginBottom: 20,
	},
	emptyState: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 40,
		alignItems: "center",
		marginBottom: 20,
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 8,
	},
	emptyText: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		lineHeight: 22,
	},
	addCard: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 20,
		alignItems: "center",
		borderWidth: 2,
		borderColor: "#007AFF",
		borderStyle: "dashed",
	},
	addIconContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: "#007AFF",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 12,
	},
	addIcon: {
		fontSize: 24,
		color: "#fff",
		fontWeight: "bold",
	},
	addCardTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#007AFF",
	},
	bottomPadding: {
		height: 40,
	},
});
