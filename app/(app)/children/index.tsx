import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { Ionicons } from "@expo/vector-icons";

// Contexts
import { useAuthContext } from "@/contexts/AuthContext";

// Services
import { tasksService } from "@/services/tasksService";
import { transactionService } from "@/services/transactionService";
import { goalsService } from "@/services/goalsService";

// Types
import { Task } from "@/types/Task";
import { Transaction } from "@/types/Transaction";
import { Goal } from "@/types/Goal";

// Utils
import { logger } from "@/utils/logger";

// Styles
import { typography, colors, spacing, shadows, commonStyles } from "@/styles";

// Components
import TaskTile from "@/components/TaskTile";

// Icons
import MoneyBill from "@/components/Icons/MoneyBill";
import SearchAlt from "@/components/Icons/SearchAlt";
import LightBulb from "@/components/Icons/LightBulb";
import BoxCheck from "@/components/Icons/BoxCheck";
import ThumbTack from "@/components/Icons/ThumbTack";
import MoneyFly from "@/components/Icons/MoneyFly";
import Pig from "@/components/Icons/Pig";
import ListCheck from "@/components/Icons/ListCheck";
import CheckMark from "@/components/Icons/CheckMark";

// Constants
const SUMMARY_CARD_COLORS = {
    expenses: colors.primary[20],
    savings: "#FEA0BA66",
    tasks: "#97C9FF66",
    revenus: "#E1FFF6",
} as const;

const TASK_ICON_BG_COLOR = "rgba(155, 255, 226, 0.3)";

const COLORS = {
    primary: "#6C5CE7",
    secondary: "#846DED",
    white: "#FFF",
    background: "#EBF2FB",
    border: "#BFD0EA",
    text: {
        primary: "#333",
        secondary: "#666",
        tertiary: "#828282",
    },
    info: "#52A5FF",
    shadow: "#4E31CF",
} as const;

