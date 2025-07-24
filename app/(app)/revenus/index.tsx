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
				<Text style={styles.loadingText}>Chargement...</Text>
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
					<Text style={styles.title}>Mes revenus</Text>
					<Text style={styles.subtitle}>Ton argent de poche et tes gains</Text>
				</View>

				{/* Solde actuel */}
				<View style={styles.balanceCard}>
					<Text style={styles.balanceLabel}>Mon argent de poche</Text>
					<Text style={styles.balanceAmount}>{parseFloat(subAccount?.money || "0").toFixed(2)}€</Text>
					<View style={styles.balanceIcon}>
						<Text style={styles.balanceEmoji}>💰</Text>
					</View>
				</View>

				{/* Statistiques */}
				<View style={styles.statsContainer}>
					<View style={styles.statCard}>
						<Text style={styles.statIcon}>✅</Text>
						<Text style={styles.statValue}>{totalEarned.toFixed(2)}€</Text>
						<Text style={styles.statLabel}>Gagné au total</Text>
					</View>
					<View style={styles.statCard}>
						<Text style={styles.statIcon}>📈</Text>
						<Text style={styles.statValue}>{completedTasks.length}</Text>
						<Text style={styles.statLabel}>Tâches terminées</Text>
					</View>
				</View>

				{/* Actions */}
				<View style={styles.actionsContainer}>
					<TouchableOpacity
						style={styles.addExpenseButton}
						onPress={() => router.push("/(app)/revenus/add-expense")}
					>
						<Text style={styles.addExpenseIcon}>💸</Text>
						<Text style={styles.addExpenseText}>Ajouter une dépense</Text>
					</TouchableOpacity>
				</View>

				{/* Historique des transactions */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Historique des transactions</Text>
					{transactions.length > 0 ? (
						transactions
							.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
							.slice(0, 15)
							.map((transaction) => (
								<View key={transaction.id} style={styles.historyItem}>
									<View style={styles.historyInfo}>
										<Text style={styles.historyDescription}>{transaction.description}</Text>
										<Text style={styles.historyDate}>
											{new Date(transaction.createdAt).toLocaleDateString("fr-FR")}
										</Text>
									</View>
									<Text
										style={[
											styles.historyAmount,
											transaction.type === "CREDIT" ? styles.creditAmount : styles.debitAmount,
										]}
									>
										{transaction.type === "CREDIT" ? "+" : "-"}
										{parseFloat(transaction.amount).toFixed(2)}€
									</Text>
								</View>
							))
					) : (
						<View style={styles.emptyHistory}>
							<Text style={styles.emptyIcon}>💰</Text>
							<Text style={styles.emptyTitle}>Pas encore de transactions</Text>
							<Text style={styles.emptyText}>Tes gains et dépenses apparaîtront ici !</Text>
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
		fontSize: 16,
		color: "#666",
	},
	header: {
		paddingTop: 20,
		paddingBottom: 24,
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: "#666",
		lineHeight: 22,
	},
	balanceCard: {
		backgroundColor: "#6C5CE7",
		borderRadius: 20,
		padding: 24,
		alignItems: "center",
		marginBottom: 24,
		position: "relative",
		overflow: "hidden",
	},
	balanceLabel: {
		fontSize: 16,
		color: "rgba(255, 255, 255, 0.8)",
		marginBottom: 8,
	},
	balanceAmount: {
		fontSize: 48,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 8,
	},
	balanceIcon: {
		position: "absolute",
		top: 20,
		right: 20,
		opacity: 0.3,
	},
	balanceEmoji: {
		fontSize: 40,
	},
	statsContainer: {
		flexDirection: "row",
		gap: 12,
		marginBottom: 24,
	},
	statCard: {
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
	statIcon: {
		fontSize: 24,
		marginBottom: 8,
	},
	statValue: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 4,
	},
	statLabel: {
		fontSize: 12,
		color: "#666",
		textAlign: "center",
	},
	actionsContainer: {
		marginBottom: 24,
	},
	addExpenseButton: {
		backgroundColor: "#FF6B6B",
		borderRadius: 16,
		padding: 16,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	addExpenseIcon: {
		fontSize: 20,
	},
	addExpenseText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 16,
	},
	historyItem: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
		marginBottom: 8,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
	},
	historyInfo: {
		flex: 1,
	},
	historyDescription: {
		fontSize: 14,
		fontWeight: "500",
		color: "#333",
		marginBottom: 4,
	},
	historyDate: {
		fontSize: 12,
		color: "#666",
	},
	historyAmount: {
		fontSize: 16,
		fontWeight: "bold",
	},
	creditAmount: {
		color: "#4CAF50",
	},
	debitAmount: {
		color: "#FF6B6B",
	},
	emptyHistory: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 32,
		alignItems: "center",
	},
	emptyIcon: {
		fontSize: 32,
		marginBottom: 12,
	},
	emptyTitle: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 8,
	},
	emptyText: {
		fontSize: 14,
		color: "#666",
		textAlign: "center",
		lineHeight: 20,
	},
	bottomPadding: {
		height: 20,
	},
});
