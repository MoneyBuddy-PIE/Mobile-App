import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	SafeAreaView,
	ActivityIndicator,
	TouchableOpacity,
	RefreshControl,
	Modal,
} from "react-native";
import { useAuthContext } from "@/contexts/AuthContext";
import { SubAccount } from "@/types/Account";
import { router } from "expo-router";
import { tasksService } from "@/services/tasksService";
import { Task } from "@/types/Task";

export default function Children() {
	const { user, refreshUserData } = useAuthContext();
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [selectedChildId, setSelectedChildId] = useState<string>("");
	const [showPicker, setShowPicker] = useState(false);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loadingTasks, setLoadingTasks] = useState(false);

	const childAccounts = user?.subAccounts?.filter((account) => account.role === "CHILD") || [];
	const selectedChild = childAccounts.find((child) => child.id === selectedChildId);

	useEffect(() => {
		loadData();
	}, []);

	useEffect(() => {
		if (childAccounts.length > 0 && !selectedChildId) {
			setSelectedChildId(childAccounts[0].id);
		}
	}, [childAccounts, selectedChildId]);

	useEffect(() => {
		if (selectedChildId) {
			loadChildTasks();
		}
	}, [selectedChildId]);

	const loadData = async () => {
		try {
			await refreshUserData();
		} catch (error) {
			console.error("Error loading children data:", error);
		} finally {
			setLoading(false);
		}
	};

	const loadChildTasks = async () => {
		if (!selectedChildId) return;

		setLoadingTasks(true);
		try {
			const childTasks = await tasksService.getTasksByChild(selectedChildId);
			console.log("Child tasks loaded:", childTasks);
			setTasks(childTasks);
		} catch (error) {
			console.error("Error loading child tasks:", error);
		} finally {
			setLoadingTasks(false);
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		try {
			await refreshUserData();
		} finally {
			setRefreshing(false);
		}
	};

	// Séparer les tâches par catégorie
	const regularTasks = tasks.filter((task) => task.category === "REGULAR");
	const punctualTasks = tasks.filter((task) => task.category === "PUNCTUAL");

	const renderTask = (task: Task) => (
		<View key={task.id} style={styles.taskItem}>
			<View style={styles.taskInfo}>
				<Text style={styles.taskDescription}>{task.description}</Text>
				<Text style={styles.taskReward}>{task.reward}€</Text>
			</View>
			<View style={[styles.taskStatus, task.done && styles.taskStatusCompleted]}>
				<Text style={[styles.taskStatusText, task.done && styles.taskStatusTextCompleted]}>
					{task.done ? "✓" : "○"}
				</Text>
			</View>
		</View>
	);

	if (loading) {
		return (
			<View style={[styles.container, styles.center]}>
				<ActivityIndicator size="large" color="#6C5CE7" />
				<Text style={styles.loadingText}>Chargement...</Text>
			</View>
		);
	}

	if (childAccounts.length === 0) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.emptyContainer}>
					<Text style={styles.emptyIcon}>👶</Text>
					<Text style={styles.emptyTitle}>Aucun enfant trouvé</Text>
					<Text style={styles.emptyText}>Créez un compte enfant depuis la page profil pour commencer.</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView
				style={styles.content}
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />}
			>
				{/* Header avec sélecteur d'enfant */}
				<View style={styles.header}>
					<TouchableOpacity style={styles.childSelector} onPress={() => setShowPicker(true)}>
						<View style={styles.childIcon}>
							<Text style={styles.childIconText}>👶</Text>
						</View>
						<Text style={styles.childName}>{selectedChild?.name || "Sélectionner"}</Text>
						<Text style={styles.dropdownArrow}>▼</Text>
					</TouchableOpacity>
				</View>

				{selectedChild && (
					<>
						{/* Solde */}
						<View style={styles.balanceSection}>
							<Text style={styles.balanceLabel}>Solde disponible</Text>
							<Text style={styles.balanceAmount}>{selectedChild.money || "0.00"}€</Text>
						</View>

						{/* Boutons actions */}
						<View style={styles.actionButtons}>
							<TouchableOpacity 
								style={styles.primaryButton}
								onPress={() => router.push({
									pathname: "/(app)/children/add-money",
									params: { 
										childId: selectedChildId, 
										childName: selectedChild.name 
									},
								})}
							>
								<Text style={styles.primaryButtonIcon}>💳</Text>
								<Text style={styles.primaryButtonText}>Verser de l'argent</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.secondaryButton}>
								<Text style={styles.secondaryButtonIcon}>⚙️</Text>
								<Text style={styles.secondaryButtonText}>Paramétrer</Text>
							</TouchableOpacity>
						</View>

						{/* Message argent de poche */}
						{(!selectedChild.money || selectedChild.money === "0") && (
							<View style={styles.infoCard}>
								<Text style={styles.infoIcon}>💰</Text>
								<Text style={styles.infoTitle}>Pas encore d'argent de poche</Text>
								<Text style={styles.infoText}>
									Commencez à lui verser une petite somme à poche pour l'aider à apprendre à gérer un
									vrai budget.
								</Text>
							</View>
						)}

						{/* Section Tâches */}
						<View style={styles.tasksSection}>
							<Text style={styles.sectionTitle}>Ses tâches</Text>

							{loadingTasks ? (
								<ActivityIndicator size="small" color="#007AFF" />
							) : (
								<>
									{/* Tâches régulières */}
									<View style={styles.taskCategory}>
										<TouchableOpacity style={styles.taskCategoryHeader}>
											<Text style={styles.taskIcon}>✅</Text>
											<Text style={styles.taskCategoryTitle}>
												Tâches régulières ({regularTasks.length})
											</Text>
											<TouchableOpacity
												style={styles.addButton}
												onPress={() =>
													router.push({
														pathname: "/(app)/children/create-task",
														params: { childId: selectedChildId, type: "REGULAR" },
													})
												}
											>
												<Text style={styles.addButtonText}>+</Text>
											</TouchableOpacity>
										</TouchableOpacity>
										{regularTasks.map(renderTask)}
									</View>

									{/* Défis ponctuels */}
									<View style={styles.taskCategory}>
										<TouchableOpacity style={styles.taskCategoryHeader}>
											<Text style={styles.taskIcon}>🚀</Text>
											<Text style={styles.taskCategoryTitle}>
												Défis ponctuels ({punctualTasks.length})
											</Text>
											<TouchableOpacity
												style={styles.addButton}
												onPress={() =>
													router.push({
														pathname: "/(app)/children/create-task",
														params: { childId: selectedChildId, type: "PUNCTUAL" },
													})
												}
											>
												<Text style={styles.addButtonText}>+</Text>
											</TouchableOpacity>
										</TouchableOpacity>
										{punctualTasks.map(renderTask)}
									</View>

									{/* Message aucune tâche */}
									{tasks.length === 0 && (
										<View style={styles.infoCard}>
											<Text style={styles.infoIcon}>📝</Text>
											<Text style={styles.infoTitle}>Aucune tâche pour l'instant</Text>
											<Text style={styles.infoText}>
												Ajoutez une tâche pour aider votre enfant à gagner en autonomie (et
												peut-être quelques pièces 💰).
											</Text>
										</View>
									)}
								</>
							)}
						</View>
					</>
				)}

				<View style={styles.bottomPadding} />
			</ScrollView>

			{/* Bouton flottant pour ajouter une tâche */}
			<TouchableOpacity
				style={styles.addTaskButton}
				onPress={() => {
					router.push({
						pathname: "/(app)/children/create-task",
						params: { childId: selectedChildId },
					});
				}}
			>
				<Text style={styles.addTaskButtonText}>+ Ajouter une tâche</Text>
			</TouchableOpacity>

			{/* Modal de sélection d'enfant */}
			<Modal
				visible={showPicker}
				transparent={true}
				animationType="fade"
				onRequestClose={() => setShowPicker(false)}
			>
				<TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPicker(false)}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Sélectionner un enfant</Text>
						{childAccounts.map((child) => (
							<TouchableOpacity
								key={child.id}
								style={[styles.modalOption, selectedChildId === child.id && styles.modalOptionSelected]}
								onPress={() => {
									setSelectedChildId(child.id);
									setShowPicker(false);
								}}
							>
								<Text
									style={[
										styles.modalOptionText,
										selectedChildId === child.id && styles.modalOptionTextSelected,
									]}
								>
									{child.name}
								</Text>
								{selectedChildId === child.id && <Text style={styles.checkmark}>✓</Text>}
							</TouchableOpacity>
						))}
					</View>
				</TouchableOpacity>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f9fa",
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	center: {
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 12,
		fontSize: 16,
		color: "#666",
	},
	header: {
		paddingTop: 20,
		paddingBottom: 20,
	},
	childSelector: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		padding: 12,
		borderRadius: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	childIcon: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "#f0f0f0",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	childIconText: {
		fontSize: 16,
	},
	childName: {
		flex: 1,
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
	},
	dropdownArrow: {
		fontSize: 12,
		color: "#666",
	},
	balanceSection: {
		alignItems: "center",
		marginBottom: 24,
	},
	balanceLabel: {
		fontSize: 16,
		color: "#666",
		marginBottom: 8,
	},
	balanceAmount: {
		fontSize: 48,
		fontWeight: "bold",
		color: "#333",
	},
	actionButtons: {
		flexDirection: "row",
		gap: 12,
		marginBottom: 24,
	},
	primaryButton: {
		flex: 1,
		backgroundColor: "#6C5CE7",
		padding: 16,
		borderRadius: 12,
		alignItems: "center",
	},
	primaryButtonIcon: {
		fontSize: 20,
		marginBottom: 4,
	},
	primaryButtonText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "600",
	},
	secondaryButton: {
		flex: 1,
		backgroundColor: "#fff",
		padding: 16,
		borderRadius: 12,
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#ddd",
	},
	secondaryButtonIcon: {
		fontSize: 20,
		marginBottom: 4,
	},
	secondaryButtonText: {
		color: "#333",
		fontSize: 14,
		fontWeight: "600",
	},
	infoCard: {
		backgroundColor: "#E3F2FD",
		padding: 16,
		borderRadius: 12,
		marginBottom: 24,
		alignItems: "center",
	},
	infoIcon: {
		fontSize: 24,
		marginBottom: 8,
	},
	infoTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		marginBottom: 8,
	},
	infoText: {
		fontSize: 14,
		color: "#666",
		textAlign: "center",
		lineHeight: 20,
	},
	tasksSection: {
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 16,
	},
	taskCategory: {
		marginBottom: 12,
	},
	taskCategoryHeader: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		padding: 16,
		borderRadius: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	taskIcon: {
		fontSize: 20,
		marginRight: 12,
	},
	taskCategoryTitle: {
		flex: 1,
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
	},
	addButton: {
		width: 32,
		height: 32,
		backgroundColor: "#f0f0f0",
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
	},
	addButtonText: {
		fontSize: 20,
		color: "#666",
		fontWeight: "300",
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 40,
	},
	emptyIcon: {
		fontSize: 48,
		marginBottom: 16,
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 8,
		textAlign: "center",
	},
	emptyText: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		lineHeight: 22,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 20,
		margin: 20,
		minWidth: 280,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.25,
		shadowRadius: 10,
		elevation: 10,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 16,
		textAlign: "center",
	},
	modalOption: {
		padding: 16,
		borderRadius: 8,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 4,
	},
	modalOptionSelected: {
		backgroundColor: "#6C5CE7",
	},
	modalOptionText: {
		fontSize: 16,
		color: "#333",
	},
	modalOptionTextSelected: {
		color: "#fff",
		fontWeight: "600",
	},
	checkmark: {
		fontSize: 16,
		color: "#fff",
		fontWeight: "bold",
	},
	bottomPadding: {
		height: 20,
	},
	addTaskButton: {
		position: "absolute",
		bottom: 30,
		left: 20,
		right: 20,
		backgroundColor: "#6C5CE7",
		padding: 16,
		borderRadius: 12,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 8,
		elevation: 8,
	},
	addTaskButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	taskItem: {
		backgroundColor: "#f8f9fa",
		padding: 12,
		marginVertical: 4,
		marginHorizontal: 16,
		borderRadius: 8,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	taskInfo: {
		flex: 1,
	},
	taskDescription: {
		fontSize: 14,
		fontWeight: "500",
		color: "#333",
		marginBottom: 2,
	},
	taskReward: {
		fontSize: 12,
		color: "#6C5CE7",
		fontWeight: "600",
	},
	taskStatus: {
		width: 24,
		height: 24,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: "#ddd",
		justifyContent: "center",
		alignItems: "center",
	},
	taskStatusCompleted: {
		backgroundColor: "#4CAF50",
		borderColor: "#4CAF50",
	},
	taskStatusText: {
		fontSize: 12,
		color: "#ddd",
	},
	taskStatusTextCompleted: {
		color: "#fff",
		fontWeight: "bold",
	},
});
