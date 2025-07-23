import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { useAuthContext } from "@/contexts/AuthContext";
import { UserStorage } from "@/utils/storage";
import { SubAccount } from "@/types/Account";
import { Link } from "expo-router";

export default function Profile() {
	const { user, logout } = useAuthContext();
	const [subAccount, setSubAccount] = useState<SubAccount | null>(null);

	useEffect(() => {
		loadSubAccount();
	}, []);

	const loadSubAccount = async () => {
		try {
			const subAccountData = await UserStorage.getSubAccount();
			setSubAccount(subAccountData);
		} catch (error) {
			console.error("Error loading sub-account:", error);
		}
	};

	const handleLogout = async () => {
		await logout();
	};

	const isChildAccount = subAccount?.role === "CHILD";

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.title}>Profile</Text>
				</View>

				{/* Sub Account Info */}
				{subAccount && (
					<View style={styles.card}>
						<Text style={styles.cardTitle}>Current Account</Text>
						<View style={styles.infoRow}>
							<Text style={styles.infoLabel}>Name</Text>
							<Text style={styles.infoValue}>{subAccount.name}</Text>
						</View>
						<View style={styles.infoRow}>
							<Text style={styles.infoLabel}>Role</Text>
							<Text style={styles.infoValue}>{subAccount.role}</Text>
						</View>
					</View>
				)}

				{/* Main Account Info */}
				{!isChildAccount && (
					<View style={styles.card}>
						<Text style={styles.cardTitle}>Main Account</Text>
						<View style={styles.infoRow}>
							<Text style={styles.infoLabel}>Email</Text>
							<Text style={styles.infoValue}>{user?.email || "N/A"}</Text>
						</View>
						<View style={styles.infoRow}>
							<Text style={styles.infoLabel}>Username</Text>
							<Text style={styles.infoValue}>{user?.username || "N/A"}</Text>
						</View>
						<View style={styles.infoRow}>
							<Text style={styles.infoLabel}>Plan</Text>
							<Text style={styles.infoValue}>{user?.planType || "Free"}</Text>
						</View>
						<View style={styles.infoRow}>
							<Text style={styles.infoLabel}>Sub-accounts</Text>
							<Text style={styles.infoValue}>{user?.subAccounts?.length || 0}</Text>
						</View>
					</View>
				)}

				{/* Settings Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Settings</Text>

					{!isChildAccount && (
						<Link href={"/accounts/create"} asChild>
							<TouchableOpacity style={styles.menuItem}>
								<Text style={styles.menuItemText}>Create account</Text>
								<Text style={styles.menuItemIcon}>→</Text>
							</TouchableOpacity>
						</Link>
					)}
					<Link href={"/accounts"} asChild replace>
						<TouchableOpacity style={styles.menuItem}>
							<Text style={styles.menuItemText}>Switch Account</Text>
							<Text style={styles.menuItemIcon}>→</Text>
						</TouchableOpacity>
					</Link>

					<TouchableOpacity style={[styles.menuItem, styles.lastMenuItem]} onPress={handleLogout}>
						<Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
					</TouchableOpacity>
				</View>

				{/* Bottom padding */}
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
	header: {
		paddingTop: 20,
		paddingBottom: 24,
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#333",
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 20,
		marginBottom: 20,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 16,
	},
	infoRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 8,
	},
	infoLabel: {
		fontSize: 14,
		color: "#666",
	},
	infoValue: {
		fontSize: 14,
		fontWeight: "600",
		color: "#333",
	},
	activeStatus: {
		color: "#4CAF50",
	},
	section: {
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 12,
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
	lastMenuItem: {
		marginBottom: 0,
	},
	menuItemText: {
		fontSize: 16,
		fontWeight: "500",
		color: "#333",
	},
	menuItemIcon: {
		fontSize: 18,
		color: "#666",
	},
	logoutText: {
		color: "#f44336",
	},
	bottomPadding: {
		height: 20,
	},
});
