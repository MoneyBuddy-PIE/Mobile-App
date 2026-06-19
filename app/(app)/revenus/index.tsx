import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import { SubAccount } from "@/types/Account";
import { userService } from "@/services/userService";
import { transactionService } from "@/services/transactionService";
import { goalsService } from "@/services/goalService";
import { Goal } from "@/types/Goal";
import { Transaction } from "@/types/Transaction";
import { Ionicons } from "@expo/vector-icons";
import { TreasureChest } from "@/components/Icons/TreasureChest";
import getIconFromCategory from "@/utils/fn/getIconFromCategory";
import MoneyBill from "@/components/Icons/MoneyBill";
import { ArrowUpIcon } from "@/components/Icons/ArrowUpIcon";
import { PiggyBankIcon } from "@/components/Icons/PiggyBankIcon";
import { ScanIcon } from "@/components/Icons/ScanIcon";
import MoneyFly from "@/components/Icons/MoneyFly";
import PiggyBankSmall from "@/components/Icons/PiggyBankSmall";
import { colors, spacing, typography, shadows } from "@/styles";
import { formatMoney } from "@/utils/money";

export default function Revenus() {
    const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddExpense, setShowAddExpense] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const accountData = await userService.getSubAccount();
            setSubAccount(accountData);
            const [accountTransactions, goalsList] = await Promise.all([
                transactionService.getTransactionsBySubAccount(accountData.id),
                goalsService.getGoals(),
            ]);
            setTransactions(accountTransactions);
            setGoals(goalsList);
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

    const now = new Date();
    const monthlyExpenses = transactions
        .filter((t) => {
            const d = new Date(t.createdAt);
            return t.type === "DEBIT" && !t.incomeId && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const goalsSaved = goals.reduce((sum, g) => sum + (g.depositStatement ?? 0), 0);

    const currentMonthLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[100]} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[100]} />}
            >
                {/* Balance Card */}
                <View style={styles.balanceCard}>
                    <View style={styles.balanceCardInner}>
                        <View style={styles.balanceLeft}>
                            <View>
                                <Text style={styles.balanceLabel}>Solde disponible</Text>
                                <Text style={styles.balanceAmount}>{formatMoney(subAccount?.money ?? 0)}€</Text>
                            </View>
                            <View>
                                <Text style={styles.balanceInfo}>{subAccount?.name ?? "Enfant"}</Text>
                                <Text style={styles.balanceInfo}>{"••••  ••••  ••••  CASH"}</Text>
                            </View>
                        </View>
                        <TreasureChest width={96} height={89} />
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsBar}>
                    <TouchableOpacity style={styles.actionItem} onPress={() => setShowAddExpense(true)}>
                        <View style={[styles.actionButton, { backgroundColor: colors.primary[100], shadowColor: "#4E31CF" }]}>
                            <ArrowUpIcon width={32} height={32} color="white" />
                        </View>
                        <Text style={styles.actionLabel}>Dépenser</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionItem} onPress={() => router.push("/(app)/goals/create")}>
                        <View style={[styles.actionButton, { backgroundColor: "#FD618C", shadowColor: "#D1325E" }]}>
                            <PiggyBankIcon width={32} height={32} color="white" />
                        </View>
                        <Text style={styles.actionLabel}>Économiser</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionItem}>
                        <View style={[styles.actionButton, { backgroundColor: "#16AA75", shadowColor: "#005C49" }]}>
                            <ScanIcon width={32} height={32} color="white" />
                        </View>
                        <Text style={styles.actionLabel}>Scanner</Text>
                    </TouchableOpacity>
                </View>

                {/* Stat Cards */}
                <View style={styles.statsRow}>
                    <TouchableOpacity style={styles.statCard} onPress={() => router.push("/(app)/transactions")}>
                        <View style={styles.statCardHeader}>
                            <View style={[styles.statCardIcon, { backgroundColor: colors.primary[20] }]}>
                                <MoneyFly width={20} height={20} color={colors.primary[100]} />
                            </View>
                            <Text style={styles.statCardTitle}>Dépenses</Text>
                        </View>
                        <View style={styles.statCardAmountRow}>
                            <Text style={styles.statCardAmount}>{formatMoney(monthlyExpenses)}€</Text>
                            <View style={styles.statCardArrow}>
                                <Ionicons name="arrow-forward" size={16} color={colors.carbon[60]} />
                            </View>
                        </View>
                        <Text style={styles.statCardSub}>{currentMonthLabel}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.statCard} onPress={() => router.push("/(app)/goals")}>
                        <View style={styles.statCardHeader}>
                            <View style={[styles.statCardIcon, { backgroundColor: "rgba(254,160,186,0.4)" }]}>
                                <PiggyBankSmall width={20} height={20} color="#FD618C" />
                            </View>
                            <Text style={styles.statCardTitle}>Objectifs</Text>
                        </View>
                        <View style={styles.statCardAmountRow}>
                            <Text style={styles.statCardAmount}>{formatMoney(goalsSaved)}€</Text>
                            <View style={styles.statCardArrow}>
                                <Ionicons name="arrow-forward" size={16} color={colors.carbon[60]} />
                            </View>
                        </View>
                        <Text style={styles.statCardSub}>Voir détails</Text>
                    </TouchableOpacity>
                </View>

                {/* Transactions */}
                <Text style={styles.sectionTitle}>Dernières transactions</Text>

                <View style={styles.transactionCard}>
                    {sortedTransactions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>💰</Text>
                            <Text style={styles.emptyTitle}>Pas encore de transactions</Text>
                            <Text style={styles.emptyText}>Tes gains et dépenses apparaîtront ici !</Text>
                        </View>
                    ) : (
                        sortedTransactions.map((transaction, index) => {
                            const isEarning = transaction.type === "CREDIT" || !!transaction.incomeId;
                            return (
                                <View
                                    key={transaction.id}
                                    style={[styles.transactionRow, index < sortedTransactions.length - 1 && styles.transactionBorder]}
                                >
                                    <View style={[styles.transactionIconContainer, { backgroundColor: isEarning ? "#9BFFE2" : colors.carbon[10] }]}>
                                        {isEarning ? (
                                            <MoneyBill width={20} height={20} color="#16AA75" />
                                        ) : (
                                            (() => {
                                                const Icon = getIconFromCategory(transaction.emoji ?? "other");
                                                return <Icon width={20} height={20} color={colors.carbon[60]} />;
                                            })()
                                        )}
                                    </View>
                                    <View style={styles.transactionInfo}>
                                        <Text style={styles.transactionDescription} numberOfLines={1} ellipsizeMode="tail">
                                            {transaction.description}
                                        </Text>
                                        <Text style={styles.transactionDate}>
                                            {new Date(transaction.createdAt).toLocaleDateString("fr-FR", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </Text>
                                    </View>
                                    <Text style={[styles.transactionAmount, isEarning ? styles.creditAmount : styles.debitAmount]}>
                                        {isEarning ? "+" : "-"}
                                        {formatMoney(transaction.amount)}€
                                    </Text>
                                </View>
                            );
                        })
                    )}

                    {transactions.length > 4 && (
                        <View style={styles.viewAllContainer}>
                            <TouchableOpacity style={styles.viewAllButton} onPress={() => router.push("/(app)/transactions")}>
                                <Text style={styles.viewAllText}>Voir tout</Text>
                                <Ionicons name="arrow-forward" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>

            <AddExpenseSheet visible={showAddExpense} onClose={() => setShowAddExpense(false)} onSuccess={() => loadData()} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#EBF2FB",
    },
    safeArea: {
        flex: 1,
        backgroundColor: "#EBF2FB",
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.base,
    },

    // Balance Card
    balanceCard: {
        backgroundColor: colors.primary[100],
        borderRadius: 12,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.base,
        paddingBottom: spacing.xl,
        marginBottom: spacing.xl,
        height: 195,
        ...shadows.lg,
    },
    balanceCardInner: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    balanceLeft: {
        flex: 1,
        justifyContent: "space-between",
        height: "100%",
    },
    balanceLabel: {
        ...typography.bold,
        ...typography.md,
        color: "rgba(255,255,255,0.7)",
    },
    balanceAmount: {
        ...typography.bold,
        ...typography.xxxxl,
        color: "white",
    },
    balanceInfo: {
        ...typography.regular,
        ...typography.md,
        color: "white",
    },
    coffreImage: {
        width: 120,
        height: 120,
    },

    // Actions
    actionsBar: {
        backgroundColor: "#D1DEF1",
        borderRadius: 8,
        paddingVertical: spacing.md,
        flexDirection: "row",
        marginBottom: spacing.base,
    },
    actionItem: {
        flex: 1,
        alignItems: "center",
        gap: 9,
    },
    actionButton: {
        width: 56,
        height: 56,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    actionLabel: {
        ...typography.bold,
        ...typography.sm,
        color: colors.carbon[100],
        textAlign: "center",
    },

    // Stat Cards — same style as parent.tsx infosCard
    statsRow: {
        flexDirection: "row",
        gap: spacing.base,
        marginBottom: spacing.lg,
    },
    statCard: {
        backgroundColor: "white",
        flex: 1,
        padding: spacing.md,
        borderRadius: 4,
        flexDirection: "column",
        gap: spacing.md,
        ...shadows.md,
    },
    statCardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },
    statCardIcon: {
        width: 32,
        height: 32,
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
    },
    statCardTitle: {
        ...typography.sm,
        ...typography.bold,
        color: colors.carbon[100],
        flex: 1,
    },
    statCardAmountRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    statCardAmount: {
        ...typography.bold,
        ...typography["2xl"],
        color: colors.carbon[100],
    },
    statCardArrow: {
        backgroundColor: "#EAEAEA",
        borderRadius: 4,
        padding: 4,
        justifyContent: "center",
        alignItems: "center",
    },
    statCardSub: {
        ...typography.sm,
        ...typography.semiBold,
        color: colors.carbon[100],
    },

    // Transactions
    sectionTitle: {
        ...typography.bold,
        ...typography.xl,
        color: colors.carbon[100],
        marginBottom: spacing.md,
    },
    transactionCard: {
        backgroundColor: "white",
        borderRadius: 8,
        overflow: "hidden",
        ...shadows.md,
    },
    transactionRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
        height: 66,
    },
    transactionBorder: {
        borderBottomWidth: 1,
        borderBottomColor: "#EBF2FB",
    },
    transactionIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
    },
    transactionInfo: {
        flex: 1,
    },
    transactionDescription: {
        ...typography.bold,
        ...typography.md,
        color: colors.carbon[100],
    },
    transactionDate: {
        ...typography.regular,
        ...typography.sm,
        color: colors.carbon[70],
    },
    transactionAmount: {
        ...typography.bold,
        ...typography.xl,
    },
    creditAmount: {
        color: "#16AA75",
    },
    debitAmount: {
        color: colors.carbon[100],
    },
    viewAllContainer: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.base,
    },
    viewAllButton: {
        backgroundColor: colors.carbon[40],
        borderRadius: 8,
        paddingVertical: spacing.md,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.md,
        shadowColor: colors.carbon[70],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    viewAllText: {
        ...typography.bold,
        ...typography.md,
        color: "white",
    },

    // Empty state
    emptyState: {
        padding: spacing["2xl"],
        alignItems: "center",
    },
    emptyIcon: {
        fontSize: 32,
        marginBottom: spacing.md,
    },
    emptyTitle: {
        ...typography.bold,
        ...typography.md,
        color: colors.carbon[100],
        marginBottom: spacing.sm,
        textAlign: "center",
    },
    emptyText: {
        ...typography.regular,
        ...typography.sm,
        color: colors.carbon[70],
        textAlign: "center",
    },

    bottomPadding: {
        height: spacing.lg,
    },
});
