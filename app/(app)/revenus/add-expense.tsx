import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	TextInput,
	TouchableOpacity,
	Alert,
	ScrollView,
	Animated,
} from "react-native";
import { router } from "expo-router";
import { UserStorage } from "@/utils/storage";
import { transactionService } from "@/services/transactionService";
import { logger } from "@/utils/logger";

const PREDEFINED_AMOUNTS = ["1", "2", "5", "10"];
const PREDEFINED_CATEGORIES = [
	{ emoji: "🍭", label: "Bonbons" },
	{ emoji: "🎮", label: "Jeux" },
	{ emoji: "📚", label: "Livres" },
	{ emoji: "🎁", label: "Cadeaux" },
	{ emoji: "🍕", label: "Nourriture" },
	{ emoji: "🎨", label: "Loisirs" },
];

export default function AddExpense() {
	const [step, setStep] = useState<"form" | "success">("form");
	const [selectedAmount, setSelectedAmount] = useState("");
	const [customAmount, setCustomAmount] = useState("");
	const [showCustomAmount, setShowCustomAmount] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState("");
	const [customDescription, setCustomDescription] = useState("");
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

	const handleCategorySelect = (category: string) => {
		setSelectedCategory(category);
		setCustomDescription("");
	};

	const getFinalAmount = () => {
		if (showCustomAmount) {
			return customAmount;
		}
		return selectedAmount;
	};

	const getFinalDescription = () => {
		if (customDescription.trim()) {
			return customDescription.trim();
		}
		return selectedCategory;
	};

	const handleAddExpense = async () => {
		const finalAmount = getFinalAmount();
		const finalDescription = getFinalDescription();

		if (!finalAmount || parseFloat(finalAmount) <= 0) {
			Alert.alert("Erreur", "Veuillez saisir un montant valide");
			return;
		}

		if (!finalDescription) {
			Alert.alert("Erreur", "Veuillez sélectionner une catégorie ou saisir une description");
			return;
		}

		setLoading(true);
		try {
			const subAccount = await UserStorage.getSubAccount();
			if (!subAccount) {
				Alert.alert("Erreur", "Impossible de récupérer les informations du compte");
				return;
			}

			// Récupérer le solde actuel de l'enfant
			const currentBalance = parseFloat(subAccount.money || "0");

			const result = await transactionService.addExpense({
				subAccountId: subAccount.id,
				amount: finalAmount,
				description: finalDescription,
			});

			if (result.success) {
				// Calculer le nouveau solde
				const newBalanceAmount = currentBalance - parseFloat(finalAmount);
				setNewBalance(newBalanceAmount.toFixed(2));

				// Animation d'apparition
				setStep("success");
				Animated.spring(scaleAnim, {
					toValue: 1,
					friction: 8,
					tension: 100,
					useNativeDriver: true,
				}).start();
			} else {
				Alert.alert("Erreur", result.message || "Impossible d'enregistrer la dépense");
			}
		} catch (error: any) {
			logger.error("Error adding expense:", error);
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
						{getFinalAmount()}€ dépensé pour {getFinalDescription()}
					</Text>
					<Text style={styles.successSubtitle}>Ton solde est maintenant de {newBalance}€</Text>

					{/* Animation */}
					<Animated.View style={[styles.expenseContainer, { transform: [{ scale: scaleAnim }] }]}>
						<View style={styles.expenseCircle}>
							<Text style={styles.expenseEmoji}>💸</Text>
							<Text style={styles.coinEmoji}>💰</Text>
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
				<Text style={styles.title}>Ajouter une dépense</Text>
				<TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
					<Text style={styles.closeButtonText}>✕</Text>
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Montant affiché */}
				<View style={styles.amountDisplay}>
					<Text style={styles.amountText}>
						{getFinalAmount() ? `-${parseFloat(getFinalAmount()).toFixed(2)}€` : "0.00€"}
					</Text>
				</View>

				{/* Sélection du montant */}
				<View style={styles.section}>
					<Text style={styles.sectionLabel}>Combien as-tu dépensé ?</Text>
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

				{/* Catégorie */}
				<View style={styles.section}>
					<Text style={styles.sectionLabel}>Pour quoi ?</Text>
					<View style={styles.categoriesContainer}>
						{PREDEFINED_CATEGORIES.map((category) => (
							<TouchableOpacity
								key={category.label}
								style={[
									styles.categoryButton,
									selectedCategory === category.label && styles.categoryButtonSelected,
								]}
								onPress={() => handleCategorySelect(category.label)}
							>
								<Text style={styles.categoryEmoji}>{category.emoji}</Text>
								<Text
									style={[
										styles.categoryText,
										selectedCategory === category.label && styles.categoryTextSelected,
									]}
								>
									{category.label}
								</Text>
							</TouchableOpacity>
						))}
					</View>

					{/* Description personnalisée */}
					<View style={styles.customDescriptionContainer}>
						<Text style={styles.customDescriptionLabel}>Ou décris ta dépense :</Text>
						<TextInput
							style={styles.customDescriptionInput}
							placeholder="Ex: Magazine, autocollants..."
							value={customDescription}
							onChangeText={setCustomDescription}
							maxLength={50}
						/>
					</View>
				</View>

				<View style={styles.bottomPadding} />
			</ScrollView>

			{/* Bouton d'enregistrement */}
			<View style={styles.footer}>
				<TouchableOpacity
					style={[
						styles.addButton,
						(!getFinalAmount() || !getFinalDescription() || loading) && styles.addButtonDisabled,
					]}
					onPress={handleAddExpense}
					disabled={!getFinalAmount() || !getFinalDescription() || loading}
				>
					<Text style={styles.addButtonText}>
						{loading ? "Enregistrement..." : `Dépenser ${getFinalAmount() || "0"}€`}
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
		backgroundColor: "#EBF2FB",
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
	section: {
		marginBottom: 32,
	},
	sectionLabel: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		marginBottom: 16,
		textAlign: "center",
	},
	amountContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		justifyContent: "center",
		marginBottom: 16,
	},
	amountButton: {
		backgroundColor: "#EAEAEA",
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
		borderWidth: 2,
		borderColor: "transparent",
		minWidth: 60,
		alignItems: "center",
	},
	amountButtonSelected: {
		backgroundColor: "#846DED",
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
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#6C5CE7",
		paddingHorizontal: 16,
		marginTop: 16,
		shadowColor: "#BFD0EA",
		shadowOffset: {
			width: 0,
			height: 3.89,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
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
	categoriesContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		justifyContent: "center",
		marginBottom: 20,
	},
	categoryButton: {
		backgroundColor: "#fff",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 16,
		borderWidth: 2,
		borderColor: "#e0e0e0",
		alignItems: "center",
		minWidth: 80,
		shadowColor: "#BFD0EA",
		shadowOffset: {
			width: 0,
			height: 3.89,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
	},
	categoryButtonSelected: {
		borderColor: "#6C5CE7",
		backgroundColor: "#E6E2FB",
	},
	categoryEmoji: {
		fontSize: 20,
		marginBottom: 4,
	},
	categoryText: {
		fontSize: 12,
		fontWeight: "500",
		color: "#666",
	},
	categoryTextSelected: {
		color: "#6C5CE7",
		fontWeight: "600",
	},
	customDescriptionContainer: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
		shadowColor: "#BFD0EA",
		shadowOffset: {
			width: 0,
			height: 3.89,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
	},
	customDescriptionLabel: {
		fontSize: 14,
		fontWeight: "500",
		color: "#666",
		marginBottom: 8,
	},
	customDescriptionInput: {
		fontSize: 16,
		color: "#333",
		paddingVertical: 8,
		paddingHorizontal: 0,
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},
	bottomPadding: {
		height: 100,
	},
	footer: {
		paddingHorizontal: 20,
		paddingBottom: 20,
		paddingTop: 16,
	},
	addButton: {
		backgroundColor: "#846DED",
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
		shadowColor: "#4E31CF",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
	},
	addButtonDisabled: {
		backgroundColor: "#ccc",
		shadowOpacity: 0,
		elevation: 0,
	},
	addButtonText: {
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
	expenseContainer: {
		marginBottom: 48,
	},
	expenseCircle: {
		width: 200,
		height: 200,
		borderRadius: 100,
		backgroundColor: "#FFE5E5",
		justifyContent: "center",
		alignItems: "center",
		position: "relative",
	},
	expenseEmoji: {
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
		backgroundColor: "#846DED",
		paddingHorizontal: 48,
		paddingVertical: 16,
		borderRadius: 12,
		minWidth: 200,
		shadowColor: "#4E31CF",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
	},
	finishButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
		textAlign: "center",
	},
});
