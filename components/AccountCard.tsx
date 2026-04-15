// components/AccountCard.tsx
import React from "react";
import { TouchableOpacity, Text, View, StyleSheet, Image } from "react-native";
import { SubAccount } from "@/types/Account";

interface AccountCardProps {
	account: SubAccount;
	onPress: () => void;
	isRow?: boolean;
	cardStyle?: object;
	children?: React.ReactNode;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, onPress, isRow = false, cardStyle, children }) => {
	const url = `https://api.dicebear.com/9.x/${account.iconStyle}/png?seed=${account.iconName}`

	const getRoleColor = (role: string): {roleColor: string, role: string} => {
		switch (role.toUpperCase()) {
			case "CHILD":
				return {roleColor: "#59FFCF", role: "Enfant"};
			default:
				return {roleColor: "#97C9FF", role: "Parent"};
		}
	};

	const role = getRoleColor(account.role);

	return (
		<TouchableOpacity style={{...styles.card, ...cardStyle, ...isRow ? styles.cardRow : styles.cardColumn}} onPress={onPress} activeOpacity={0.7}>
			<Image source={{ uri: url }} style={styles.imageContainer} />

			<View style={{...styles.content, ...isRow ?  {alignItems: "flex-start"} : {alignItems: "center"}}}>
				<Text style={styles.name}>{account.name}</Text>
				<View style={styles.roleContainer}>
					<View style={[styles.roleBadge, { backgroundColor: role.roleColor}]}>
						<Text style={styles.roleText}>{role.role}</Text>
					</View>
				</View>
			</View>

			{children}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 24,
		display: "flex",
		alignItems: "center",
	},
	cardColumn: {
		flexDirection: "column",
		justifyContent: "center",
		minHeight: 160,
				shadowColor: "#BFD0EA",
		shadowOffset: {
			width: 0,
			height: 3.89,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
	},
	cardRow : {
		flexDirection: "row",
		justifyContent: "flex-start",
		gap: 16,
	},
	imageContainer: {
		width: 50,
		height: 50,
		marginBottom: 10,
	},
	icon: {
		fontSize: 24,
	},
	content: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
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
		color: "#2F2F2F",
		fontSize: 12,
		fontWeight: "400",
	},
});

export default AccountCard;
