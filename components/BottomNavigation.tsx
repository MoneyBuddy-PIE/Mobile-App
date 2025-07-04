// components/BottomNavigation.tsx
import React from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { usePathname, Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface NavItem {
	route: string;
	label: string;
	iconName: keyof typeof Ionicons.glyphMap;
	iconNameActive: keyof typeof Ionicons.glyphMap;
}

const navItems: NavItem[] = [
	{
		route: "/(app)/home",
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

export const BottomNavigation: React.FC = () => {
	const pathname = usePathname();
	const insets = useSafeAreaInsets();

	const isActive = (route: string) => {
		const cleanPath = route.replace("/(app)", "");
		return pathname === route || pathname === cleanPath || pathname.startsWith(cleanPath + "/");
	};

	return (
		<View style={[styles.container, { paddingBottom: insets.bottom || 20 }]}>
			{navItems.map((item) => {
				const active = isActive(item.route);

				return (
					<Link
						key={item.route}
						href={item.route}
						asChild
						replace // Use replace instead of push to avoid stacking
						style={styles.navItem}
					>
						<Pressable>
							{({ pressed }) => (
								<>
									<Ionicons
										name={active ? item.iconNameActive : item.iconName}
										size={24}
										color={active ? "#007AFF" : "#666"}
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
		color: "#007AFF",
		fontWeight: "700",
	},
	pressedLabel: {
		opacity: 0.7,
	},
});
