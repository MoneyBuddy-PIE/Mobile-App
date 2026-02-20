import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { UserStorage } from "@/utils/storage";
import { SubAccount } from "@/types/Account";
import { tasksService } from "@/services/tasksService";
import { transactionService } from "@/services/transactionService";
import { goalsService } from "@/services/goalsService";
import { Task } from "@/types/Task";
import { Transaction } from "@/types/Transaction";
import { Goal } from "@/types/Goal";
import { typography, colors, spacing, shadows } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { logger } from "@/utils/logger";
import { BottomSheet } from "@/components/BottomSheet";
import { CoinIcon } from "@/components/Icons/CoinIcon";
import { LightningIcon } from "@/components/Icons/LightningIcon";
import MoneyBill from "@/components/Icons/MoneyBill";
import ListCheck from "@/components/Icons/ListCheck";
import MoneyFly from "@/components/Icons/MoneyFly";
import Pig from "@/components/Icons/Pig";

export default function ChildHome() {
    const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [detailsVisible, setDetailsVisible] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const accountData = await UserStorage.getSubAccount();
            setSubAccount(accountData);

            if (accountData) {
                const childTasks = await tasksService.getTasksByChild(accountData.id, "CHILD");
                setTasks(childTasks);

                try {
                    const childTransactions = await transactionService.getTransactionsBySubAccount(accountData.id);
                    setTransactions(childTransactions);
                } catch (error) {
                    logger.error("Error loading child transactions:", error);
                    setTransactions([]);
                }

                try {
                    const childGoals = await goalsService.getGoals(accountData.id);
                    setGoals(childGoals);
                } catch (error) {
                    logger.error("Error loading child goals:", error);
                    setGoals([]);
                }
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
                <ActivityIndicator size="large" color={colors.primary[100]} />
                <Text style={[styles.loadingText, typography.md]}>Chargement...</Text>
            </View>
        );
    }

    const completedTasks = tasks.filter((task) => task.status === "COMPLETED");
    const pendingTasks = tasks.filter((task) => task.status === "PENDING");
    const currentBalance = parseFloat(subAccount?.money || "0");
    const totalEarned = completedTasks.reduce((sum, task) => sum + parseFloat(task.reward || "0"), 0);
    const potentialEarnings = pendingTasks.reduce((sum, task) => sum + parseFloat(task.reward || "0"), 0);
    const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthlyTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt);
        return transactionDate >= startOfMonth && transactionDate <= endOfMonth;
    });

    const moneyDebited = monthlyTransactions.reduce((total, transaction) => {
        if (transaction.type !== "DEBIT") return total;
        return total + parseFloat(transaction.amount);
    }, 0);

    const moneyCredited = monthlyTransactions.reduce((total, transaction) => {
        if (transaction.type !== "CREDIT") return total;
        return total + parseFloat(transaction.amount);
    }, 0);

    const goalMoneySaved = goals.reduce((total, goal) => total + goal.progression, 0);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Bonjour";
        if (hour < 18) return "Bon après-midi";
        return "Bonsoir";
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* <ScrollView
                
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[100]} />}
            > */}
            <View style={styles.content}>
                <View>
                    <View style={styles.topBar}>
                        <View style={styles.topBarPin}>
                            <CoinIcon width={24} height={24} />
                            <Text style={typography.heading}>{currentBalance.toFixed(2)}€</Text>
                        </View>
                        <View style={styles.topBarPin}>
                            <LightningIcon width={24} height={24} color="#FFD700" />
                            <Text style={typography.heading}>{currentBalance}/5</Text>
                        </View>
                    </View>

                    <Image source={require("@/assets/images/child/dragonchild.png")} style={styles.DragonRive} resizeMode="contain" />

                    <View style={styles.AllEarningsContainer}>
                        <View>
                            <View style={styles.AllEarningsHeader}>
                                <View style={styles.AllEarningsIcon}>
                                    <MoneyBill width={20} height={20} color="#16aa75" />
                                </View>
                                <Text style={typography.subheading}>Tu as accumulé</Text>
                            </View>
                            <Text style={styles.AllEarningsAmount}>{totalEarned.toFixed(2)}€</Text>
                        </View>
                        <Image source={require("@/assets/images/home/chest-filled.png")} style={styles.messageImage} />
                    </View>
                </View>

                <View style={styles.bottomSheetContainer}>
                    <BottomSheet visible={true} onClose={() => {}} variant="persistent" height="35%" enableSwipeDown={false}>
                        <View style={styles.bottomSheetContent}>
                            <Text style={typography.heading}>Ce mois-ci</Text>
                            <View style={styles.bottomSheetLine}>
                                <View style={styles.bottomSheetBox}>
                                    <View style={styles.infoCardHeader}>
                                        <View style={[styles.infoCardHeaderIcon, styles.moneyCardIcon]}>
                                            <MoneyFly width={20} height={20} color={colors.primary[100]} />
                                        </View>
                                        <Text style={styles.infoCardHeaderTitle}>{moneyDebited.toFixed(2)}€</Text>
                                    </View>
                                    <Text style={styles.infoCardSubtitle}>Dépenses</Text>
                                </View>
                                <View style={styles.bottomSheetBox}>
                                    <View style={styles.infoCardHeader}>
                                        <View style={[styles.infoCardHeaderIcon, styles.timeCardIcon]}>
                                            <MoneyBill width={20} height={20} color={colors.jadegreen[100]} />
                                        </View>
                                        <Text style={styles.infoCardHeaderTitle}>{moneyCredited.toFixed(2)}€</Text>
                                    </View>
                                    <Text style={styles.infoCardSubtitle}>Revenus</Text>
                                </View>
                            </View>
                            <View style={styles.bottomSheetLine}>
                                <View style={styles.bottomSheetBox}>
                                    <View style={styles.infoCardHeader}>
                                        <View style={[styles.infoCardHeaderIcon, styles.pigCardIcon]}>
                                            <Pig width={20} height={20} color={colors.pink[100]} />
                                        </View>
                                        <Text style={styles.infoCardHeaderTitle}>{goalMoneySaved.toFixed(2)}€</Text>
                                    </View>
                                    <Text style={styles.infoCardSubtitle}>Épargne</Text>
                                </View>
                                <View style={styles.bottomSheetBox}>
                                    <View style={styles.infoCardHeader}>
                                        <View style={[styles.infoCardHeaderIcon, styles.listCardIcon]}>
                                            <ListCheck width={20} height={20} color={colors.blue[100]} />
                                        </View>
                                        <Text style={styles.infoCardHeaderTitle}>
                                            {tasks.length > 0 ? `${completedTasks.length}/${tasks.length}` : "0"}
                                        </Text>
                                    </View>
                                    <Text style={styles.infoCardSubtitle}>Tâches terminées</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.bottomSheetContent}>
                            <Text style={typography.heading}>Mes tâches</Text>
                            <View></View>
                        </View>
                    </BottomSheet>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#97C9FF",
        marginBottom: -30,
    },
    content: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
    },
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    topBarPin: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        borderRadius: 8,
        padding: 8,
        gap: 8,
    },
    DragonRive: {
        height: 400,
        marginHorizontal: 70,
        width: "auto",
        pointerEvents: "none",
    },
    AllEarningsContainer: {
        padding: 12,
        marginHorizontal: 24,
        borderRadius: 8,
        backgroundColor: "#FFF",
        borderColor: "#EBF2FB",
        borderWidth: 2,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        shadowColor: "rgb(0, 102, 255)",
        shadowOffset: {
            width: 0,
            height: 3.89,
        },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    AllEarningsHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
        gap: 8,
    },
    AllEarningsIcon: {
        padding: 6,
        borderRadius: 4,
        backgroundColor: "#9bffe2",
    },
    AllEarningsAmount: {
        fontFamily: "DMSans_700Bold",
        fontSize: 40,
        color: "#2F2F2F",
    },
    bottomSheetContainer: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: 24,
    },
    bottomSheetContent: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: 16,
    },
    bottomSheetLine: {
        width: "100%",
        flexDirection: "row",
        gap: 16,
    },
    bottomSheetBox: {
        backgroundColor: colors.white,
        flex: 1,
        padding: spacing.md,
        borderRadius: 4,
        flexDirection: "column",
        gap: spacing.md,
        ...shadows.md,
    },
    infoCardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },
    infoCardHeaderIcon: {
        width: 32,
        height: 32,
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
    },
    moneyCardIcon: {
        backgroundColor: colors.primary[20],
    },
    timeCardIcon: {
        backgroundColor: colors.aquamarine[60],
    },
    pigCardIcon: {
        backgroundColor: colors.pink[40],
        opacity: 0.4,
    },
    listCardIcon: {
        backgroundColor: colors.blue[60],
    },
    infoCardHeaderTitle: {
        ...typography.bold,
        ...typography["2xl"],
        color: colors.carbon[100],
    },
    infoCardSubtitle: {
        ...typography.sm,
        ...typography.semiBold,
        color: colors.carbon[100],
    },

    center: {
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: spacing.md,
        color: colors.carbon[60],
    },
    header: {
        paddingTop: spacing["5xl"],
        paddingBottom: spacing.lg + 10,
    },
    greeting: {
        marginBottom: spacing.xs,
    },
    childName: {
        marginBottom: spacing.sm,
    },
    motivationText: {
        lineHeight: 22,
    },

    // Cards et composants réutilisables
    card: {
        backgroundColor: colors.white,
        borderRadius: spacing.sm,
        ...shadows.md,
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
        // justifyContent: "space-between",
        gap: 8,
        alignItems: "center",
    },
    categoryBadge: {
        flexDirection: "row",
        alignItems: "center",
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
        backgroundColor: "#F3F0FD",
        paddingHorizontal: 8,
        borderRadius: 4,

        paddingVertical: 4,
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
