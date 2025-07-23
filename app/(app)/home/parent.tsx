import React, { useEffect, useState, useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { Link, router } from "expo-router";
import { UserStorage } from "@/utils/storage";
import { SubAccount } from "@/types/Account";
import { useAuthContext } from "@/contexts/AuthContext";
import { tasksService } from "@/services/tasksService";

interface ChildSummary {
	child: SubAccount;
	tasksCount: number;
	completedTasksCount: number;
	loading: boolean;
}

export default function Home() {
	const { user, refreshUserData } = useAuthContext();
	const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
	const [childrenSummary, setChildrenSummary] = useState<ChildSummary[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	const childAccounts = useMemo(() => 
		user?.subAccounts?.filter((account) => account.role === "CHILD") || [], 
		[user?.subAccounts]
	);

	const loadData = useCallback(async () => {
		try {
			const accountData = await UserStorage.getSubAccount();
			setSubAccount(accountData);
		} catch (error) {
			console.error("Error loading account:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	const loadChildrenData = useCallback(async () => {
		if (childAccounts.length === 0) return;

		// Initialiser le state avec les enfants
		const initialSummaries: ChildSummary[] = childAccounts.map(child => ({
			child,
			tasksCount: 0,
			completedTasksCount: 0,
			loading: true,
		}));
		setChildrenSummary(initialSummaries);

		// Charger les tâches pour chaque enfant
		for (let i = 0; i < childAccounts.length; i++) {
			const child = childAccounts[i];
			try {
				const tasks = await tasksService.getTasksByChild(child.id, "PARENT");
				const completedTasks = tasks.filter(task => task.done);
				
				setChildrenSummary(prev => prev.map((summary, index) => 
					index === i 
						? { 
							...summary, 
							tasksCount: tasks.length, 
							completedTasksCount: completedTasks.length,
							loading: false 
						}
						: summary
				));
			} catch (error) {
				console.error(`Error loading tasks for child ${child.id}:`, error);
				setChildrenSummary(prev => prev.map((summary, index) => 
					index === i ? { ...summary, loading: false } : summary
				));
			}
		}
	}, [childAccounts]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	useEffect(() => {
		if (childAccounts.length > 0) {
			loadChildrenData();
		} else {
			setChildrenSummary([]);
		}
	}, [childAccounts.length, loadChildrenData]);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await refreshUserData();
		} finally {
			setRefreshing(false);
		}
	}, [refreshUserData]);

	const renderChildCard = (summary: ChildSummary) => {
		const { child, tasksCount, completedTasksCount, loading: childLoading } = summary;
		const money = parseFloat(child.money || "0");
		const completionRate = tasksCount > 0 ? Math.round((completedTasksCount / tasksCount) * 100) : 0;

		return (
			<TouchableOpacity
				key={child.id}
				style={styles.childCard}
				onPress={() => router.push({
					pathname: "/(app)/children",
					params: { selectedChildId: child.id }
				})}
			>
				<View style={styles.childHeader}>
					<View style={styles.childIconContainer}>
						<Text style={styles.childIcon}>👶</Text>
					</View>
					<View style={styles.childInfo}>
						<Text style={styles.childName}>{child.name}</Text>
						<Text style={styles.childRole}>Enfant</Text>
					</View>
					<Text style={styles.arrowIcon}>→</Text>
				</View>

				<View style={styles.childStats}>
					{/* Argent de poche */}
					<View style={styles.stat}>
						<Text style={styles.statIcon}>💰</Text>
						<Text style={styles.statValue}>{money.toFixed(2)}€</Text>
						<Text style={styles.statLabel}>Argent de poche</Text>
					</View>

					{/* Tâches */}
					<View style={styles.stat}>
						{childLoading ? (
							<ActivityIndicator size="small" color="#6C5CE7" />
						) : (
							<>
								<Text style={styles.statIcon}>📝</Text>
								<Text style={styles.statValue}>{completedTasksCount}/{tasksCount}</Text>
								<Text style={styles.statLabel}>Tâches réalisées</Text>
							</>
						)}
					</View>

					{/* Progression */}
					{tasksCount > 0 && (
						<View style={styles.stat}>
							<Text style={styles.statIcon}>🎯</Text>
							<Text style={styles.statValue}>{completionRate}%</Text>
							<Text style={styles.statLabel}>Progression</Text>
						</View>
					)}
				</View>

				{/* Barre de progression */}
				{tasksCount > 0 && (
					<View style={styles.progressContainer}>
						<View style={styles.progressTrack}>
							<View 
								style={[styles.progressFill, { width: `${completionRate}%` }]} 
							/>
						</View>
					</View>
				)}
			</TouchableOpacity>
		);
	};

	if (loading) {
		return (
			<View style={[styles.container, styles.center]}>
				<ActivityIndicator size="large" color="#007AFF" />
				<Text style={styles.loadingText}>Chargement...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<ScrollView 
				style={styles.content} 
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
				}
			>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.welcomeText}>Bonjour</Text>
					<Text style={styles.nameText}>{subAccount?.name || "Parent"}</Text>
					<Text style={styles.roleText}>Compte {subAccount?.role || "PARENT"}</Text>
				</View>

				{/* Section Enfants */}
				{childAccounts.length > 0 ? (
					<View style={styles.section}>
						<View style={styles.sectionHeader}>
							<Text style={styles.sectionTitle}>Mes enfants</Text>
							<Link href="/(app)/children" asChild>
								<TouchableOpacity style={styles.seeAllButton}>
									<Text style={styles.seeAllText}>Tout voir</Text>
								</TouchableOpacity>
							</Link>
						</View>
						
						{childrenSummary.map(renderChildCard)}
					</View>
				) : (
					<View style={styles.section}>
						<View style={styles.emptyContainer}>
							<Text style={styles.emptyIcon}>👶</Text>
							<Text style={styles.emptyTitle}>Aucun enfant</Text>
							<Text style={styles.emptyText}>Créez un compte enfant pour commencer</Text>
							<Link href="/accounts/create" asChild>
								<TouchableOpacity style={styles.createButton}>
									<Text style={styles.createButtonText}>Créer un compte enfant</Text>
								</TouchableOpacity>
							</Link>
						</View>
					</View>
				)}

				{/* Quick Actions */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Actions rapides</Text>
					<View style={styles.actionGrid}>
						<Link href="/(app)/courses" asChild>
							<TouchableOpacity style={styles.actionCard}>
								<Text style={styles.actionIcon}>📚</Text>
								<Text style={styles.actionText}>Mes cours</Text>
							</TouchableOpacity>
						</Link>
						
						<Link href="/(app)/accounts/create" asChild>
							<TouchableOpacity style={styles.actionCard}>
								<Text style={styles.actionIcon}>👶</Text>
								<Text style={styles.actionText}>Ajouter enfant</Text>
							</TouchableOpacity>
						</Link>
						
						<Link href="/(app)/profile" asChild>
							<TouchableOpacity style={styles.actionCard}>
								<Text style={styles.actionIcon}>⚙️</Text>
								<Text style={styles.actionText}>Paramètres</Text>
							</TouchableOpacity>
						</Link>
					</View>
				</View>

				<View style={styles.bottomPadding} />
			</ScrollView>
		</View>
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
	welcomeText: {
		fontSize: 18,
		color: "#666",
		marginBottom: 4,
	},
	nameText: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 4,
	},
	roleText: {
		fontSize: 16,
		color: "#007AFF",
		fontWeight: "600",
	},
	section: {
		marginBottom: 30,
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#333",
	},
	seeAllButton: {
		padding: 8,
	},
	seeAllText: {
		fontSize: 14,
		color: "#007AFF",
		fontWeight: "600",
	},
	childCard: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 16,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	childHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 16,
	},
	childIconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#f0f8ff",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	childIcon: {
		fontSize: 20,
	},
	childInfo: {
		flex: 1,
	},
	childName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		marginBottom: 2,
	},
	childRole: {
		fontSize: 12,
		color: "#666",
	},
	arrowIcon: {
		fontSize: 16,
		color: "#999",
	},
	childStats: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 12,
	},
	stat: {
		alignItems: "center",
		flex: 1,
	},
	statIcon: {
		fontSize: 20,
		marginBottom: 4,
	},
	statValue: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 2,
	},
	statLabel: {
		fontSize: 11,
		color: "#666",
		textAlign: "center",
	},
	progressContainer: {
		marginTop: 8,
	},
	progressTrack: {
		height: 4,
		backgroundColor: "#e0e0e0",
		borderRadius: 2,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: "#4CAF50",
		borderRadius: 2,
	},
	emptyContainer: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 40,
		alignItems: "center",
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
	},
	emptyText: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		marginBottom: 20,
	},
	createButton: {
		backgroundColor: "#007AFF",
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	createButtonText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "600",
	},
	actionGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
	},
	actionCard: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 20,
		width: "30%",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	actionIcon: {
		fontSize: 32,
		marginBottom: 8,
	},
	actionText: {
		fontSize: 12,
		fontWeight: "600",
		color: "#333",
		textAlign: "center",
	},
	bottomPadding: {
		height: 20,
	},
});