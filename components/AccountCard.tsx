// components/AccountCard.tsx
import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { SubAccount } from "@/types/Account";

interface AccountCardProps {
	account: SubAccount;
	onPress: () => void;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, onPress }) => {
	const getRoleIcon = (role: string) => {
		switch (role.toUpperCase()) {
			case "PARENT":
				return "👨‍👩‍👧‍👦";
			case "CHILD":
				return "👶";
			case "ADMIN":
				return "👑";
			default:
				return "👤";
		}
	};

	const getRoleColor = (role: string) => {
		switch (role.toUpperCase()) {
			case "PARENT":
				return "#4CAF50";
			case "CHILD":
				return "#2196F3";
			case "ADMIN":
				return "#FF9800";
			default:
				return "#666";
		}
	};

	return (
		<TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
			<View style={styles.iconContainer}>
				<Text style={styles.icon}>{getRoleIcon(account.role)}</Text>
			</View>

			<View style={styles.content}>
				<Text style={styles.name}>{account.name}</Text>
				<View style={styles.roleContainer}>
					<View style={[styles.roleBadge, { backgroundColor: getRoleColor(account.role) }]}>
						<Text style={styles.roleText}>{account.role}</Text>
					</View>
				</View>
			</View>

			<View style={styles.arrow}>
				<Text style={styles.arrowText}>→</Text>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 16,
		flexDirection: "row",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
		marginBottom: 12,
	},
	iconContainer: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: "#f0f0f0",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 16,
	},
	icon: {
		fontSize: 24,
	},
	content: {
		flex: 1,
	},
	name: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		marginBottom: 4,
	},
	roleContainer: {
		flexDirection: "row",
	},
	roleBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
	},
	roleText: {
		color: "#fff",
		fontSize: 12,
		fontWeight: "600",
		textTransform: "uppercase",
	},
	arrow: {
		marginLeft: 12,
	},
	arrowText: {
		fontSize: 20,
		color: "#999",
	},
});

export default AccountCard;
