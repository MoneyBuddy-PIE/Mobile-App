import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator,
	ScrollView,
	SafeAreaView,
	RefreshControl,
} from "react-native";
import { useFonts } from "expo-font";
import { DMSans_700Bold, DMSans_400Regular, DMSans_600SemiBold } from "@expo-google-fonts/dm-sans";
import { router } from "expo-router";
import { TokenStorage, UserStorage } from "@/utils/storage";
import { Account, SubAccount } from "@/types/Account";
import { useAuthContext } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { logger } from "@/utils/logger";

export default function Accounts() {
	const { logout, user: contextUser, refreshUserData } = useAuthContext();
	const [user, setUser] = useState<Account | null>(contextUser);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	const [fontsLoaded] = useFonts({
		DMSans_700Bold,
		DMSans_400Regular,
		DMSans_600SemiBold,
	});

	const fontStylesTitle = fontsLoaded ? { fontFamily: "DMSans_700Bold" } : {};
	const fontStylesRegular = fontsLoaded ? { fontFamily: "DMSans_400Regular" } : {};
	const fontStylesSemiBold = fontsLoaded ? { fontFamily: "DMSans_600SemiBold" } : {};

	useEffect(() => {
		loadUserProfile();
	}, []);

	useEffect(() => {
		logger.log("Context user updated:", contextUser);
		setUser(contextUser);
	}, [contextUser]);

	const loadUserProfile = async () => {
		try {
			await refreshUserData();
		} catch (error) {
			console.error("Error loading profile:", error);
		} finally {
			setLoading(false);
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		try {
			await refreshUserData();
		} catch (error) {
			console.error("Error refreshing profile:", error);
		} finally {
			setRefreshing(false);
		}
	};

	const navigateToAccount = async (account: SubAccount) => {
		if (account.role === "CHILD") {
			try {
				const response = await authService.subAccountLogin(account.id, undefined);
				await TokenStorage.setSubAccountToken(response.token);
				const accountDetails = await userService.getSubAccount();
				await UserStorage.setSubAccount(accountDetails);
				await UserStorage.setSubAccountId(account.id);

				router.replace("/(app)/home/child");
			} catch (error) {
				console.error("Error navigating to sub-account:", error);
			}
		} else {
			router.push({
				pathname: "/(app)/accounts/pin-entry",
				params: {
					accountId: account.id,
					accountName: account.name,
				},
			});
		}
	};

	const getRoleIcon = (role: string) => {
		switch (role.toUpperCase()) {
			case "PARENT":
			case "OWNER":
				return "🍎";
			case "CHILD":
				return "🔸";
			case "ADMIN":
				return "👑";
			default:
				return "👤";
		}
	};

	const getRoleDisplayName = (role: string) => {
		switch (role.toUpperCase()) {
			case "OWNER":
				return "Parent";
			case "PARENT":
				return "Parent";
			case "CHILD":
				return "Enfant";
			case "ADMIN":
				return "Admin";
			default:
				return role;
		}
	};

	const getRoleBadgeColor = (role: string) => {
		switch (role.toUpperCase()) {
			case "PARENT":
			case "OWNER":
				return "#4A90E2";
			case "CHILD":
				return "#00D4AA";
			case "ADMIN":
				return "#FF9800";
			default:
				return "#666";
		}
	};

	if (loading) {
		return (
			<View style={[styles.container, styles.center]}>
				<ActivityIndicator size="large" color="#6C5CE7" />
				<Text style={[styles.loadingText, fontStylesRegular]}>Chargement des comptes...</Text>
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView
				style={styles.content}
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C5CE7" />}
			>
				{/* Header */}
				<View style={styles.header}>
					<Text style={[styles.title, fontStylesTitle]}>Qui se connecte ?</Text>
					<Text style={[styles.subtitle, fontStylesRegular]}>
						Chaque profil a son propre tableau de bord et ses propres missions !
					</Text>
				</View>

				{/* Account Cards */}
				<View style={styles.cardsContainer}>
					{user?.subAccounts && user.subAccounts.length > 0 ? (
						user.subAccounts.map((account) => (
							<TouchableOpacity
								key={account.id}
								style={styles.accountCard}
								onPress={() => navigateToAccount(account)}
								activeOpacity={0.7}
							>
								<View style={styles.iconContainer}>
									<Text style={styles.accountIcon}>{getRoleIcon(account.role)}</Text>
								</View>

								<Text style={[styles.accountName, fontStylesSemiBold]}>{account.name}</Text>

								<View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(account.role) }]}>
									<Text style={[styles.roleText, fontStylesSemiBold]}>
										{getRoleDisplayName(account.role)}
									</Text>
								</View>
							</TouchableOpacity>
						))
					) : (
						<View style={styles.emptyState}>
							<Text style={[styles.emptyTitle, fontStylesTitle]}>Aucun compte trouvé</Text>
							<Text style={[styles.emptyText, fontStylesRegular]}>
								Vous n'avez pas encore de sous-comptes. Créez-en un pour commencer.
							</Text>
						</View>
					)}
				</View>

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
		paddingTop: 60,
		paddingBottom: 40,
		alignItems: "center",
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 12,
		textAlign: "center",
	},
	subtitle: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		lineHeight: 22,
		paddingHorizontal: 20,
	},
	cardsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		gap: 16,
	},
	accountCard: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 24,
		alignItems: "center",
		width: "47%",
		minHeight: 160,
		justifyContent: "space-between",
		shadowColor: "#BFD0EA",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
	},
	iconContainer: {
		width: 60,
		height: 60,
		borderRadius: 16,
		backgroundColor: "#f8f9fa",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 16,
	},
	accountIcon: {
		fontSize: 32,
	},
	accountName: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		textAlign: "center",
		marginBottom: 12,
	},
	roleBadge: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 12,
		minWidth: 80,
		alignItems: "center",
	},
	roleText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "600",
	},
	emptyState: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 40,
		alignItems: "center",
		width: "100%",
		marginTop: 40,
	},
	emptyTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 12,
		textAlign: "center",
	},
	emptyText: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		lineHeight: 22,
	},
	bottomPadding: {
		height: 40,
	},
});
