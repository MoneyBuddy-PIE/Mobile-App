import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { tasksService } from "@/services/tasksService";

const PREDEFINED_AMOUNTS = ["0.50", "1", "1.50"];

export default function CreateTask() {
	const params = useLocalSearchParams();
	const childId = params.childId as string;

	const [taskName, setTaskName] = useState("");
	const [selectedAmount, setSelectedAmount] = useState("");
	const [customAmount, setCustomAmount] = useState("");
	const [showCustomAmount, setShowCustomAmount] = useState(false);
	const [taskType, setTaskType] = useState<"REGULAR" | "PUNCTUAL">("PUNCTUAL");
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

	const getFinalAmount = () => {
		if (showCustomAmount) {
			return customAmount;
		}
		return selectedAmount;
	};

	const handleCreateTask = async () => {
		const finalAmount = getFinalAmount();

		if (!taskName.trim()) {
			Alert.alert("Erreur", "Veuillez saisir un nom de tâche");
			return;
		}

		if (!finalAmount) {
			Alert.alert("Erreur", "Veuillez sélectionner un montant");
			return;
		}

		setLoading(true);
		try {
			await tasksService.createTask({
				description: taskName.trim(),
				category: taskType === "REGULAR" ? "REGULAR" : "PUNCTUAL",
				subAccountId: childId,
				reward: finalAmount,
				dateLimit: new Date().toISOString(), // TODO: Ajouter sélection de date
			});

			Alert.alert("Succès", "Tâche créée avec succès", [{ text: "OK", onPress: () => router.back() }]);
		} catch (error: any) {
			console.error("Error creating task:", error);
			const errorMessage = error.response?.data?.message || "Impossible de créer la tâche";
			Alert.alert("Erreur", errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.title}>Ajouter une tâche</Text>
				<TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
					<Text style={styles.closeButtonText}>✕</Text>
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Nom de la tâche */}
				<View style={styles.section}>
					<Text style={styles.sectionLabel}>Nom de la tâche</Text>
					<View style={styles.inputContainer}>
						<TextInput
							style={styles.textInput}
							placeholder="Ex: Sortir les poubelles"
							value={taskName}
							onChangeText={setTaskName}
							autoCapitalize="sentences"
						/>
						{taskName.trim() && <Text style={styles.inputCheck}>✓</Text>}
					</View>
				</View>

				{/* Montant attribué */}
				<View style={styles.section}>
					<Text style={styles.sectionLabel}>Montant attribué</Text>
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
								Définir
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

				{/* Type de tâche */}
				<View style={styles.section}>
					<Text style={styles.sectionLabel}>Type de tâche</Text>
					<View style={styles.taskTypeContainer}>
						<TouchableOpacity
							style={[styles.taskTypeButton, taskType === "REGULAR" && styles.taskTypeButtonSelected]}
							onPress={() => setTaskType("REGULAR")}
						>
							<Text
								style={[
									styles.taskTypeButtonText,
									taskType === "REGULAR" && styles.taskTypeButtonTextSelected,
								]}
							>
								Régulière
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.taskTypeButton, taskType === "PUNCTUAL" && styles.taskTypeButtonSelected]}
							onPress={() => setTaskType("PUNCTUAL")}
						>
							<Text
								style={[
									styles.taskTypeButtonText,
									taskType === "PUNCTUAL" && styles.taskTypeButtonTextSelected,
								]}
							>
								Ponctuelle
							</Text>
						</TouchableOpacity>
					</View>
				</View>

				<View style={styles.bottomPadding} />
			</ScrollView>

			{/* Bouton de création */}
			<View style={styles.footer}>
				<TouchableOpacity
					style={[
						styles.createButton,
						(!taskName.trim() || !getFinalAmount() || loading) && styles.createButtonDisabled,
					]}
					onPress={handleCreateTask}
					disabled={!taskName.trim() || !getFinalAmount() || loading}
				>
					<Text style={styles.createButtonText}>{loading ? "Création..." : "Créer la tâche"}</Text>
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
	},
	section: {
		marginTop: 24,
	},
	sectionLabel: {
		fontSize: 16,
		fontWeight: "500",
		color: "#333",
		marginBottom: 12,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#ddd",
		paddingHorizontal: 16,
	},
	textInput: {
		flex: 1,
		fontSize: 16,
		color: "#333",
		paddingVertical: 16,
	},
	inputCheck: {
		color: "#4CAF50",
		fontSize: 18,
		fontWeight: "bold",
	},
	amountContainer: {
		flexDirection: "row",
		gap: 12,
		flexWrap: "wrap",
	},
	amountButton: {
		backgroundColor: "#f0f0f0",
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 20,
		borderWidth: 2,
		borderColor: "transparent",
	},
	amountButtonSelected: {
		backgroundColor: "#6C5CE7",
		borderColor: "#6C5CE7",
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
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#6C5CE7",
		paddingHorizontal: 16,
		marginTop: 12,
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
	taskTypeContainer: {
		flexDirection: "row",
		gap: 12,
	},
	taskTypeButton: {
		backgroundColor: "#f0f0f0",
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 20,
		borderWidth: 2,
		borderColor: "transparent",
	},
	taskTypeButtonSelected: {
		backgroundColor: "#6C5CE7",
		borderColor: "#6C5CE7",
	},
	taskTypeButtonText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#666",
	},
	taskTypeButtonTextSelected: {
		color: "#fff",
	},
	bottomPadding: {
		height: 100,
	},
	footer: {
		paddingHorizontal: 20,
		paddingBottom: 20,
		paddingTop: 16,
	},
	createButton: {
		backgroundColor: "#6C5CE7",
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
	},
	createButtonDisabled: {
		backgroundColor: "#ccc",
	},
	createButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});
