import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
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
	const [selectedAmount, setSelectedAmount] = useState("");
	const [customAmount, setCustomAmount] = useState("");
	const [showCustomAmount, setShowCustomAmount] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState("");
	const [customDescription, setCustomDescription] = useState("");
	const [loading, setLoading] = useState(false);

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

			const result = await transactionService.addExpense({
				subAccountId: subAccount.id,
				amount: finalAmount,
				description: finalDescription,
			});

			if (result.success) {
				Alert.alert("Dépense enregistrée ! 💸", `Tu as dépensé ${finalAmount}€ pour ${finalDescription}`, [
					{ text: "OK", onPress: () => router.back() },
				]);
			} else {
				Alert.alert("Erreur", result.message || "Impossible d'enregistrer la dépense");
			}
		} catch (error: any) {
            logger.error("Error adding expense:", error);
			// console.error("Error adding expense:", error);
			Alert.alert("Erreur", "Une erreur inattendue s'est produite");
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()}>
					<Text style={styles.backIcon}>←</Text>
				</TouchableOpacity>
				<Text style={styles.title}>Ajouter une dépense</Text>
				<View style={styles.placeholder} />
			</View>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Montant */}
				<View style={styles.section}>
					<Text style={styles.sectionLabel}>Combien as-tu dépensé ?</Text>
					<View style={styles.amountDisplay}>
						<Text style={styles.amountText}>
							{getFinalAmount() ? `${parseFloat(getFinalAmount()).toFixed(2)}€` : "0.00€"}
						</Text>
					</View>

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
	backIcon: {
		fontSize: 24,
		color: "#333",
	},
	title: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
	},
	placeholder: {
		width: 24,
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	section: {
		marginTop: 24,
	},
	sectionLabel: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		marginBottom: 16,
		textAlign: "center",
	},
	amountDisplay: {
		backgroundColor: "#FFE5E5",
		borderRadius: 16,
		paddingVertical: 24,
		paddingHorizontal: 20,
		alignItems: "center",
		marginBottom: 20,
	},
	amountText: {
		fontSize: 36,
		fontWeight: "bold",
		color: "#FF6B6B",
	},
	amountContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		justifyContent: "center",
	},
	amountButton: {
		backgroundColor: "#f0f0f0",
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 20,
		borderWidth: 2,
		borderColor: "transparent",
		minWidth: 60,
		alignItems: "center",
	},
	amountButtonSelected: {
		backgroundColor: "#FF6B6B",
		borderColor: "#FF6B6B",
	},
	amountButtonText: {
		fontSize: 14,
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
		borderColor: "#FF6B6B",
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
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
	},
	categoryButtonSelected: {
		borderColor: "#FF6B6B",
		backgroundColor: "#FFE5E5",
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
		color: "#FF6B6B",
		fontWeight: "600",
	},
	customDescriptionContainer: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
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
		backgroundColor: "#FF6B6B",
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
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
});
