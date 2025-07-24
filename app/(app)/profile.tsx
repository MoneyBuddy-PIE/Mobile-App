import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from "react-native";
import { useFonts } from "expo-font";
import { DMSans_700Bold, DMSans_400Regular, DMSans_600SemiBold } from "@expo-google-fonts/dm-sans";
import { Ionicons } from "@expo/vector-icons";
import { useAuthContext } from "@/contexts/AuthContext";
import { UserStorage } from "@/utils/storage";
import { SubAccount } from "@/types/Account";
import { Link } from "expo-router";

export default function Profile() {
	const { user, logout } = useAuthContext();
	const [subAccount, setSubAccount] = useState<SubAccount | null>(null);

	const [fontsLoaded] = useFonts({
		DMSans_700Bold,
		DMSans_400Regular,
		DMSans_600SemiBold,
	});

	const fontStylesTitle = fontsLoaded ? { fontFamily: "DMSans_700Bold" } : {};
	const fontStylesRegular = fontsLoaded ? { fontFamily: "DMSans_400Regular" } : {};
	const fontStylesSemiBold = fontsLoaded ? { fontFamily: "DMSans_600SemiBold" } : {};

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
		Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
			{ text: "Annuler", style: "cancel" },
			{ text: "Déconnexion", style: "destructive", onPress: logout },
		]);
	};

	const isChildAccount = subAccount?.role === "CHILD";

	const getRoleIcon = (role: string) => {
		switch (role?.toUpperCase()) {
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
		switch (role?.toUpperCase()) {
			case "OWNER":
				return "Parent principal";
			case "PARENT":
				return "Parent";
			case "CHILD":
				return "Enfant";
			case "ADMIN":
				return "Administrateur";
			default:
				return role || "Utilisateur";
		}
	};

	const getRoleBadgeColor = (role: string) => {
		switch (role?.toUpperCase()) {
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

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={[styles.title, fontStylesTitle]}>Mon profil</Text>
					<Text style={[styles.subtitle, fontStylesRegular]}>Gérez votre compte et vos préférences</Text>
				</View>

				{/* Profil actuel */}
				{subAccount && (
					<View style={styles.profileCard}>
						<View style={styles.profileHeader}>
							<View style={styles.avatarContainer}>
								<Text style={styles.avatarIcon}>{getRoleIcon(subAccount.role)}</Text>
							</View>
							<View style={styles.profileInfo}>
								<Text style={[styles.profileName, fontStylesTitle]}>{subAccount.name}</Text>
								<View
									style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(subAccount.role) }]}
								>
									<Text style={[styles.roleText, fontStylesSemiBold]}>
										{getRoleDisplayName(subAccount.role)}
									</Text>
								</View>
							</View>
						</View>

						{subAccount.role === "CHILD" && (
							<View style={styles.moneyContainer}>
								<Text style={[styles.moneyLabel, fontStylesRegular]}>Mon argent de poche</Text>
								<Text style={[styles.moneyAmount, fontStylesTitle]}>
									{parseFloat(subAccount.money || "0").toFixed(2)}€
								</Text>
							</View>
						)}
					</View>
				)}

				{/* Informations du compte principal */}
				{!isChildAccount && user && (
					<View style={styles.section}>
						<Text style={[styles.sectionTitle, fontStylesTitle]}>Compte principal</Text>
						<View style={styles.infoCard}>
							<View style={styles.infoRow}>
								<Text style={[styles.infoLabel, fontStylesRegular]}>Email</Text>
								<Text style={[styles.infoValue, fontStylesSemiBold]}>{user.email}</Text>
							</View>
							<View style={styles.infoRow}>
								<Text style={[styles.infoLabel, fontStylesRegular]}>Plan</Text>
								<Text style={[styles.infoValue, fontStylesSemiBold]}>{user.planType || "Gratuit"}</Text>
							</View>
							<View style={styles.infoRow}>
								<Text style={[styles.infoLabel, fontStylesRegular]}>Sous-comptes</Text>
								<Text style={[styles.infoValue, fontStylesSemiBold]}>
									{user.subAccounts?.length || 0}
								</Text>
							</View>
							<View style={styles.infoRow}>
								<Text style={[styles.infoLabel, fontStylesRegular]}>Membre depuis</Text>
								<Text style={[styles.infoValue, fontStylesSemiBold]}>
									{new Date(user.createdAt).toLocaleDateString("fr-FR")}
								</Text>
							</View>
						</View>
					</View>
				)}

				{/* Actions */}
				<View style={styles.section}>
					<Text style={[styles.sectionTitle, fontStylesTitle]}>Actions</Text>
					<View style={styles.actionsContainer}>
						{!isChildAccount && (
							<Link href="/accounts/create" asChild>
								<TouchableOpacity style={styles.actionItem}>
									<View style={styles.actionIcon}>
										<Ionicons name="person-add" size={20} color="#6C5CE7" />
									</View>
									<Text style={[styles.actionText, fontStylesSemiBold]}>Créer un compte</Text>
									<Ionicons name="chevron-forward" size={16} color="#999" />
								</TouchableOpacity>
							</Link>
						)}

						<Link href="/accounts" asChild replace>
							<TouchableOpacity style={styles.actionItem}>
								<View style={styles.actionIcon}>
									<Ionicons name="swap-horizontal" size={20} color="#6C5CE7" />
								</View>
								<Text style={[styles.actionText, fontStylesSemiBold]}>Changer de compte</Text>
								<Ionicons name="chevron-forward" size={16} color="#999" />
							</TouchableOpacity>
						</Link>

						<TouchableOpacity style={styles.actionItem}>
							<View style={styles.actionIcon}>
								<Ionicons name="help-circle" size={20} color="#6C5CE7" />
							</View>
							<Text style={[styles.actionText, fontStylesSemiBold]}>Aide et support</Text>
							<Ionicons name="chevron-forward" size={16} color="#999" />
						</TouchableOpacity>

						<TouchableOpacity style={styles.actionItem}>
							<View style={styles.actionIcon}>
								<Ionicons name="document-text" size={20} color="#6C5CE7" />
							</View>
							<Text style={[styles.actionText, fontStylesSemiBold]}>Conditions d'utilisation</Text>
							<Ionicons name="chevron-forward" size={16} color="#999" />
						</TouchableOpacity>

						<TouchableOpacity style={styles.actionItem}>
							<View style={styles.actionIcon}>
								<Ionicons name="shield-checkmark" size={20} color="#6C5CE7" />
							</View>
							<Text style={[styles.actionText, fontStylesSemiBold]}>Politique de confidentialité</Text>
							<Ionicons name="chevron-forward" size={16} color="#999" />
						</TouchableOpacity>
					</View>
				</View>

				{/* Zone de déconnexion */}
				<View style={styles.logoutSection}>
					<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
						<Ionicons name="log-out" size={20} color="#FF6B6B" />
						<Text style={[styles.logoutText, fontStylesSemiBold]}>Se déconnecter</Text>
					</TouchableOpacity>
				</View>

				{/* Version */}
				<View style={styles.versionContainer}>
					<Text style={[styles.versionText, fontStylesRegular]}>MoneyBuddy v1.0.0</Text>
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
	header: {
		paddingTop: 60,
		paddingBottom: 30,
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: "#666",
		lineHeight: 22,
	},
	profileCard: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 20,
		marginBottom: 30,
		shadowColor: "#BFD0EA",
		shadowOffset: {
			width: 0,
			height: 3.89,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
	},
	profileHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 16,
	},
	avatarContainer: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: "#f0f8ff",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 16,
	},
	avatarIcon: {
		fontSize: 28,
	},
	profileInfo: {
		flex: 1,
	},
	profileName: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 8,
	},
	roleBadge: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 12,
		alignSelf: "flex-start",
	},
	roleText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "600",
	},
	moneyContainer: {
		backgroundColor: "#f8f9fa",
		borderRadius: 12,
		padding: 16,
		alignItems: "center",
	},
	moneyLabel: {
		fontSize: 14,
		color: "#666",
		marginBottom: 4,
	},
	moneyAmount: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#6C5CE7",
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
	infoCard: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 20,
		shadowColor: "#BFD0EA",
		shadowOffset: {
			width: 0,
			height: 3.89,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
	},
	infoRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
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
	actionsContainer: {
		backgroundColor: "#fff",
		borderRadius: 16,
		overflow: "hidden",
		shadowColor: "#BFD0EA",
		shadowOffset: {
			width: 0,
			height: 3.89,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
	},
	actionItem: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
	},
	actionIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#f0f8ff",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	actionText: {
		flex: 1,
		fontSize: 16,
		fontWeight: "500",
		color: "#333",
	},
	logoutSection: {
		marginBottom: 30,
	},
	logoutButton: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 16,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 12,
		borderWidth: 1,
		borderColor: "#FFE5E5",
		shadowColor: "#BFD0EA",
		shadowOffset: {
			width: 0,
			height: 3.89,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
	},
	logoutText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#FF6B6B",
	},
	versionContainer: {
		alignItems: "center",
		marginBottom: 20,
	},
	versionText: {
		fontSize: 12,
		color: "#999",
	},
	bottomPadding: {
		height: 20,
	},
});
