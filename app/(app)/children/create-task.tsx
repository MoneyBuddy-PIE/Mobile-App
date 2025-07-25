import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { tasksService } from "@/services/tasksService";
import { Ionicons } from "@expo/vector-icons";

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
				dateLimit: new Date().toISOString(),
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
						{taskName.trim() && <Ionicons name="checkmark-outline" size={18} color="#16AA75" />}
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
	amountContainer: {
		flexDirection: "row",
		gap: 12,
		flexWrap: "wrap",
	},
	amountButton: {
		backgroundColor: "#EAEAEA",
		padding: 8,
		borderRadius: 8,
		borderWidth: 2,
		borderColor: "transparent",
	},
	amountButtonSelected: {
		backgroundColor: "#E6E2FB",
		borderColor: "#846DED",
	},
	amountButtonText: {
		fontSize: 14,
		color: "#6E6E6E",
	},
	amountButtonTextSelected: {
		color: "#2F2F2F",
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
		backgroundColor: "#EAEAEA",
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
		borderWidth: 2,
		borderColor: "transparent",
	},
	taskTypeButtonSelected: {
		backgroundColor: "#E6E2FB",
		borderColor: "#846DED",
	},
	taskTypeButtonText: {
		fontSize: 14,
		color: "#6E6E6E",
	},
	taskTypeButtonTextSelected: {
		color: "#2F2F2F",
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
	createButtonDisabled: {
		backgroundColor: "#ccc",
	},
	createButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});
