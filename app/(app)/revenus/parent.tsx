import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { incomeService } from "@/services/incomeService";
import { tasksService } from "@/services/tasksService";
import { Task, TaskType } from "@/types/Task";
import { Income, IncomeStatus } from "@/types/Income";
import { AllowanceFrequency } from "@/types/Allowance";
import { formatMoney } from "@/utils/money";

const WEEKDAYS_FR = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

const getNextPaymentLabel = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const dayName = WEEKDAYS_FR[date.getDay()];
    if (diffDays <= 0) return "À verser aujourd'hui";
    if (diffDays <= 7) return `À verser ce ${dayName}`;
    return `À verser le ${date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })}`;
};

const getFrequencyLabel = (frequency: AllowanceFrequency): string => {
    switch (frequency) {
        case AllowanceFrequency.WEEKLY:
            return "hebdomadaire";
        case AllowanceFrequency.BIWEEKLY:
            return "quinzaine";
        case AllowanceFrequency.MONTHLY:
            return "mensuel";
        default:
            return "";
    }
};

const getTaskTypeLabel = (type: TaskType): string => {
    switch (type) {
        case TaskType.WEEKLY:
        case TaskType.MONTHLY:
            return "Régulière";
        case TaskType.PONCTUAL:
            return "Ponctuelle";
        default:
            return "Ponctuelle";
    }
};

type EnrichedTaskIncome = {
    income: Income;
    task: Task | null;
};