export default function Children() {
    const { user, refreshUserData } = useAuthContext();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedChildId, setSelectedChildId] = useState<string>("");
    const [showPicker, setShowPicker] = useState(false);
    const [validationModalVisible, setValidationModalVisible] = useState(false);
    const [taskToValidate, setTaskToValidate] = useState<Task | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [debitTransactions, setDebitTransactions] = useState<Transaction[]>([]);
    const [creditTransactions, setCreditTransactions] = useState<Transaction[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);

    // Computed values
    const childAccounts = user?.subAccounts?.filter((account) => account.role === "CHILD") || [];
    const selectedChild = childAccounts.find((child) => child.id === selectedChildId);

    const moneyDebited = debitTransactions.reduce((total, transaction) => {
        return total + parseFloat(transaction.amount);
    }, 0);

    const goalMoneySaved = goals.reduce((total, goal) => {
        return total + goal.progression;
    }, 0);

    const moneyCredited = creditTransactions.reduce((total, transaction) => {
        return total + parseFloat(transaction.amount);
    }, 0);

    const completedTasksCount = tasks.filter((task) => task.status === "COMPLETED").length;
    const totalTasksCount = tasks.length;

    // Separate tasks by type
    const recurringTasks = tasks.filter(
        (task) => (task.type === "WEEKLY" || task.type === "MONTHLY") && task.status !== "PRE_VALIDATE" && task.status !== "COMPLETED",
    );
    const punctualTasks = tasks.filter((task) => task.type === "PONCTUAL" && task.status !== "PRE_VALIDATE" && task.status !== "COMPLETED");
    const preValidateTasks = tasks.filter((task) => task.status === "PRE_VALIDATE");

    // Load functions
    const loadData = useCallback(async () => {
        try {
            await refreshUserData();
        } catch (error) {
            console.error("Error loading children data:", error);
        } finally {
            setLoading(false);
        }
    }, [refreshUserData]);

    const loadChildTasks = useCallback(async () => {
        if (!selectedChildId || !selectedChild) return;

        setLoadingTasks(true);
        try {
            const childTasks = await tasksService.getTasksByChild(selectedChildId);
            setTasks(childTasks);
        } catch (error) {
            logger.error("Error loading child tasks:", error);
        } finally {
            setLoadingTasks(false);
        }
    }, [selectedChildId, selectedChild]);

    const loadChildTransactions = useCallback(async () => {
        if (!selectedChildId) return;

        try {
            const childTransactions = await transactionService.getTransactionsBySubAccount(selectedChildId);

            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

            const debitTransactions = childTransactions.filter((transaction) => {
                if (transaction.type !== "DEBIT") return false;

                const transactionDate = new Date(transaction.createdAt);
                return transactionDate >= startOfMonth && transactionDate <= endOfMonth;
            });

            const creditTransactions = childTransactions.filter((transaction) => {
                if (transaction.type !== "CREDIT") return false;

                const transactionDate = new Date(transaction.createdAt);
                return transactionDate >= startOfMonth && transactionDate <= endOfMonth;
            });

            setCreditTransactions(creditTransactions);
            setDebitTransactions(debitTransactions);
        } catch (error) {
            logger.error("Error loading child transactions:", error);
        }
    }, [selectedChildId]);

    const loadChildGoals = useCallback(async () => {
        if (!selectedChildId) return;
        try {
            const childGoals = await goalsService.getGoals(selectedChildId);
            setGoals(childGoals);
            logger.log("Loaded child goals:", childGoals);
        } catch (error) {
            logger.error("Error loading child goals:", error);
        }
    }, [selectedChildId]);

    // Action handlers
    const validateTask = useCallback(
        async (taskId: string, done?: boolean) => {
            try {
                await tasksService.completeTask(taskId, done);
                await loadChildTasks();
            } catch (error) {
                logger.error("Error validating task:", error);
            }
        },
        [loadChildTasks],
    );

    const handleValidationChoice = useCallback(
        async (choice: boolean) => {
            if (!taskToValidate) return;
            try {
                await validateTask(taskToValidate.id, choice);
                setValidationModalVisible(false);
                setTaskToValidate(null);

                if (choice) {
                    Alert.alert(
                        "Tâche validée ! ✅",
                        `La récompense a été ajoutée au compte de ${selectedChild?.name}.`,
                        [{ text: "Super !" }]
                    );
                } else {
                    Alert.alert(
                        "Tâche refusée",
                        "La tâche a été refusée et devra être refaite.",
                        [{ text: "OK" }]
                    );
                }
            } catch (error) {
                setValidationModalVisible(false);
                setTaskToValidate(null);
                Alert.alert("Erreur", "Impossible de valider la tâche");
                logger.error("Error in handleValidationChoice:", error);
            }
        },
        [taskToValidate, validateTask, selectedChild?.name],
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refreshUserData();
            if (selectedChildId) {
                await loadChildTasks();
            }
        } finally {
            setRefreshing(false);
        }
    }, [refreshUserData, selectedChildId, loadChildTasks]);

    // Effects
    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (childAccounts.length > 0 && !selectedChildId) {
            setSelectedChildId(childAccounts[0].id);
        }
    }, [childAccounts.length, selectedChildId]);

    useEffect(() => {
        if (selectedChildId) {
            loadChildTasks();
            loadChildTransactions();
            loadChildGoals();
        }
    }, [selectedChildId]);

    useFocusEffect(
        useCallback(() => {
            if (selectedChildId) {
                loadChildTasks();
            }
        }, [selectedChildId, loadChildTasks]),
    );

    // Render functions
    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity style={styles.childSelector} onPress={() => setShowPicker(true)}>
                <View style={styles.childIcon}>
                    <Text style={styles.childIconText}>👶</Text>
                </View>
                <Text style={styles.childName}>{selectedChild?.name || "Sélectionner"}</Text>
                <Feather name="chevron-down" size={24} color="black" />
            </TouchableOpacity>
        </View>
    );

    const renderBalanceSection = () => (
        <View style={styles.balanceSection}>
            <Text style={[styles.balanceLabel, typography.regular]}>Solde disponible</Text>
            <Text style={[styles.balanceAmount, typography.title, typography["5xl"]]}>{selectedChild?.money || "0.00"}€</Text>
        </View>
    );

    const renderActionButtons = () => (
        <View style={styles.actionButtons}>
            <View style={styles.actionButtonContainer}>
                <TouchableOpacity
                    style={styles.primaryActionButton}
                    onPress={() =>
                        router.push({
                            pathname: "/(app)/children/add-money",
                            params: {
                                childId: selectedChildId,
                                childName: selectedChild?.name || "",
                            },
                        })
                    }
                >
                    <MoneyBill />
                </TouchableOpacity>
                <Text style={[typography.regular, styles.actionButtonText]}>Verser de l'argent</Text>
            </View>
            <View style={styles.actionButtonContainer}>
                <TouchableOpacity style={styles.secondaryActionButton}>
                    <SearchAlt />
                </TouchableOpacity>
                <Text style={[typography.regular, styles.actionButtonText]}>Paramétrer</Text>
            </View>
        </View>
    );

    const renderSummaryCard = (icon: React.ReactNode, title: string, value: string, subtitle: string, backgroundColor: string) => (
        <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
                <View
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 4,
                        backgroundColor,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    {icon}
                </View>
                <Text style={[typography.semiBold, typography.sm]}>{title}</Text>
            </View>
            <Text style={[typography.bold, typography["2xl"], { flex: 1 }]}>{value}</Text>
            <TouchableOpacity
                onPress={() =>
                    router.push({
                        pathname: "/(app)/children/goals",
                        params: {
                            childId: selectedChildId,
                            childName: selectedChild?.name,
                        },
                    })
                }
            >
                <Text style={[typography.regular, typography.sm, { color: colors.carbon[100] }]}>{subtitle}</Text>
            </TouchableOpacity>
        </View>
    );

    const renderSummarySection = () => {
        const currentMonth =
            new Date().toLocaleDateString("fr-FR", { month: "long" }).charAt(0).toUpperCase() +
            new Date().toLocaleDateString("fr-FR", { month: "long" }).slice(1);

        return (
            <View style={styles.summaryContainer}>
                <View style={styles.summaryCards}>
                    {renderSummaryCard(
                        <MoneyFly color={colors.primary[100]} />,
                        "Dépenses",
                        `${moneyDebited.toFixed(2)} €`,
                        currentMonth,
                        SUMMARY_CARD_COLORS.expenses,
                    )}
                    {renderSummaryCard(<Pig />, "Epargne", `${goalMoneySaved.toFixed(2)} €`, "Voir détails", SUMMARY_CARD_COLORS.savings)}
                </View>
                <View style={styles.summaryCards}>
                    {renderSummaryCard(<CheckMark />, "Revenus", `${moneyCredited.toFixed(2)} €`, currentMonth, SUMMARY_CARD_COLORS.revenus)}
                    {renderSummaryCard(
                        <ListCheck />,
                        "Tâches",
                        `${completedTasksCount}/${totalTasksCount}`,
                        "Voir détails",
                        SUMMARY_CARD_COLORS.tasks,
                    )}
                </View>
            </View>
        );
    };

    const renderEmptyMoneyInfo = () => (
        <View style={styles.infoCard}>
            <View style={styles.infoContent}>
                <View style={styles.infoIcon}>
                    <LightBulb />
                </View>
                <Text style={[styles.infoTitle, typography.bold, typography["md"]]}>Pas encore d'argent de poche</Text>
            </View>
            <Text style={styles.infoText}>Commencez à lui verser une petite somme à poche pour l'aider à apprendre à gérer un vrai budget.</Text>
        </View>
    );

    const renderTaskCategory = (
        icon: React.ReactNode,
        title: string,
        taskList: Task[],
        taskType: "PONCTUAL" | "WEEKLY" | "MONTHLY",
        backgroundColor: string,
    ) => {
        if (taskList.length === 0) {
            return (
                <View style={styles.taskCategoryHeader}>
                    <View style={[styles.taskIconContainer, { backgroundColor }]}>{icon}</View>
                    <Text style={[styles.taskCategoryTitle, typography.bold, typography.sm]}>
                        {title} ({taskList.length})
                    </Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() =>
                            router.push({
                                pathname: "/(app)/children/create-task",
                                params: { childId: selectedChildId, type: taskType },
                            })
                        }
                    >
                        <Ionicons name="add-outline" size={20} color="#828282" />
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <>
                {taskList.map((task) => (
                    <TaskTile
                        key={task.id}
                        task={task}
                        onPress={() => {
                            task.status === "COMPLETED" ? null : validateTask(task.id);
                        }}
                    />
                ))}
            </>
        );
    };

    const renderTasksSection = () => (
        <View style={styles.tasksSection}>
            <Text style={[styles.sectionTitle, typography.title, typography.xl]}>Ses tâches</Text>

            {preValidateTasks.length > 0 && (
                <View style={styles.taskCategory}>
                    <Text style={[styles.taskCategoryTitle, typography.bold, typography.sm]}>
                        Tâches en attente de validation ({preValidateTasks.length})
                    </Text>
                    {preValidateTasks.map((task) => (
                        <TaskTile
                            key={task.id}
                            task={task}
                            onPress={() => {
                                setTaskToValidate(task);
                                setValidationModalVisible(true);
                            }}
                        />
                    ))}
                </View>
            )}

            <View style={styles.taskCategory}>
                {renderTaskCategory(<BoxCheck />, "Tâches récurrentes", recurringTasks, "WEEKLY", TASK_ICON_BG_COLOR)}
            </View>

            <View style={styles.taskCategory}>
                {renderTaskCategory(<ThumbTack />, "Défis ponctuels", punctualTasks, "PONCTUAL", TASK_ICON_BG_COLOR)}
            </View>

            {tasks.length === 0 && (
                <View style={styles.infoCard}>
                    <View style={styles.infoContent}>
                        <Ionicons name="list-outline" size={24} color="#52A5FF" style={styles.infoIcon} />
                        <Text style={[styles.infoTitle, typography.bold, typography.md]}>Aucune tâche pour l'instant</Text>
                    </View>
                    <Text style={styles.infoText}>
                        Ajoutez une tâche pour aider votre enfant à gagner en autonomie (et peut-être quelques pièces 💰).
                    </Text>
                </View>
            )}
        </View>
    );

    const renderChildPicker = () => (
        <Modal visible={showPicker} transparent={true} animationType="fade" onRequestClose={() => setShowPicker(false)}>
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
                            <Text style={[styles.modalOptionText, selectedChildId === child.id && styles.modalOptionTextSelected]}>{child.name}</Text>
                            {selectedChildId === child.id && <Text style={styles.checkmark}>✓</Text>}
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
    );

    const renderValidationModal = () => (
        <Modal visible={validationModalVisible} transparent={true} animationType="fade" onRequestClose={() => setValidationModalVisible(false)}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setValidationModalVisible(false)}>
                <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Valider la tâche</Text>
                        <TouchableOpacity onPress={() => setValidationModalVisible(false)} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.infoText, { marginBottom: 12 }]}>{taskToValidate?.description}</Text>

                    <View style={styles.validationButtons}>
                        <TouchableOpacity style={[styles.validationButton, styles.validationSecondary]} onPress={() => handleValidationChoice(false)}>
                            <Text style={{ color: "#333", fontWeight: "600" }}>Refuser</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.validationButton, styles.validationPrimary]} onPress={() => handleValidationChoice(true)}>
                            <Text style={{ color: "#fff", fontWeight: "600" }}>Valider</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    // Loading state
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
            {renderHeader()}
            <ScrollView
                style={styles.contentScrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />}
            >
                {selectedChild && (
                    <View style={styles.content}>
                        {renderBalanceSection()}
                        {renderActionButtons()}
                        {!selectedChild.money || selectedChild.money === "0" ? renderEmptyMoneyInfo() : renderSummarySection()}
                        {renderTasksSection()}
                    </View>
                )}

                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Bouton flottant fixe pour ajouter une tâche */}
            {selectedChild && (
                <View style={styles.fixedButtonContainer}>
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

            {renderChildPicker()}
            {renderValidationModal()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    contentScrollView: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    center: {
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: spacing.sm,
        color: COLORS.text.secondary,
    },
    header: {
        paddingTop: spacing.lg,
        paddingBottom: spacing.lg,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
        // marginBottom: spacing.lg,
    },
    childSelector: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.sm,
        marginHorizontal: spacing.lg,
    },
    childIcon: {
        width: 32,
        height: 32,
        borderRadius: spacing.xs,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        marginRight: spacing.base,
    },
    childIconText: {
        fontSize: 16,
    },
    childName: {
        marginRight: spacing.base,
        fontSize: 20,
        fontWeight: "700",
        color: COLORS.text.primary,
    },
    balanceSection: {
        alignItems: "center",
        marginVertical: spacing["2xl"],
    },
    balanceLabel: {
        color: COLORS.text.secondary,
        marginBottom: spacing.xs,
    },
    balanceAmount: {
        color: COLORS.text.primary,
    },
    actionButtons: {
        flexDirection: "row",
        gap: spacing.base,
        marginBottom: spacing["2xl"],
    },
    actionButtonContainer: {
        flex: 1,
        alignItems: "center",
    },
    primaryActionButton: {
        width: "100%",
        backgroundColor: COLORS.primary,
        borderRadius: spacing.xs,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.xs,
        paddingVertical: spacing.sm,
    },
    secondaryActionButton: {
        width: "100%",
        backgroundColor: "transparent",
        borderRadius: spacing.xs,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.xs,
        paddingVertical: spacing.sm,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    actionButtonText: {
        textAlign: "center",
        fontSize: 14,
        color: COLORS.text.primary,
    },

    infoCard: {
        backgroundColor: "rgba(191, 208, 234, 0.6)",
        padding: spacing.base,
        borderRadius: spacing.xs,
        marginBottom: spacing["2xl"],
    },
    infoContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
        marginBottom: spacing.xs,
    },
    infoIcon: {
        width: 32,
        height: 32,
        borderRadius: spacing.xs,
        backgroundColor: COLORS.white,
        justifyContent: "center",
        alignItems: "center",
    },
    infoTitle: {
        color: COLORS.text.primary,
    },
    infoText: {
        color: COLORS.text.secondary,
        lineHeight: 20,
    },
    summaryContainer: {
        flexDirection: "column",
        gap: spacing.base,
        marginBottom: spacing["3xl"],
    },
    summaryCards: {
        flexDirection: "row",
        gap: spacing.base,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingTop: spacing.sm,
        paddingBottom: spacing.base,
        ...shadows.md,
        flexDirection: "column",
        gap: spacing.sm,
    },
    summaryCardHeader: {
        flexDirection: "row",
        gap: spacing.sm,
        alignItems: "center",
    },
    tasksSection: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        color: COLORS.text.primary,
        marginBottom: spacing.base,
    },
    taskCategory: {
        marginBottom: spacing.sm,
    },
    taskCategoryHeader: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.white,
        marginBottom: spacing.xs,
        padding: spacing.sm,
        borderRadius: spacing.xs,
        shadowColor: COLORS.border,
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
        borderRadius: spacing.xs,
        justifyContent: "center",
        alignItems: "center",
        marginRight: spacing.sm,
    },
    taskCategoryTitle: {
        flex: 1,
        color: COLORS.text.primary,
    },
    addButton: {
        width: 32,
        height: 32,
        backgroundColor: "#EAEAEA",
        borderRadius: spacing.xs,
        justifyContent: "center",
        alignItems: "center",
    },
    addButtonText: {
        fontSize: 20,
        color: COLORS.text.secondary,
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
        marginBottom: spacing.base,
    },
    emptyTitle: {
        marginBottom: spacing.xs,
        textAlign: "center",
    },
    emptyText: {
        color: COLORS.text.secondary,
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
        backgroundColor: COLORS.white,
        borderRadius: spacing.base,
        padding: spacing.lg,
        margin: spacing.lg,
        minWidth: 280,
        ...shadows.lg,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.base,
    },
    modalTitle: {
        color: COLORS.text.primary,
        fontSize: 18,
        fontWeight: "600",
    },
    closeButton: {
        padding: spacing.xs,
    },
    modalOption: {
        padding: spacing.base,
        borderRadius: spacing.xs,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.xs,
    },
    modalOptionSelected: {
        backgroundColor: COLORS.primary,
    },
    modalOptionText: {
        color: COLORS.text.primary,
    },
    modalOptionTextSelected: {
        color: COLORS.white,
    },
    checkmark: {
        fontSize: 16,
        color: COLORS.white,
        fontWeight: "bold",
    },
    bottomPadding: {
        height: 60,
    },
    fixedButtonContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        paddingTop: spacing.sm,
        backgroundColor: COLORS.background,
    },
    addTaskButton: {
        ...commonStyles.button,
    },
    addTaskButtonText: {
        color: COLORS.white,
    },
    validationButtons: {
        flexDirection: "row",
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    validationButton: {
        flex: 1,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.base,
        borderRadius: spacing.xs,
        alignItems: "center",
        justifyContent: "center",
    },
    validationPrimary: {
        backgroundColor: COLORS.primary,
    },
    validationSecondary: {
        backgroundColor: "#EAEAEA",
    },
});
