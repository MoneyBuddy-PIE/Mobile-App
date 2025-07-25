import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	SafeAreaView,
	ActivityIndicator,
	RefreshControl,
	TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { UserStorage } from "@/utils/storage";
import { SubAccount } from "@/types/Account";
import { tasksService } from "@/services/tasksService";
import { transactionService } from "@/services/transactionService";
import { Task } from "@/types/Task";
import { Transaction } from "@/types/Transaction";
import { typography } from "@/styles/typography";
import { Ionicons } from "@expo/vector-icons";
import { logger } from "@/utils/logger";

export default function Revenus() {
	const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			const accountData = await UserStorage.getSubAccount();
			setSubAccount(accountData);
			logger.log("Revenus - SubAccount loaded:", accountData);
			if (accountData) {
				// Charger les tâches pour les statistiques
				const childTasks = await tasksService.getTasksByChild(accountData.id, "CHILD");
				setTasks(childTasks);

				// Charger les transactions pour l'historique
				const accountTransactions = await transactionService.getTransactionsBySubAccount(accountData.id);
				setTransactions(accountTransactions);
			}
		} catch (error) {
			console.error("Error loading revenus data:", error);
		} finally {
			setLoading(false);
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		try {
			await loadData();
		} finally {
			setRefreshing(false);
		}
	};

	const completedTasks = tasks.filter((task) => task.done);
	const totalEarned = completedTasks.reduce((sum, task) => sum + parseFloat(task.reward || "0"), 0);

	if (loading) {
		return (
			<View style={[styles.container, styles.center]}>
				<ActivityIndicator size="large" color="#6C5CE7" />
				<Text style={[styles.loadingText, typography.body]}>Chargement...</Text>
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView
				style={styles.content}
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C5CE7" />}
			>
				{/* Header */}
				<View style={styles.header}>
					<Text style={[styles.title, typography.title]}>Mes revenus</Text>
					<Text style={[styles.subtitle, typography.subtitle]}>Ton argent de poche et tes gains</Text>
				</View>

				{/* Solde actuel */}
				<View style={[styles.balanceCard, styles.card]}>
					<View style={styles.balanceHeader}>
						<Text style={[styles.balanceLabel, typography.body]}>Mon argent de poche</Text>
						<View style={styles.balanceIcon}>
							<Text style={styles.balanceEmoji}>💰</Text>
						</View>
					</View>
					<Text style={[styles.balanceAmount, typography["5xl"], typography.bold]}>
						{parseFloat(subAccount?.money || "0").toFixed(2)}€
					</Text>
				</View>

				{/* Statistiques */}
				<View style={styles.statsContainer}>
					<View style={[styles.statCard, styles.card]}>
						<View style={styles.statIconContainer}>
							<Text style={styles.statIcon}>✅</Text>
						</View>
						<Text style={[styles.statValue, typography.heading]}>{totalEarned.toFixed(2)}€</Text>
						<Text style={[styles.statLabel, typography.caption]}>Gagné au total</Text>
					</View>
					<View style={[styles.statCard, styles.card]}>
						<View style={styles.statIconContainer}>
							<Text style={styles.statIcon}>📈</Text>
						</View>
						<Text style={[styles.statValue, typography.heading]}>{completedTasks.length}</Text>
						<Text style={[styles.statLabel, typography.caption]}>Tâches terminées</Text>
					</View>
				</View>

				{/* Actions */}
				<View style={styles.actionsContainer}>
					<TouchableOpacity
						style={[styles.addExpenseButton]}
						onPress={() => router.push("/(app)/revenus/add-expense")}
					>
						<View style={styles.expenseButtonContent}>
							<View style={styles.expenseIconContainer}>
								<Ionicons name="remove-circle" size={24} color="#fff" />
							</View>
							<Text style={[styles.addExpenseText, typography.button]}>Ajouter une dépense</Text>
							<Ionicons name="chevron-forward" size={20} color="#fff" />
						</View>
					</TouchableOpacity>
				</View>

				{/* Conseils */}
				<View style={[styles.tipsCard, styles.card]}>
					<View style={styles.tipsHeader}>
						<View style={styles.tipIconContainer}>
							<Ionicons name="bulb" size={20} color="#FF9800" />
						</View>
						<Text style={[styles.tipsTitle, typography.subheading]}>Conseil du jour</Text>
					</View>
					<Text style={[styles.tipsText, typography.body]}>
						💡 Essaie d'économiser un petit peu de ton argent de poche chaque semaine. Même 50 centimes te
						permettront d'acheter quelque chose de plus gros plus tard !
					</Text>
				</View>

				{/* Historique des transactions */}
				<View style={styles.section}>
					<Text style={[styles.sectionTitle, typography.heading]}>Historique des transactions</Text>
					{transactions.length > 0 ? (
						<View style={[styles.historyContainer, styles.card]}>
							{transactions
								.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
								.slice(0, 15)
								.map((transaction, index) => (
									<View
										key={transaction.id}
										style={[
											styles.historyItem,
											index < transactions.slice(0, 15).length - 1 && styles.historyItemBorder,
										]}
									>
										<View style={styles.transactionIcon}>
											<Ionicons
												name={transaction.type === "CREDIT" ? "arrow-up" : "arrow-down"}
												size={16}
												color={transaction.type === "CREDIT" ? "#4CAF50" : "#FF6B6B"}
											/>
										</View>
										<View style={styles.historyInfo}>
											<Text style={[styles.historyDescription, typography.body]}>
												{transaction.description}
											</Text>
											<Text style={[styles.historyDate, typography.caption]}>
												{new Date(transaction.createdAt).toLocaleDateString("fr-FR")}
											</Text>
										</View>
										<Text
											style={[
												styles.historyAmount,
												typography.buttonSmall,
												transaction.type === "CREDIT"
													? styles.creditAmount
													: styles.debitAmount,
											]}
										>
											{transaction.type === "CREDIT" ? "+" : "-"}
											{parseFloat(transaction.amount).toFixed(2)}€
										</Text>
									</View>
								))}
						</View>
					) : (
						<View style={[styles.emptyHistory, styles.card]}>
							<Text style={styles.emptyIcon}>💰</Text>
							<Text style={[styles.emptyTitle, typography.subheading]}>Pas encore de transactions</Text>
							<Text style={[styles.emptyText, typography.body]}>
								Tes gains et dépenses apparaîtront ici !
							</Text>
						</View>
					)}
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

	// Header
	header: {
		paddingTop: 60,
		paddingBottom: 24,
	},
	title: {
		marginBottom: 8,
	},
	subtitle: {
		lineHeight: 22,
	},

	// Solde
	balanceCard: {
		padding: 24,
		marginBottom: 24,
		position: "relative",
		overflow: "hidden",
		backgroundColor: "#6C5CE7",
	},
	balanceHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	balanceLabel: {
		color: "rgba(255, 255, 255, 0.9)",
	},
	balanceIcon: {
		opacity: 0.3,
	},
	balanceEmoji: {
		fontSize: 32,
	},
	balanceAmount: {
		textAlign: "center",
	},

	// Stats
	statsContainer: {
		flexDirection: "row",
		gap: 12,
		marginBottom: 24,
	},
	statCard: {
		flex: 1,
		padding: 20,
		alignItems: "center",
	},
	statIconContainer: {
		width: 48,
		height: 48,
		backgroundColor: "#EBF2FB",
		borderRadius: 24,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 12,
	},
	statIcon: {
		fontSize: 20,
	},
	statValue: {
		color: "#333",
		marginBottom: 4,
	},
	statLabel: {
		textAlign: "center",
		color: "#666",
	},

	// Actions
	actionsContainer: {
		marginBottom: 24,
	},
	addExpenseButton: {
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
	expenseButtonContent: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	expenseIconContainer: {
		width: 40,
		height: 40,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	addExpenseText: {
		color: "#fff",
		flex: 1,
		marginLeft: 16,
	},

	// Sections
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		color: "#333",
		marginBottom: 16,
	},

	// Historique
	historyContainer: {
		padding: 0,
		overflow: "hidden",
	},
	historyItem: {
		padding: 16,
		flexDirection: "row",
		alignItems: "center",
	},
	historyItemBorder: {
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
	},
	transactionIcon: {
		width: 32,
		height: 32,
		backgroundColor: "#f8f9fa",
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	historyInfo: {
		flex: 1,
	},
	historyDescription: {
		color: "#333",
		marginBottom: 4,
	},
	historyDate: {
		color: "#666",
	},
	historyAmount: {
		fontWeight: "bold",
	},
	creditAmount: {
		color: "#4CAF50",
	},
	debitAmount: {
		color: "#FF6B6B",
	},

	// Empty state
	emptyHistory: {
		padding: 32,
		alignItems: "center",
	},
	emptyIcon: {
		fontSize: 32,
		marginBottom: 12,
	},
	emptyTitle: {
		color: "#333",
		marginBottom: 8,
		textAlign: "center",
	},
	emptyText: {
		color: "#666",
		textAlign: "center",
		lineHeight: 20,
	},

	// Tips
	tipsCard: {
		padding: 20,
		backgroundColor: "#FFF8E1",
		marginBottom: 20,
	},
	tipsHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
	},
	tipIconContainer: {
		width: 32,
		height: 32,
		backgroundColor: "#FFE0B2",
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	tipsTitle: {
		color: "#333",
	},
	tipsText: {
		color: "#666",
		lineHeight: 20,
	},

	bottomPadding: {
		height: 20,
	},
});
