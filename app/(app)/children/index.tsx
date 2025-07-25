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
import { logger } from "@/utils/logger";
import { typography } from "@/styles/typography";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

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

	useFocusEffect(
		React.useCallback(() => {
			if (selectedChildId) {
				loadChildTasks();
			}
		}, [selectedChildId])
	);

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
		if (!selectedChildId || !selectedChild) return;

		setLoadingTasks(true);
		try {
			const childTasks = await tasksService.getTasksByChild(selectedChildId, "PARENT");
			setTasks(childTasks);
		} catch (error) {
			logger.error("Error loading child tasks:", error);
		} finally {
			setLoadingTasks(false);
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		try {
			await refreshUserData();
			if (selectedChildId) {
				await loadChildTasks();
			}
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
				<Text style={[styles.taskReward, typography.bold, typography["xs"]]}>{task.reward}€</Text>
				<Text style={[styles.taskDescription, typography["sm"]]}>{task.description}</Text>
			</View>
			<View style={[styles.taskStatus, task.done && styles.taskStatusCompleted]}>
				{task.done ?? <Ionicons name="checkmark-outline" size={20} color={task.done ? "#fff" : "#ddd"} />}
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
				style={styles.contentScrollView}
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
					<View style={styles.content}>
						{/* Solde */}
						<View style={styles.balanceSection}>
							<Text style={[styles.balanceLabel, typography.regular]}>Solde disponible</Text>
							<Text style={[styles.balanceAmount, typography.title, typography["5xl"]]}>
								{selectedChild.money || "0.00"}€
							</Text>
						</View>

						{/* Boutons actions */}
						<View style={styles.actionButtons}>
							<View style={styles.actionButtonContainer}>
								<TouchableOpacity
									style={styles.primaryActionButton}
									onPress={() =>
										router.push({
											pathname: "/(app)/children/add-money",
											params: {
												childId: selectedChildId,
												childName: selectedChild.name,
											},
										})
									}
								>
									<Ionicons name="wallet" size={28} color="#fff" />
								</TouchableOpacity>
								<Text style={[typography.regular, styles.actionButtonText]}>Verser de l'argent</Text>
							</View>
						</View>

						{/* Message argent de poche */}
						{(!selectedChild.money || selectedChild.money === "0") && (
							<View style={styles.infoCard}>
								<View style={styles.infoContent}>
									<Ionicons name="bulb-outline" size={20} color="#52A5FF" style={styles.infoIcon} />
									<Text style={[styles.infoTitle, typography.bold, typography["md"]]}>
										Pas encore d'argent de poche
									</Text>
								</View>
								<Text style={styles.infoText}>
									Commencez à lui verser une petite somme à poche pour l'aider à apprendre à gérer un
									vrai budget.
								</Text>
							</View>
						)}

						{/* Section Tâches */}
						<View style={styles.tasksSection}>
							<Text style={[styles.sectionTitle, typography.title, typography["xl"]]}>Ses tâches</Text>

							{loadingTasks ? (
								<ActivityIndicator size="small" color="#007AFF" />
							) : (
								<>
									{/* Tâches régulières */}
									<View style={styles.taskCategory}>
										<TouchableOpacity style={styles.taskCategoryHeader}>
											<View style={styles.taskIconContainer}>
												<Ionicons name="checkbox-outline" size={20} color="#16AA75" />
											</View>
											<Text style={[styles.taskCategoryTitle, typography.bold, typography["sm"]]}>
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
											<View style={styles.taskIconContainer}>
												<Ionicons name="rocket-outline" size={20} color="#16AA75" />
											</View>
											<Text style={[styles.taskCategoryTitle, typography.bold, typography["sm"]]}>
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
												<Ionicons name="add-outline" size={20} color="#828282" />
											</TouchableOpacity>
										</TouchableOpacity>
										{punctualTasks.map(renderTask)}
									</View>

									{/* Message aucune tâche */}
									{tasks.length === 0 && (
										<View style={styles.infoCard}>
											<View style={styles.infoContent}>
												<Ionicons
													name="list-outline"
													size={24}
													color="#52A5FF"
													style={styles.infoIcon}
												/>
												<Text style={[styles.infoTitle, typography.bold, typography["md"]]}>
													Aucune tâche pour l'instant
												</Text>
											</View>
											<Text style={styles.infoText}>
												Ajoutez une tâche pour aider votre enfant à gagner en autonomie (et
												peut-être quelques pièces 💰).
											</Text>
										</View>
									)}
								</>
							)}
						</View>
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
					</View>
				)}

				<View style={styles.bottomPadding} />
			</ScrollView>

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
		backgroundColor: "#FFF",
	},
	contentScrollView: {
		flex: 1,
		backgroundColor: "#EBF2FB",
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
		color: "#666",
	},
	header: {
		paddingTop: 20,
		paddingBottom: 20,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
		marginBottom: 20,
	},
	childSelector: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		marginHorizontal: 20,
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
		color: "#666",
		marginBottom: 8,
	},
	balanceAmount: {
		color: "#333",
	},

	actionButtons: {
		flexDirection: "row",
		gap: 16,
		marginBottom: 24,
	},
	actionButtonContainer: {
		flex: 1,
		alignItems: "center",
	},
	primaryActionButton: {
		width: "100%",
		height: 64,
		backgroundColor: "#6C5CE7",
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 8,
	},
	actionButtonText: {
		textAlign: "center",
		fontSize: 14,
		color: "#333",
	},

	infoCard: {
		backgroundColor: "rgba(191, 208, 234, 0.6)",
		padding: 16,
		borderRadius: 4,
		marginBottom: 24,
	},
	infoContent: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
	},
	infoIcon: {
		fontSize: 24,
		marginBottom: 8,
	},
	infoTitle: {
		color: "#333",
	},
	infoText: {
		color: "#666",
		lineHeight: 20,
	},
	tasksSection: {
		marginBottom: 20,
	},
	sectionTitle: {
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
		marginBottom: 8,
		padding: 8,
		borderRadius: 4,
		shadowColor: "#BFD0EA",
		shadowOffset: {
			width: 0,
			height: 3.89,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
	},
	taskIconContainer: {
		width: 32,
		height: 32,
		borderRadius: 4,
		backgroundColor: "rgba(155, 255, 226, 0.3)",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	taskCategoryTitle: {
		flex: 1,
		color: "#333",
	},
	addButton: {
		width: 32,
		height: 32,
		backgroundColor: "#EAEAEA",
		borderRadius: 4,
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
		marginBottom: 8,
		textAlign: "center",
	},
	emptyText: {
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
		color: "#333",
	},
	modalOptionTextSelected: {
		color: "#fff",
	},
	checkmark: {
		fontSize: 16,
		color: "#fff",
		fontWeight: "bold",
	},
	bottomPadding: {
		height: 60,
	},
	addTaskButton: {
		backgroundColor: "#846DED",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		alignItems: "center",
		shadowColor: "#4E31CF",
		shadowOffset: {
			width: 0,
			height: 3.89,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
	},
	addTaskButtonText: {
		color: "#fff",
	},
	taskItem: {
		backgroundColor: "#fff",
		padding: 12,
		marginVertical: 4,
		marginHorizontal: 8,
		borderRadius: 8,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	taskInfo: {
		flex: 1,
	},
	taskDescription: {
		color: "#333",
	},
	taskReward: {
		color: "#6C5CE7",
		marginBottom: 8,
	},
	taskStatus: {
		width: 40,
		height: 40,
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#CEC5F8",
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
