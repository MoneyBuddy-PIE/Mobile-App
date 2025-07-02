// src/components/AccountCard.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SubAccount } from "@/types/Account";

interface AccountCardProps {
	account: SubAccount;
	onPress: () => void;
}

export default function AccountCard({ account, onPress }: AccountCardProps) {
	return (
		<TouchableOpacity style={styles.card} onPress={onPress}>
			<Text>{account.name}</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 20,
		marginBottom: 24,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
		height: 200,
		width: "50%",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
	},
});
