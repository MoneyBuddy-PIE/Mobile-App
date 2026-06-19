import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, RefreshControl, View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Transaction } from "@/types/Transaction";
import { transactionService } from "@/services/transactionService";
import { userService } from "@/services/userService";
import MoneyFly from "@/components/Icons/MoneyFly";
import MoneyBill from "@/components/Icons/MoneyBill";
import { formatMoney } from "@/utils/money";
import getIconFromCategory from "@/utils/fn/getIconFromCategory";
import { colors, typography, spacing } from "@/styles";

function groupByMonth(transactions: Transaction[]): { label: string; data: Transaction[] }[] {
    const map = new Map<string, Transaction[]>();
    const sorted = [...transactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    for (const tx of sorted) {
        const date = new Date(tx.createdAt);
        const key = date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
        const capitalized = key.charAt(0).toUpperCase() + key.slice(1);
        if (!map.has(capitalized)) map.set(capitalized, []);
        map.get(capitalized)!.push(tx);
    }

    return Array.from(map.entries()).map(([label, data]) => ({ label, data }));
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
    const { type, incomeId, emoji } = transaction;
    const isCredit = type === "CREDIT" || !!incomeId;

    return (
        <View style={styles.row}>
            <View style={[styles.iconBox, isCredit ? styles.iconBoxCredit : styles.iconBoxDebit]}>
                {isCredit ? (
                    <MoneyBill width={20} height={20} color="#16AA75" />
                ) : (
                    (() => {
                        const Icon = getIconFromCategory(emoji ?? "other");
                        return <Icon width={20} height={20} color={colors.carbon[60]} />;
                    })()
                )}
            </View>
            <View style={styles.rowInfo}>
                <Text style={styles.rowDescription} numberOfLines={1}>
                    {transaction.description}
                </Text>
                <Text style={styles.rowDate}>
                    {new Date(transaction.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}
                </Text>
            </View>
            <Text style={[styles.rowAmount, isCredit ? styles.amountCredit : styles.amountDebit]}>
                {isCredit ? "+" : "-"}
                {formatMoney(transaction.amount)}€
            </Text>
        </View>
    );
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const accountData = await userService.getSubAccount();
            const txs = await transactionService.getTransactionsBySubAccount(accountData.id);
            setTransactions(txs);
        } catch (error) {
            console.error("Error loading transactions:", error);
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

    useEffect(() => {
        loadData();
    }, []);

    const grouped = groupByMonth(transactions);
    const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const todayLabel = today.charAt(0).toUpperCase() + today.slice(1);

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <View style={styles.headerTitleRow}>
                        <View style={styles.headerIcon}>
                            <MoneyFly width={20} height={20} color={colors.primary[100]} />
                        </View>
                        <Text style={styles.headerTitle}>Mes transactions</Text>
                    </View>
                    <Text style={styles.headerSubtitle}>{todayLabel}</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary[100]} />
                </View>
            ) : (
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[100]} />}
                >
                    {grouped.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>💰</Text>
                            <Text style={styles.emptyTitle}>Pas encore de transactions</Text>
                            <Text style={styles.emptyText}>Tes gains et dépenses apparaîtront ici !</Text>
                        </View>
                    ) : (
                        grouped.map(({ label, data }) => (
                            <View key={label} style={styles.group}>
                                <Text style={styles.monthLabel}>{label}</Text>
                                {data.map((tx) => (
                                    <TransactionRow key={tx.id} transaction={tx} />
                                ))}
                            </View>
                        ))
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingHorizontal: 24,
        paddingVertical: 20,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#BFD0EA",
    },
    backButton: {
        backgroundColor: "#2F2F2F",
        padding: 12,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    headerText: {
        flexDirection: "column",
        gap: 4,
    },
    headerTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    headerIcon: {
        backgroundColor: "#E6E2FB",
        borderRadius: 4,
        padding: 4,
        width: 32,
        height: 32,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#2F2F2F",
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#828282",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scroll: {
        flex: 1,
        backgroundColor: "#EBF2FB",
    },
    scrollContent: {
        padding: 20,
        gap: 8,
    },
    group: {
        gap: 8,
        marginBottom: 16,
    },
    monthLabel: {
        fontSize: 20,
        fontWeight: "700",
        color: "#2F2F2F",
        marginBottom: 4,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 12,
        height: 66,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
    },
    iconBoxCredit: {
        backgroundColor: "#9BFFE2",
    },
    iconBoxDebit: {
        backgroundColor: "#F0F0F0",
    },

    rowInfo: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        gap: 2,
    },
    rowDescription: {
        fontSize: 16,
        fontWeight: "700",
        color: "#2F2F2F",
    },
    rowDate: {
        fontSize: 14,
        fontWeight: "400",
        color: "#6E6E6E",
    },
    rowAmount: {
        fontSize: 20,
        fontWeight: "700",
    },
    amountCredit: {
        color: "#16AA75",
    },
    amountDebit: {
        color: "#2F2F2F",
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 60,
        gap: 8,
    },
    emptyIcon: {
        fontSize: 40,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#2F2F2F",
    },
    emptyText: {
        fontSize: 14,
        color: "#6E6E6E",
        textAlign: "center",
    },
});
