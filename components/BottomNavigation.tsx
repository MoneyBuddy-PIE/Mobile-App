import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { usePathname, Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { UserStorage } from "@/utils/storage";
import { SubAccount } from "@/types/Account";

interface NavItem {
	route: string;
	label: string;
	iconName: keyof typeof Ionicons.glyphMap;
	iconNameActive: keyof typeof Ionicons.glyphMap;
}

export const BottomNavigation: React.FC = () => {
	const pathname = usePathname();
	const insets = useSafeAreaInsets();
	const [subAccount, setSubAccount] = useState<SubAccount | null>(null);

	useEffect(() => {
		loadSubAccount();
	}, []);

	const loadSubAccount = async () => {
		try {
			const accountData = await UserStorage.getSubAccount();
			setSubAccount(accountData);
		} catch (error) {
			console.error("Error loading sub-account:", error);
		}
	};

	// Définir les routes en fonction du rôle du sous-compte
	const getNavItems = (): NavItem[] => {
		const homeRoute = subAccount?.role === "CHILD" ? "/(app)/home/child" : "/(app)/home/parent";

		const baseNavItems: NavItem[] = [
			{
				route: homeRoute,
				label: "Home",
				iconName: "home-outline",
				iconNameActive: "home",
			},

			{
				route: "/(app)/profile",
				label: "Profile",
				iconName: "person-outline",
				iconNameActive: "person",
			},
		];

		if (subAccount?.role === "CHILD") {
			// Pour les enfants : ajouter l'onglet Revenus
			baseNavItems.splice(1, 0, {
				route: "/(app)/revenus",
				label: "Revenus",
				iconName: "wallet-outline",
				iconNameActive: "wallet",
			});
		} else {
			// Pour les parents : ajouter l'onglet Enfants
			baseNavItems.splice(
				1,
				0,
				{
					route: "/(app)/children",
					label: "Enfants",
					iconName: "people-outline",
					iconNameActive: "people",
				},
				{
					route: "/(app)/courses",
					label: "Cours",
					iconName: "book-outline",
					iconNameActive: "book",
				}
			);
		}

		return baseNavItems;
	};

	const navItems = getNavItems();

	const isActive = (route: string) => {
		const cleanPath = route.replace("/(app)", "");
		return pathname === route || pathname === cleanPath || pathname.startsWith(cleanPath + "/");
	};

	return (
		<View style={[styles.container, { paddingBottom: insets.bottom || 20 }]}>
			{navItems.map((item) => {
				const active = isActive(item.route);

				return (
					<Link key={item.route} href={item.route} asChild replace style={styles.navItem}>
						<Pressable>
							{({ pressed }) => (
								<>
									<Ionicons
										name={active ? item.iconNameActive : item.iconName}
										size={24}
										color={active ? "#6C5CE7" : "#666"}
										style={[pressed && styles.pressedIcon]}
									/>
									<Text
										style={[
											styles.label,
											active && styles.activeLabel,
											pressed && styles.pressedLabel,
										]}
									>
										{item.label}
									</Text>
								</>
							)}
						</Pressable>
					</Link>
				);
			})}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		backgroundColor: "#fff",
		borderTopWidth: 1,
		borderTopColor: "#e0e0e0",
		paddingTop: 8,
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: {
					width: 0,
					height: -2,
				},
				shadowOpacity: 0.1,
				shadowRadius: 3,
			},
			android: {
				elevation: 8,
			},
		}),
	},
	navItem: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 8,
	},
	pressedIcon: {
		opacity: 0.7,
		transform: [{ scale: 0.95 }],
	},
	label: {
		fontSize: 12,
		color: "#666",
		fontWeight: "500",
		marginTop: 4,
	},
	activeLabel: {
		color: "#6C5CE7",
		fontWeight: "700",
	},
	pressedLabel: {
		opacity: 0.7,
	},
});
