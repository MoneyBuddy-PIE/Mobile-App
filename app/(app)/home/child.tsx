import React, { useEffect, useState, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	SafeAreaView,
	ActivityIndicator,
	TouchableOpacity,
	RefreshControl,
	Alert,
} from "react-native";
import { Link, router } from "expo-router";
import { UserStorage } from "@/utils/storage";
import { SubAccount } from "@/types/Account";
import { tasksService } from "@/services/tasksService";
import { Task } from "@/types/Task";
import { typography } from "@/styles/typography";
import { Ionicons } from "@expo/vector-icons";
import { logger } from "@/utils/logger";

export default function ChildHome() {
	const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	const loadData = useCallback(async () => {
		try {
			const accountData = await UserStorage.getSubAccount();
			setSubAccount(accountData);

			if (accountData) {
				const childTasks = await tasksService.getTasksByChild(accountData.id, "CHILD");
				logger.log("Child tasks loaded:", childTasks);
				setTasks(childTasks);
			}
		} catch (error) {
			console.error("Error loading child home data:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await loadData();
		} finally {
			setRefreshing(false);
		}
	}, [loadData]);

	const handleCompleteTask = async (taskId: string) => {
		try {
			await tasksService.completeTask(taskId);
			Alert.alert("Bravo ! 🎉", "Tu as terminé cette tâche !", [{ text: "Super !", onPress: () => loadData() }]);
		} catch (error) {
			console.error("Error completing task:", error);
			Alert.alert("Erreur", "Impossible de terminer la tâche");
		}
	};

	if (loading) {
		return (
			<View style={[styles.container, styles.center]}>
				<ActivityIndicator size="large" color="#6C5CE7" />
				<Text style={[styles.loadingText, typography.body]}>Chargement...</Text>
			</View>
		);
	}

	const completedTasks = tasks.filter((task) => task.done);
	const pendingTasks = tasks.filter((task) => !task.done);
	const currentBalance = parseFloat(subAccount?.money || "0");
	const totalEarned = completedTasks.reduce((sum, task) => sum + parseFloat(task.reward || "0"), 0);
	const potentialEarnings = pendingTasks.reduce((sum, task) => sum + parseFloat(task.reward || "0"), 0);
	const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Bonjour";
		if (hour < 18) return "Bon après-midi";
		return "Bonsoir";
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView
				style={styles.content}
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C5CE7" />}
			>
				{/* Header */}
				<View style={styles.header}>
					<Text style={[styles.greeting, typography.greeting]}>{getGreeting()}</Text>
					<Text style={[styles.childName, typography.title]}>{subAccount?.name || "Mon petit"} !</Text>
					<Text style={[styles.motivationText, typography.subtitle]}>
						{pendingTasks.length > 0
							? `Tu as ${pendingTasks.length} tâche${
									pendingTasks.length > 1 ? "s" : ""
							  } à faire aujourd'hui`
							: "Bravo ! Tu as tout terminé ! 🎉"}
					</Text>
				</View>

				{/* Solde et stats */}
				<View style={styles.statsContainer}>
					<View style={[styles.balanceCard, styles.card]}>
						<Text style={styles.balanceIcon}>💰</Text>
						<Text style={[styles.balanceAmount, typography.heading]}>{currentBalance.toFixed(2)}€</Text>
						<Text style={[styles.balanceLabel, typography.caption]}>Mon argent de poche</Text>
					</View>

					<View style={styles.miniStatsContainer}>
						<View style={[styles.miniStatCard, styles.card]}>
							<Text style={[styles.miniStatValue, typography.subheading]}>{completedTasks.length}</Text>
							<Text style={[styles.miniStatLabel, typography.caption]}>Tâches faites</Text>
						</View>
						<View style={[styles.miniStatCard, styles.card]}>
							<Text style={[styles.miniStatValue, typography.subheading]}>{totalEarned.toFixed(0)}€</Text>
							<Text style={[styles.miniStatLabel, typography.caption]}>Gagné</Text>
						</View>
					</View>
				</View>

				{/* Progression */}
				{tasks.length > 0 && (
					<View style={styles.section}>
						<Text style={[styles.sectionTitle, typography.heading]}>Ma progression</Text>
						<View style={[styles.progressCard, styles.card]}>
							<View style={styles.progressHeader}>
								<Text style={[styles.progressTitle, typography.subheading]}>Tâches complétées</Text>
								<Text style={[styles.progressPercentage, typography.subheading]}>
									{completionRate}%
								</Text>
							</View>
							<View style={styles.progressBarContainer}>
								<View style={styles.progressBar}>
									<View style={[styles.progressFill, { width: `${completionRate}%` }]} />
								</View>
								<Text style={[styles.progressLabel, typography.caption]}>
									{completedTasks.length}/{tasks.length}
								</Text>
							</View>
						</View>
					</View>
				)}

				{/* Mes tâches à faire */}
				{pendingTasks.length > 0 && (
					<View style={styles.section}>
						<Text style={[styles.sectionTitle, typography.heading]}>Mes tâches à faire</Text>
						{pendingTasks.slice(0, 3).map((task) => (
							<TouchableOpacity
								key={task.id}
								style={[styles.taskCard, styles.card]}
								onPress={() => handleCompleteTask(task.id)}
								activeOpacity={0.7}
							>
								<View style={styles.taskInfo}>
									<Text style={[styles.taskDescription, typography.subheading]}>
										{task.description}
									</Text>
									<View style={styles.taskMeta}>
										<View
											style={[
												styles.categoryBadge,
												task.category === "REGULAR"
													? styles.regularCategory
													: styles.punctualCategory,
											]}
										>
											<Text style={[styles.taskCategory, typography.caption]}>
												{task.category === "REGULAR" ? "Régulière" : "Ponctuelle"}
											</Text>
										</View>
										<Text style={[styles.taskReward, typography.buttonSmall]}>+{task.reward}€</Text>
									</View>
								</View>
								<View style={styles.taskAction}>
									<View style={[styles.actionButton, task.done && styles.actionButtonCompleted]}>
										{task.done ?? <Ionicons name="checkmark-outline" size={24} color="#FFF" />}
									</View>
								</View>
							</TouchableOpacity>
						))}

						{pendingTasks.length > 3 && (
							<TouchableOpacity style={styles.viewMoreButton}>
								<Text style={[styles.viewMoreText, typography.body]}>
									Voir {pendingTasks.length - 3} autres tâches
								</Text>
								<Ionicons name="chevron-forward" size={16} color="#6C5CE7" />
							</TouchableOpacity>
						)}
					</View>
				)}

				{/* Tâches complétées récemment */}
				{completedTasks.length > 0 && (
					<View style={styles.section}>
						<Text style={[styles.sectionTitle, typography.heading]}>Récemment terminées</Text>
						{completedTasks.slice(0, 3).map((task) => (
							<View key={task.id} style={[styles.completedTaskCard, styles.card]}>
								<View style={styles.taskInfo}>
									<Text style={[styles.completedTaskDescription, typography.body]}>
										{task.description}
									</Text>
									<Text style={[styles.completedTaskDate, typography.caption]}>
										{new Date(task.updatedAt).toLocaleDateString("fr-FR")}
									</Text>
								</View>
								<View style={styles.completedReward}>
									<View style={styles.completedIcon}>
										<Ionicons name="checkmark" size={16} color="#4CAF50" />
									</View>
									<Text style={[styles.completedAmount, typography.buttonSmall]}>
										+{task.reward}€
									</Text>
								</View>
							</View>
						))}
					</View>
				)}

				{/* Message motivant */}
				<View style={[styles.motivationCard, styles.card]}>
					<Text style={styles.motivationIcon}>
						{pendingTasks.length === 0 ? "🎉" : potentialEarnings > 0 ? "💪" : "🌟"}
					</Text>
					<Text style={[styles.motivationTitle, typography.subheading]}>
						{pendingTasks.length === 0
							? "Excellent travail !"
							: potentialEarnings > 0
							? "Continue comme ça !"
							: "Tu es formidable !"}
					</Text>
					<Text style={[styles.motivationDescription, typography.body]}>
						{pendingTasks.length === 0
							? "Tu as terminé toutes tes tâches ! Tu peux être fier de toi."
							: potentialEarnings > 0
							? `Tu peux encore gagner ${potentialEarnings.toFixed(2)}€ en finissant tes tâches.`
							: "Demande à tes parents de t'ajouter des tâches pour gagner de l'argent de poche !"}
					</Text>
				</View>

				<View style={styles.bottomPadding} />
			</ScrollView>
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
		color: "#666",
	},
	header: {
		paddingTop: 60,
		paddingBottom: 30,
	},
	greeting: {
		marginBottom: 4,
	},
	childName: {
		marginBottom: 8,
	},
	motivationText: {
		lineHeight: 22,
	},

	// Cards et composants réutilisables
	card: {
		backgroundColor: "#fff",
		borderRadius: 8,
		shadowColor: "#BFD0EA",
		shadowOffset: {
			width: 0,
			height: 3.89,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
	},

	// Stats
	statsContainer: {
		flexDirection: "row",
		gap: 12,
		marginBottom: 30,
	},
	balanceCard: {
		flex: 2,
		alignItems: "center",
		backgroundColor: "#6C5CE7",
		padding: 24,
	},
	balanceIcon: {
		fontSize: 32,
		marginBottom: 8,
	},
	balanceAmount: {
		color: "#fff",
		marginBottom: 4,
	},
	balanceLabel: {
		color: "rgba(255, 255, 255, 0.8)",
		textAlign: "center",
	},
	miniStatsContainer: {
		flex: 1,
		gap: 12,
	},
	miniStatCard: {
		flex: 1,
		padding: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	miniStatValue: {
		color: "#333",
		marginBottom: 4,
	},
	miniStatLabel: {
		textAlign: "center",
		color: "#666",
	},

	// Sections
	section: {
		marginBottom: 30,
	},
	sectionTitle: {
		color: "#333",
		marginBottom: 16,
	},

	// Tâches
	taskCard: {
		padding: 16,
		marginBottom: 12,
		flexDirection: "row",
		alignItems: "center",
	},
	taskInfo: {
		flex: 1,
	},
	taskDescription: {
		color: "#333",
		marginBottom: 8,
	},
	taskMeta: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	categoryBadge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#EBF2FB",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
	},
	regularCategory: {
		backgroundColor: "#E1FFF6",
	},
	punctualCategory: {
		backgroundColor: "rgba(254, 160, 186, 0.4)",
	},
	categoryIcon: {
		fontSize: 12,
		marginRight: 4,
	},
	taskCategory: {
		color: "#6C5CE7",
	},
	taskReward: {
		color: "#FF9800",
		fontWeight: "bold",
	},
	taskAction: {
		alignItems: "center",
		marginLeft: 16,
	},
	actionButton: {
		width: 40,
		height: 40,
		backgroundColor: "#CEC5F8",
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
	},
	actionButtonCompleted: {
		backgroundColor: "#846DED",
	},

	// Boutons et actions
	viewMoreButton: {
		backgroundColor: "#f8f9fa",
		borderRadius: 8,
		padding: 16,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: "#e0e0e0",
		borderStyle: "dashed",
		gap: 8,
	},
	viewMoreText: {
		color: "#6C5CE7",
		fontWeight: "500",
	},

	// Progression
	progressCard: {
		padding: 20,
	},
	progressHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	progressTitle: {
		color: "#333",
	},
	progressPercentage: {
		color: "#4CAF50",
	},
	progressBarContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	progressBar: {
		flex: 1,
		height: 8,
		backgroundColor: "#e0e0e0",
		borderRadius: 4,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: "#4CAF50",
		borderRadius: 4,
	},
	progressLabel: {
		color: "#666",
		minWidth: 40,
		textAlign: "right",
	},

	// Tâches complétées
	completedTaskCard: {
		backgroundColor: "#E8F5E8",
		padding: 16,
		marginBottom: 8,
		flexDirection: "row",
		alignItems: "center",
	},
	completedTaskDescription: {
		color: "#333",
		marginBottom: 4,
	},
	completedTaskDate: {
		color: "#666",
	},
	completedReward: {
		alignItems: "center",
		gap: 4,
	},
	completedIcon: {
		width: 24,
		height: 24,
		backgroundColor: "#4CAF50",
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
	},
	completedAmount: {
		color: "#4CAF50",
		fontWeight: "bold",
	},

	// Actions rapides
	quickActions: {
		flexDirection: "row",
		gap: 12,
	},
	actionCard: {
		flex: 1,
		padding: 20,
		alignItems: "center",
	},
	actionButtonIcon: {
		fontSize: 32,
		marginBottom: 8,
	},
	actionButtonText: {
		color: "#333",
		fontWeight: "600",
		textAlign: "center",
	},

	// Motivation
	motivationCard: {
		backgroundColor: "#FFF8E1",
		padding: 24,
		alignItems: "center",
		marginBottom: 20,
	},
	motivationIcon: {
		fontSize: 40,
		marginBottom: 12,
	},
	motivationTitle: {
		color: "#333",
		marginBottom: 8,
		textAlign: "center",
	},
	motivationDescription: {
		color: "#666",
		textAlign: "center",
		lineHeight: 20,
	},

	bottomPadding: {
		height: 20,
	},
});
