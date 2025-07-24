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
				<Text style={styles.loadingText}>Chargement...</Text>
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
					<Text style={styles.greeting}>{getGreeting()}</Text>
					<Text style={styles.childName}>{subAccount?.name || "Mon petit"} !</Text>
					<Text style={styles.motivationText}>
						{pendingTasks.length > 0
							? `Tu as ${pendingTasks.length} tâche${
									pendingTasks.length > 1 ? "s" : ""
							  } à faire aujourd'hui`
							: "Bravo ! Tu as tout terminé ! 🎉"}
					</Text>
				</View>

				{/* Solde et stats */}
				<View style={styles.statsContainer}>
					<View style={[styles.statCard, styles.balanceCard]}>
						<Text style={styles.balanceIcon}>💰</Text>
						<Text style={styles.balanceAmount}>{currentBalance.toFixed(2)}€</Text>
						<Text style={styles.balanceLabel}>Mon argent de poche</Text>
					</View>

					<View style={styles.miniStatsContainer}>
						<View style={styles.miniStatCard}>
							<Text style={styles.miniStatValue}>{completedTasks.length}</Text>
							<Text style={styles.miniStatLabel}>Tâches faites</Text>
						</View>
						<View style={styles.miniStatCard}>
							<Text style={styles.miniStatValue}>{totalEarned.toFixed(0)}€</Text>
							<Text style={styles.miniStatLabel}>Gagné</Text>
						</View>
					</View>
				</View>

				{/* Mes tâches à faire */}
				{pendingTasks.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Mes tâches à faire</Text>
						{pendingTasks.slice(0, 3).map((task) => (
							<TouchableOpacity
								key={task.id}
								style={styles.taskCard}
								onPress={() => handleCompleteTask(task.id)}
							>
								<View style={styles.taskInfo}>
									<Text style={styles.taskDescription}>{task.description}</Text>
									<View style={styles.taskMeta}>
										<Text style={styles.taskCategory}>
											{task.category === "REGULAR" ? "🔄 Régulière" : "⚡ Ponctuelle"}
										</Text>
										<Text style={styles.taskReward}>+{task.reward}€</Text>
									</View>
								</View>
								<View style={styles.taskAction}>
									<Text style={styles.actionIcon}>○</Text>
									<Text style={styles.actionText}>Terminer</Text>
								</View>
							</TouchableOpacity>
						))}

						{pendingTasks.length > 3 && (
							<TouchableOpacity style={styles.viewMoreButton}>
								<Text style={styles.viewMoreText}>Voir {pendingTasks.length - 3} autres tâches</Text>
							</TouchableOpacity>
						)}
					</View>
				)}

				{/* Progression */}
				{tasks.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Ma progression</Text>
						<View style={styles.progressCard}>
							<View style={styles.progressHeader}>
								<Text style={styles.progressTitle}>Tâches complétées</Text>
								<Text style={styles.progressPercentage}>{completionRate}%</Text>
							</View>
							<View style={styles.progressBarContainer}>
								<View style={styles.progressBar}>
									<View style={[styles.progressFill, { width: `${completionRate}%` }]} />
								</View>
								<Text style={styles.progressLabel}>
									{completedTasks.length}/{tasks.length}
								</Text>
							</View>
						</View>
					</View>
				)}

				{/* Tâches complétées récemment */}
				{completedTasks.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Récemment terminées</Text>
						{completedTasks.slice(0, 3).map((task) => (
							<View key={task.id} style={styles.completedTaskCard}>
								<View style={styles.taskInfo}>
									<Text style={styles.completedTaskDescription}>{task.description}</Text>
									<Text style={styles.completedTaskDate}>
										{new Date(task.updatedAt).toLocaleDateString("fr-FR")}
									</Text>
								</View>
								<View style={styles.completedReward}>
									<Text style={styles.completedIcon}>✓</Text>
									<Text style={styles.completedAmount}>+{task.reward}€</Text>
								</View>
							</View>
						))}
					</View>
				)}

				{/* Actions rapides */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Actions rapides</Text>
					<View style={styles.quickActions}>
						<Link href="/(app)/courses" asChild>
							<TouchableOpacity style={styles.actionButton}>
								<Text style={styles.actionButtonIcon}>📚</Text>
								<Text style={styles.actionButtonText}>Mes cours</Text>
							</TouchableOpacity>
						</Link>

						<Link href="/(app)/revenus" asChild>
							<TouchableOpacity style={styles.actionButton}>
								<Text style={styles.actionButtonIcon}>💰</Text>
								<Text style={styles.actionButtonText}>Mes revenus</Text>
							</TouchableOpacity>
						</Link>
					</View>
				</View>

				{/* Message motivant */}
				<View style={styles.motivationCard}>
					<Text style={styles.motivationIcon}>
						{pendingTasks.length === 0 ? "🎉" : potentialEarnings > 0 ? "💪" : "🌟"}
					</Text>
					<Text style={styles.motivationTitle}>
						{pendingTasks.length === 0
							? "Excellent travail !"
							: potentialEarnings > 0
							? "Continue comme ça !"
							: "Tu es formidable !"}
					</Text>
					<Text style={styles.motivationDescription}>
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
		fontSize: 16,
		color: "#666",
	},
	header: {
		paddingTop: 60,
		paddingBottom: 30,
	},
	greeting: {
		fontSize: 18,
		color: "#666",
		marginBottom: 4,
	},
	childName: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 8,
	},
	motivationText: {
		fontSize: 16,
		color: "#666",
		lineHeight: 22,
	},
	statsContainer: {
		flexDirection: "row",
		gap: 12,
		marginBottom: 30,
	},
	statCard: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	balanceCard: {
		flex: 2,
		alignItems: "center",
		backgroundColor: "#6C5CE7",
	},
	balanceIcon: {
		fontSize: 32,
		marginBottom: 8,
	},
	balanceAmount: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 4,
	},
	balanceLabel: {
		fontSize: 12,
		color: "rgba(255, 255, 255, 0.8)",
	},
	miniStatsContainer: {
		flex: 1,
		gap: 12,
	},
	miniStatCard: {
		flex: 1,
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 12,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
	},
	miniStatValue: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 2,
	},
	miniStatLabel: {
		fontSize: 10,
		color: "#666",
		textAlign: "center",
	},
	section: {
		marginBottom: 30,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 16,
	},
	taskCard: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 16,
		marginBottom: 12,
		flexDirection: "row",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	taskInfo: {
		flex: 1,
	},
	taskDescription: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		marginBottom: 6,
	},
	taskMeta: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	taskCategory: {
		fontSize: 12,
		color: "#666",
	},
	taskReward: {
		fontSize: 14,
		fontWeight: "bold",
		color: "#FF9800",
	},
	taskAction: {
		alignItems: "center",
		marginLeft: 16,
		minWidth: 60,
	},
	actionIcon: {
		fontSize: 24,
		color: "#ddd",
		marginBottom: 4,
	},
	actionText: {
		fontSize: 12,
		color: "#666",
		fontWeight: "500",
	},
	viewMoreButton: {
		backgroundColor: "#f8f9fa",
		borderRadius: 12,
		padding: 16,
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#e0e0e0",
		borderStyle: "dashed",
	},
	viewMoreText: {
		fontSize: 14,
		color: "#666",
		fontWeight: "500",
	},
	progressCard: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	progressHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	progressTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
	},
	progressPercentage: {
		fontSize: 18,
		fontWeight: "bold",
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
		fontSize: 12,
		color: "#666",
		fontWeight: "500",
		minWidth: 40,
	},
	completedTaskCard: {
		backgroundColor: "#E8F5E8",
		borderRadius: 12,
		padding: 16,
		marginBottom: 8,
		flexDirection: "row",
		alignItems: "center",
	},
	completedTaskDescription: {
		fontSize: 14,
		fontWeight: "500",
		color: "#333",
		marginBottom: 4,
	},
	completedTaskDate: {
		fontSize: 12,
		color: "#666",
	},
	completedReward: {
		alignItems: "center",
		gap: 4,
	},
	completedIcon: {
		fontSize: 16,
		color: "#4CAF50",
	},
	completedAmount: {
		fontSize: 12,
		fontWeight: "bold",
		color: "#4CAF50",
	},
	quickActions: {
		flexDirection: "row",
		gap: 12,
	},
	actionButton: {
		flex: 1,
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 20,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	actionButtonIcon: {
		fontSize: 32,
		marginBottom: 8,
	},
	actionButtonText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#333",
	},
	motivationCard: {
		backgroundColor: "#FFF8E1",
		borderRadius: 16,
		padding: 24,
		alignItems: "center",
		marginBottom: 20,
	},
	motivationIcon: {
		fontSize: 40,
		marginBottom: 12,
	},
	motivationTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 8,
		textAlign: "center",
	},
	motivationDescription: {
		fontSize: 14,
		color: "#666",
		textAlign: "center",
		lineHeight: 20,
	},
	bottomPadding: {
		height: 20,
	},
});
