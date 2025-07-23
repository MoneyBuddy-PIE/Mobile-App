import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TextInput,
	TouchableOpacity,
	Alert,
	Animated,
	Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { moneyService } from "@/services/moneyService";
import { useAuthContext } from "@/contexts/AuthContext";

const PREDEFINED_AMOUNTS = ["1", "5", "10", "20"];

export default function AddMoney() {
	const params = useLocalSearchParams();
	const childId = params.childId as string;
	const childName = params.childName as string;

	const { refreshUserData, user } = useAuthContext();
	const [step, setStep] = useState<"form" | "success">("form");
	const [selectedAmount, setSelectedAmount] = useState("");
	const [customAmount, setCustomAmount] = useState("");
	const [showCustomAmount, setShowCustomAmount] = useState(false);
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [newBalance, setNewBalance] = useState("");

	const [scaleAnim] = useState(new Animated.Value(0));

	const handleAmountSelect = (amount: string) => {
		setSelectedAmount(amount);
		setShowCustomAmount(false);
		setCustomAmount("");
	};

	const handleCustomAmount = () => {
		setShowCustomAmount(true);
		setSelectedAmount("");
	};

	const getFinalAmount = () => {
		if (showCustomAmount) {
			return customAmount;
		}
		return selectedAmount;
	};

	const handleAddMoney = async () => {
		const finalAmount = getFinalAmount();

		if (!finalAmount || parseFloat(finalAmount) <= 0) {
			Alert.alert("Erreur", "Veuillez saisir un montant valide");
			return;
		}

		setLoading(true);
		try {
			// Récupérer le solde actuel de l'enfant
			const currentChild = user?.subAccounts?.find((account) => account.id === childId);
			const currentBalance = parseFloat(currentChild?.money || "0");

			const result = await moneyService.addMoney({
				subAccountId: childId,
				amount: finalAmount,
				description: message || `Versement de ${finalAmount}€`,
			});

			if (result.success) {
				// Calculer le nouveau solde
				const newBalanceAmount = currentBalance + parseFloat(finalAmount);
				setNewBalance(newBalanceAmount.toFixed(2));

				// Rafraîchir les données utilisateur pour obtenir le nouveau solde
				await refreshUserData();

				// Animation d'apparition de la tirelire
				setStep("success");
				Animated.spring(scaleAnim, {
					toValue: 1,
					friction: 8,
					tension: 100,
					useNativeDriver: true,
				}).start();
			} else {
				Alert.alert("Erreur", result.message || "Impossible d'ajouter l'argent");
			}
		} catch (error: any) {
			console.error("Error adding money:", error);
			Alert.alert("Erreur", "Une erreur inattendue s'est produite");
		} finally {
			setLoading(false);
		}
	};

	const handleFinish = () => {
		router.back();
	};

	if (step === "success") {
		return (
			<SafeAreaView style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity style={styles.closeButton} onPress={handleFinish}>
						<Text style={styles.closeButtonText}>✕</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.successContent}>
					<Text style={styles.successTitle}>
						{getFinalAmount()}€ versés à {childName}
					</Text>
					<Text style={styles.successSubtitle}>Son solde est maintenant de {newBalance}€ !</Text>

					{/* Animation tirelire */}
					<Animated.View style={[styles.piggyBankContainer, { transform: [{ scale: scaleAnim }] }]}>
						<View style={styles.piggyBankCircle}>
							<Text style={styles.piggyBankEmoji}>🐷</Text>
							<Text style={styles.coinEmoji}>🪙</Text>
							<Text style={styles.starsEmoji}>✨</Text>
						</View>
					</Animated.View>

					<TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
						<Text style={styles.finishButtonText}>Terminer</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.title}>Verser de l'argent</Text>
				<TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
					<Text style={styles.closeButtonText}>✕</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.content}>
				{/* Montant affiché */}
				<View style={styles.amountDisplay}>
					<Text style={styles.amountText}>
						{getFinalAmount() ? `${parseFloat(getFinalAmount()).toFixed(2)}€` : "0.00€"}
					</Text>
				</View>

				{/* Sélection du montant */}
				<View style={styles.amountSelection}>
					<View style={styles.amountContainer}>
						{PREDEFINED_AMOUNTS.map((amount) => (
							<TouchableOpacity
								key={amount}
								style={[styles.amountButton, selectedAmount === amount && styles.amountButtonSelected]}
								onPress={() => handleAmountSelect(amount)}
							>
								<Text
									style={[
										styles.amountButtonText,
										selectedAmount === amount && styles.amountButtonTextSelected,
									]}
								>
									{amount}€
								</Text>
							</TouchableOpacity>
						))}
						<TouchableOpacity
							style={[styles.amountButton, showCustomAmount && styles.amountButtonSelected]}
							onPress={handleCustomAmount}
						>
							<Text
								style={[styles.amountButtonText, showCustomAmount && styles.amountButtonTextSelected]}
							>
								Autre
							</Text>
						</TouchableOpacity>
					</View>

					{/* Input montant personnalisé */}
					{showCustomAmount && (
						<View style={styles.customAmountContainer}>
							<TextInput
								style={styles.customAmountInput}
								placeholder="Montant personnalisé"
								value={customAmount}
								onChangeText={setCustomAmount}
								keyboardType="decimal-pad"
								autoFocus
							/>
							<Text style={styles.euroSymbol}>€</Text>
						</View>
					)}
				</View>

				{/* Message */}
				<View style={styles.messageSection}>
					<Text style={styles.messageLabel}>Message</Text>
					<TextInput
						style={styles.messageInput}
						placeholder="Écrire un message"
						value={message}
						onChangeText={setMessage}
						multiline
						textAlignVertical="top"
					/>
				</View>
			</View>

			{/* Bouton de versement */}
			<View style={styles.footer}>
				<TouchableOpacity
					style={[styles.transferButton, (!getFinalAmount() || loading) && styles.transferButtonDisabled]}
					onPress={handleAddMoney}
					disabled={!getFinalAmount() || loading}
				>
					<Text style={styles.transferButtonText}>
						{loading ? "Versement..." : `Verser ${getFinalAmount() || "0"}€`}
					</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f9fa",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingTop: 10,
		paddingBottom: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},
	title: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		flex: 1,
	},
	closeButton: {
		width: 32,
		height: 32,
		backgroundColor: "#333",
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	closeButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	amountDisplay: {
		backgroundColor: "#E8E6FF",
		borderRadius: 12,
		paddingVertical: 32,
		paddingHorizontal: 20,
		alignItems: "center",
		marginBottom: 32,
	},
	amountText: {
		fontSize: 48,
		fontWeight: "bold",
		color: "#333",
	},
	amountSelection: {
		marginBottom: 32,
	},
	amountContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		justifyContent: "center",
	},
	amountButton: {
		backgroundColor: "#f0f0f0",
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 20,
		borderWidth: 2,
		borderColor: "transparent",
		minWidth: 60,
		alignItems: "center",
	},
	amountButtonSelected: {
		backgroundColor: "#6C5CE7",
		borderColor: "#6C5CE7",
	},
	amountButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#666",
	},
	amountButtonTextSelected: {
		color: "#fff",
	},
	customAmountContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#6C5CE7",
		paddingHorizontal: 16,
		marginTop: 16,
	},
	customAmountInput: {
		flex: 1,
		fontSize: 16,
		color: "#333",
		paddingVertical: 16,
	},
	euroSymbol: {
		fontSize: 16,
		color: "#666",
		fontWeight: "500",
	},
	messageSection: {
		marginBottom: 32,
	},
	messageLabel: {
		fontSize: 16,
		fontWeight: "500",
		color: "#333",
		marginBottom: 12,
	},
	messageInput: {
		backgroundColor: "#fff",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#ddd",
		paddingHorizontal: 16,
		paddingVertical: 16,
		fontSize: 16,
		color: "#333",
		height: 100,
	},
	footer: {
		paddingHorizontal: 20,
		paddingBottom: 20,
		paddingTop: 16,
	},
	transferButton: {
		backgroundColor: "#6C5CE7",
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
	},
	transferButtonDisabled: {
		backgroundColor: "#ccc",
	},
	transferButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	// Success screen styles
	successContent: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 40,
	},
	successTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#333",
		textAlign: "center",
		marginBottom: 8,
	},
	successSubtitle: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		marginBottom: 48,
	},
	piggyBankContainer: {
		marginBottom: 48,
	},
	piggyBankCircle: {
		width: 200,
		height: 200,
		borderRadius: 100,
		backgroundColor: "#B8F5E7",
		justifyContent: "center",
		alignItems: "center",
		position: "relative",
	},
	piggyBankEmoji: {
		fontSize: 80,
	},
	coinEmoji: {
		fontSize: 24,
		position: "absolute",
		top: 30,
		right: 40,
	},
	starsEmoji: {
		fontSize: 20,
		position: "absolute",
		bottom: 40,
		left: 30,
	},
	finishButton: {
		backgroundColor: "#6C5CE7",
		paddingHorizontal: 48,
		paddingVertical: 16,
		borderRadius: 12,
		minWidth: 200,
	},
	finishButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
		textAlign: "center",
	},
});