export default function ParentRevenus() {
    const { childId, childName } = useLocalSearchParams<{ childId: string; childName: string }>();

    const [incomes, setIncomes] = useState<Income[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sending, setSending] = useState(false);

    const allowanceIncome = incomes.find((i) => i.allowance != null) ?? null;
    const taskIncomes: EnrichedTaskIncome[] = incomes
        .filter((i) => i.task != null)
        .map((income) => ({
            income,
            task: tasks.find((t) => t.id === income.task) ?? null,
        }));

    const totalAmount = incomes.filter((i) => i.status === "PENDING").reduce((sum, i) => sum + (i.amount ?? 0), 0);

    const isEmpty = incomes.length === 0;

    const loadData = async () => {
        if (!childId) return;
        try {
            const [fetchedIncomes, fetchedTasks] = await Promise.all([incomeService.getIncomes({ childId }), tasksService.getAllTasks({ childId })]);
            setIncomes(fetchedIncomes);
            setTasks(fetchedTasks);
        } catch (error) {
            console.error("Erreur chargement revenus:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadData();
        }, [childId]),
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleSendIncome = async () => {
        if (!childId || totalAmount <= 0) return;
        Alert.alert("Verser les revenus", `Confirmer le versement de ${formatMoney(totalAmount)}€ à ${childName} ?`, [
            { text: "Annuler", style: "cancel" },
            {
                text: "Verser",
                style: "default",
                onPress: async () => {
                    setSending(true);
                    try {
                        await incomeService.sendIncome(childId);
                        await loadData();
                    } catch {
                        Alert.alert("Erreur", "Impossible de verser les revenus.");
                    } finally {
                        setSending(false);
                    }
                },
            },
        ]);
    };

    const handleUpdateStatus = async (incomeId: string, newStatus: IncomeStatus) => {
        try {
            await incomeService.updateIncomeStatus(incomeId, newStatus);
            setIncomes((prev) => prev.map((i) => (i.id === incomeId ? { ...i, status: newStatus } : i)));
        } catch {
            Alert.alert("Erreur", "Impossible de mettre à jour le statut.");
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#846DED" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={18} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Revenus de {childName}</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#846DED" />}
            >
                {/* Section montant */}
                <View style={styles.amountSection}>
                    <Text style={styles.amountText}>{formatMoney(totalAmount)}€</Text>
                    {allowanceIncome?.allowance?.nextExecution && (
                        <Text style={styles.amountSubtitle}>{getNextPaymentLabel(allowanceIncome.allowance.nextExecution)}</Text>
                    )}

                    {/* Bouton verser si montant > 0 */}
                    {totalAmount > 0 && (
                        <TouchableOpacity style={styles.sendButton} onPress={handleSendIncome} disabled={sending}>
                            {sending ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="send-outline" size={14} color="#fff" />
                                    <Text style={styles.sendButtonText}>Verser maintenant</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.divider} />

                {/* Ligne argent de poche */}
                <TouchableOpacity
                    style={styles.allowanceRow}
                    onPress={() =>
                        router.push({
                            pathname: "/(app)/allowance",
                            params: { childId },
                        })
                    }
                >
                    {allowanceIncome?.allowance ? (
                        <>
                            <Text style={styles.allowanceRowLabel}>Argent de poche {getFrequencyLabel(allowanceIncome.allowance.frequency)}</Text>
                            <View style={styles.allowanceRowRight}>
                                <Text style={styles.allowanceRowAmount}>{formatMoney(allowanceIncome.allowance.amount)}€</Text>
                                <Ionicons name="chevron-forward" size={16} color="#999" />
                            </View>
                        </>
                    ) : (
                        <>
                            <Text style={styles.allowanceRowLabel}>Verser de l'argent de poche régulièrement</Text>
                            <Ionicons name="chevron-forward" size={16} color="#999" />
                        </>
                    )}
                </TouchableOpacity>

                <View style={styles.divider} />

                {/* Liste des task-incomes */}
                {taskIncomes.length > 0 && (
                    <View style={styles.taskList}>
                        {taskIncomes.map(({ income, task }) => (
                            <TaskIncomeCard key={income.id} income={income} task={task} onUpdateStatus={handleUpdateStatus} />
                        ))}
                    </View>
                )}

                {/* Empty state */}
                {isEmpty && (
                    <View style={styles.emptyState}>
                        <Image source={require("@/assets/moneybuddy_mascotte.png")} style={styles.emptyImage} resizeMode="contain" />
                        <Text style={styles.emptyText}>Enseignez la valeur de l'effort en lui attribuant des petites tâches.</Text>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bouton bas de page */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.addTaskButton}
                    onPress={() =>
                        router.push({
                            pathname: "/(app)/children/create-task",
                            params: { childId },
                        })
                    }
                >
                    <Text style={styles.addTaskButtonText}>Ajouter une tâche</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

type TaskIncomeCardProps = {
    income: Income;
    task: Task | null;
    onUpdateStatus: (id: string, status: IncomeStatus) => void;
};

const TaskIncomeCard = ({ income, task, onUpdateStatus }: TaskIncomeCardProps) => {
    const isPending = income.status === "PENDING";
    const isAccepted = income.status === "ACCEPTED";
    const isRefused = income.status === "REFUSED";

    const taskType = task?.type ?? TaskType.PONCTUAL;
    const isPonctual = taskType === TaskType.PONCTUAL;
    const description = task?.description ?? income.task ?? "Tâche";
    const moneyReward = task ? task.moneyReward : income.amount;
    const coinReward = task ? task.coinReward : 0;

    const handlePress = () => {
        if (isPending) {
            Alert.alert("Valider la tâche", `Voulez-vous accepter ou refuser "${description}" ?`, [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Refuser",
                    style: "destructive",
                    onPress: () => onUpdateStatus(income.id, "REFUSED"),
                },
                {
                    text: "Accepter",
                    style: "default",
                    onPress: () => onUpdateStatus(income.id, "ACCEPTED"),
                },
            ]);
        }
    };

    return (
        <View style={[styles.taskCard, isAccepted && styles.taskCardAccepted]}>
            {/* Contenu gauche */}
            <View style={styles.taskCardContent}>
                {/* Badges */}
                <View style={styles.badgesRow}>
                    <View style={[styles.badge, isPonctual ? styles.badgePonctual : styles.badgeReguliere]}>
                        <Text style={[styles.badgeText, isPonctual ? styles.badgeTextPonctual : styles.badgeTextReguliere]}>
                            {getTaskTypeLabel(taskType)}
                        </Text>
                    </View>
                    {coinReward > 0 && (
                        <View style={styles.badgeReward}>
                            <Text style={styles.badgeRewardText}>+{coinReward}</Text>
                            <Ionicons name="ellipse" size={10} color="#2F2F2F" />
                        </View>
                    )}
                    {moneyReward > 0 && (
                        <View style={styles.badgeReward}>
                            <Text style={styles.badgeRewardText}>+{formatMoney(moneyReward)}€</Text>
                        </View>
                    )}
                </View>

                {/* Description */}
                <Text
                    style={[styles.taskDescription, isAccepted && styles.taskDescriptionAccepted, isRefused && styles.taskDescriptionRefused]}
                    numberOfLines={2}
                >
                    {description}
                </Text>
            </View>

            {/* Indicateur de statut (droite) */}
            <TouchableOpacity
                style={[
                    styles.statusButton,
                    isPending && styles.statusButtonPending,
                    isAccepted && styles.statusButtonAccepted,
                    isRefused && styles.statusButtonRefused,
                ]}
                onPress={handlePress}
                disabled={!isPending}
            >
                {isAccepted && <Ionicons name="checkmark-outline" size={22} color="#fff" />}
                {isRefused && <Ionicons name="close-outline" size={22} color="#fff" />}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
        gap: 14,
    },
    backButton: {
        width: 34,
        height: 34,
        backgroundColor: "#2F2F2F",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontFamily: "DMSans_700Bold",
        fontSize: 18,
        color: "#2F2F2F",
    },

    // ScrollView
    scrollView: {
        flex: 1,
        backgroundColor: "#fff",
    },

    // Section montant
    amountSection: {
        paddingHorizontal: 20,
        paddingTop: 28,
        paddingBottom: 20,
        alignItems: "flex-start",
    },
    amountText: {
        fontFamily: "DMSans_700Bold",
        fontSize: 48,
        color: "#2F2F2F",
        lineHeight: 56,
    },
    amountSubtitle: {
        fontFamily: "DMSans_400Regular",
        fontSize: 14,
        color: "#828282",
        marginTop: 4,
    },
    sendButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#846DED",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 7,
        marginTop: 12,
        shadowColor: "#4E31CF",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 3,
    },
    sendButtonText: {
        fontFamily: "DMSans_600SemiBold",
        fontSize: 13,
        color: "#fff",
    },

    // Séparateur
    divider: {
        height: 1,
        backgroundColor: "#F0F0F0",
        marginHorizontal: 20,
    },

    // Ligne allowance
    allowanceRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    allowanceRowLabel: {
        fontFamily: "DMSans_400Regular",
        fontSize: 15,
        color: "#2F2F2F",
        flex: 1,
    },
    allowanceRowRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    allowanceRowAmount: {
        fontFamily: "DMSans_600SemiBold",
        fontSize: 15,
        color: "#2F2F2F",
    },

    // Liste tâches
    taskList: {
        paddingHorizontal: 20,
        paddingTop: 16,
        gap: 12,
        display: "flex",
        flexDirection: "column",
    },

    // Carte income de tâche
    taskCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#BFD0EA",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.7,
        shadowRadius: 0,
        elevation: 3,
        marginBottom: 4,
    },
    taskCardAccepted: {
        backgroundColor: "#D1DEF1",
    },
    taskCardContent: {
        flex: 1,
        gap: 8,
    },
    badgesRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 6,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    badgeReguliere: {
        backgroundColor: "#E1FFF6",
    },
    badgePonctual: {
        backgroundColor: "#FFEEF2",
    },
    badgeText: {
        fontFamily: "DMSans_700Bold",
        fontSize: 11,
    },
    badgeTextReguliere: {
        color: "#16AA75",
    },
    badgeTextPonctual: {
        color: "#F0547C",
    },
    badgeReward: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        backgroundColor: "#F3F0FD",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    badgeRewardText: {
        fontFamily: "DMSans_700Bold",
        fontSize: 11,
        color: "#2F2F2F",
    },
    taskDescription: {
        fontFamily: "DMSans_400Regular",
        fontSize: 14,
        color: "#2F2F2F",
        lineHeight: 20,
        flexShrink: 1,
        paddingRight: 12,
    },
    taskDescriptionAccepted: {
        textDecorationLine: "line-through",
        color: "#828282",
    },
    taskDescriptionRefused: {
        color: "#BBBBBB",
    },

    // Indicateur statut
    statusButton: {
        width: 44,
        height: 44,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 12,
        flexShrink: 0,
    },
    statusButtonPending: {
        backgroundColor: "#CEC5F8",
    },
    statusButtonAccepted: {
        backgroundColor: "#846DED",
    },
    statusButtonRefused: {
        backgroundColor: "#EAEAEA",
    },

    // Empty state
    emptyState: {
        alignItems: "center",
        paddingHorizontal: 40,
        paddingTop: 40,
        paddingBottom: 20,
        gap: 20,
    },
    emptyImage: {
        width: 180,
        height: 180,
    },
    emptyText: {
        fontFamily: "DMSans_400Regular",
        fontSize: 15,
        color: "#828282",
        textAlign: "center",
        lineHeight: 22,
    },

    // Footer
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingBottom: 32,
        paddingTop: 12,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
    },
    addTaskButton: {
        backgroundColor: "#846DED",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        shadowColor: "#4E31CF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    addTaskButtonText: {
        fontFamily: "DMSans_600SemiBold",
        fontSize: 16,
        color: "#fff",
    },
});
