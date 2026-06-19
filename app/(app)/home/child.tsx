import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Animated, PanResponder, Dimensions, ScrollView } from "react-native";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { SubAccount } from "@/types/Account";
import { tasksService } from "@/services/tasksService";
import { userService } from "@/services/userService";
import { transactionService } from "@/services/transactionService";
import { goalsService } from "@/services/goalService";
import { Task } from "@/types/Task";
import { Transaction } from "@/types/Transaction";
import { Goal } from "@/types/Goal";
import { typography, colors, spacing } from "@/styles";
import { Ionicons } from "@expo/vector-icons";
import { logger } from "@/utils/logger";
import { formatMoney } from "@/utils/money";
import { CoinIcon } from "@/components/Icons/CoinIcon";
import { TreasureChest } from "@/components/Icons/TreasureChest";
import { LightningIcon } from "@/components/Icons/LightningIcon";
import MoneyBill from "@/components/Icons/MoneyBill";
import ListCheck from "@/components/Icons/ListCheck";
import MoneyFly from "@/components/Icons/MoneyFly";
import Pig from "@/components/Icons/Pig";
import { PiggyBankIcon } from "@/components/Icons/PiggyBankIcon";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Dragon height scales with screen so the earnings card stays visible
const DRAGON_HEIGHT = Math.min(370, SCREEN_HEIGHT * 0.44);
// Approximate heights of background content (topBar + dragon + earnings card)
const TOPBAR_HEIGHT = 80;
const EARNINGS_HEIGHT = 100;

export default function ChildHome() {
    const { top: topInset } = useSafeAreaInsets();

    const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddExpense, setShowAddExpense] = useState(false);

    const snapCollapsed = useRef(topInset + TOPBAR_HEIGHT + DRAGON_HEIGHT + EARNINGS_HEIGHT + 24);
    const snapExpanded = useRef(topInset + TOPBAR_HEIGHT + 10);

    const translateY = useRef(new Animated.Value(snapCollapsed.current)).current;
    const currentSnapY = useRef(snapCollapsed.current);
    const gestureStartY = useRef(snapCollapsed.current);

    const onEarningsLayout = useCallback(
        (e: { nativeEvent: { layout: { y: number; height: number } } }) => {
            const { y, height } = e.nativeEvent.layout;
            const newSnap = y + height + 24;
            snapCollapsed.current = newSnap;
            currentSnapY.current = newSnap;
            translateY.setValue(newSnap);
        },
        [translateY],
    );

    const panResponder = useRef(
        PanResponder.create({
            // Don't claim on touch-start so button taps still fire
            onStartShouldSetPanResponder: () => false,
            onStartShouldSetPanResponderCapture: () => false,
            // Claim once the user is clearly dragging vertically
            onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 8 && Math.abs(gs.dy) > Math.abs(gs.dx),
            onMoveShouldSetPanResponderCapture: () => false,
            onPanResponderGrant: () => {
                gestureStartY.current = currentSnapY.current;
            },
            onPanResponderMove: (_, gs) => {
                const clamped = Math.max(snapExpanded.current, Math.min(snapCollapsed.current, gestureStartY.current + gs.dy));
                translateY.setValue(clamped);
            },
            onPanResponderRelease: (_, gs) => {
                const pos = gestureStartY.current + gs.dy;
                const mid = (snapExpanded.current + snapCollapsed.current) / 2;
                const target = gs.vy < -0.3 || pos < mid ? snapExpanded.current : snapCollapsed.current;
                currentSnapY.current = target;
                Animated.spring(translateY, {
                    toValue: target,
                    useNativeDriver: true,
                    tension: 65,
                    friction: 11,
                }).start();
            },
        }),
    ).current;

    const loadData = useCallback(async () => {
        try {
            const [accountData, pendingTasks, completedTasks] = await Promise.all([
                userService.getSubAccount(),
                tasksService.getAllTasks(),
                tasksService.getAllTasks({ status: "COMPLETED" }),
            ]);
            setSubAccount(accountData);
            setTasks([...pendingTasks, ...completedTasks]);

            const [childTransactions, childGoals] = await Promise.allSettled([
                transactionService.getTransactionsBySubAccount(accountData.id),
                goalsService.getGoals(accountData.id),
            ]);
            setTransactions(childTransactions.status === "fulfilled" ? childTransactions.value : []);
            setGoals(childGoals.status === "fulfilled" ? childGoals.value : []);

            if (childTransactions.status === "rejected") logger.error("Error loading child transactions:", childTransactions.reason);
            if (childGoals.status === "rejected") logger.error("Error loading child goals:", childGoals.reason);
        } catch (error) {
            console.error("Error loading child home data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={colors.primary[100]} />
                <Text style={[styles.loadingText, typography.md]}>Chargement...</Text>
            </View>
        );
    }

    const completedTasks = tasks.filter((t) => t.status === "COMPLETED");
    const currentBalance = subAccount?.money ?? 0;
    const totalEarned = completedTasks.reduce((sum, t) => sum + t.moneyReward, 0);
    const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthlyTx = transactions.filter((t) => {
        const d = new Date(t.createdAt);
        return d >= startOfMonth && d <= endOfMonth;
    });

    const moneyDebited = monthlyTx.reduce((s, t) => (t.type !== "DEBIT" ? s : s + parseFloat(t.amount)), 0);
    const moneyCredited = monthlyTx.reduce((s, t) => (t.type !== "CREDIT" ? s : s + parseFloat(t.amount)), 0);
    const goalMoneySaved = goals.reduce((s, g) => s + g.progression, 0);

    return (
        // paddingTop pushes the background content below the status bar
        <View style={[styles.container, { paddingTop: topInset }]}>
            {/* Background layer — topBar + dragon + earnings card */}
            <View style={styles.topBar}>
                <View style={styles.topBarPin}>
                    <CoinIcon width={24} height={24} />
                    <Text style={typography.heading}>{formatMoney(currentBalance)}€</Text>
                </View>
                <View style={styles.topBarPin}>
                    <LightningIcon width={24} height={24} color="#FFD700" />
                    <Text style={typography.heading}>0/5</Text>
                </View>
            </View>

            <View pointerEvents="none">
                <Image
                    source={require("@/assets/images/child/dragonchild.png")}
                    style={[styles.dragonImage, { height: DRAGON_HEIGHT }]}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.allEarningsCard} onLayout={onEarningsLayout}>
                <View>
                    <View style={styles.allEarningsHeader}>
                        <View style={styles.allEarningsIcon}>
                            <MoneyBill width={20} height={20} color="#16aa75" />
                        </View>
                        <Text style={typography.subheading}>Tu as accumulé</Text>
                    </View>
                    <Text style={styles.allEarningsAmount}>{formatMoney(totalEarned)}€</Text>
                </View>
                <TreasureChest width={64} height={64} />
            </View>

            {/* Draggable bottom sheet — absolutely positioned over the background */}
            <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
                {/* Drag zone: handle pill + action buttons — both trigger the swipe */}
                <View {...panResponder.panHandlers}>
                    <View style={styles.handleContainer}>
                        <View style={styles.handle} />
                    </View>
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.depenserButton} onPress={() => setShowAddExpense(true)} activeOpacity={0.85}>
                            <MoneyFly width={32} height={32} color="#fff" />
                            <Text style={styles.actionButtonText}>Dépenser</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.economiserButton} onPress={() => router.push("/(app)/goals")} activeOpacity={0.85}>
                            <PiggyBankIcon width={32} height={32} color="white" />
                            <Text style={styles.actionButtonText}>Économiser</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Scrollable content */}
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                    <View style={styles.sheetContent}>
                        {/* Ce mois-ci */}
                        <View style={styles.sheetSection}>
                            <Text style={styles.sectionTitle}>Ce mois-ci</Text>
                            <View style={styles.statsRow}>
                                <View style={styles.statCard}>
                                    <View style={styles.statCardHeader}>
                                        <View style={[styles.statCardIcon, styles.debitIcon]}>
                                            <MoneyFly width={20} height={20} color={colors.primary[100]} />
                                        </View>
                                        <Text style={styles.statCardAmount}>{formatMoney(moneyDebited)}€</Text>
                                    </View>
                                    <Text style={styles.statCardLabel}>Dépensés</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <View style={styles.statCardHeader}>
                                        <View style={[styles.statCardIcon, styles.creditIcon]}>
                                            <MoneyBill width={20} height={20} color={colors.jadegreen[100]} />
                                        </View>
                                        <Text style={styles.statCardAmount}>{formatMoney(moneyCredited)}€</Text>
                                    </View>
                                    <Text style={styles.statCardLabel}>Gagnés</Text>
                                </View>
                            </View>
                            <View style={styles.statsRow}>
                                <View style={styles.statCard}>
                                    <View style={styles.statCardHeader}>
                                        <View style={[styles.statCardIcon, styles.savingsIcon]}>
                                            <Pig width={20} height={20} color={colors.pink[100]} />
                                        </View>
                                        <Text style={styles.statCardAmount}>{formatMoney(goalMoneySaved)}€</Text>
                                    </View>
                                    <Text style={styles.statCardLabel}>Économisés</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <View style={styles.statCardHeader}>
                                        <View style={[styles.statCardIcon, styles.tasksIcon]}>
                                            <ListCheck width={20} height={20} color={colors.blue[100]} />
                                        </View>
                                        <Text style={styles.statCardAmount}>{tasks.length > 0 ? completedTasks.length : "0"}</Text>
                                    </View>
                                    <Text style={styles.statCardLabel}>Tâches terminées</Text>
                                </View>
                            </View>
                        </View>

                        {/* Mes tâches */}
                        <View style={styles.sheetSection}>
                            <Text style={styles.sectionTitle}>Mes tâches</Text>
                            <View style={styles.taskProgressCard}>
                                <View style={styles.taskProgressHeader}>
                                    <View style={styles.taskProgressIconBg}>
                                        <Ionicons name="checkmark-circle" size={20} color="#16AA75" />
                                    </View>
                                    <Text style={styles.taskProgressPercent}>{completionRate}%</Text>
                                </View>
                                <View style={styles.progressTrack}>
                                    <View style={[styles.progressFill, { width: `${completionRate}%` as any }]} />
                                </View>
                                <View style={styles.taskProgressFooter}>
                                    <View style={styles.taskProgressRow}>
                                        <Text style={styles.taskProgressLabel}>Tâches</Text>
                                        <Text style={styles.taskProgressCount}>{tasks.length}</Text>
                                    </View>
                                    <View style={styles.taskProgressRow}>
                                        <Text style={styles.taskProgressLabel}>Terminées</Text>
                                        <Text style={styles.taskProgressCount}>{completedTasks.length}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </Animated.View>

            <AddExpenseSheet visible={showAddExpense} onClose={() => setShowAddExpense(false)} onSuccess={() => loadData()} />
        </View>
    );
}

const cardShadow = {
    shadowColor: "#BFD0EA",
    shadowOffset: { width: 0, height: 3.887 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#97C9FF",
    },
    center: {
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: spacing.md,
        color: colors.carbon[60],
    },

    // Top bar
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

    // Dragon
    dragonImage: {
        marginHorizontal: 70,
        width: "auto",
    },

    // All earnings card
    allEarningsCard: {
        padding: 12,
        marginHorizontal: 24,
        borderRadius: 8,
        backgroundColor: "#FFF",
        borderColor: "#EBF2FB",
        borderWidth: 2,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    allEarningsHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
        gap: 8,
    },
    allEarningsIcon: {
        padding: 6,
        borderRadius: 4,
        backgroundColor: "#9bffe2",
    },
    allEarningsAmount: {
        fontFamily: "DMSans_700Bold",
        fontSize: 40,
        color: "#2F2F2F",
    },
    chestImage: {
        width: 64,
        height: 64,
    },

    // Bottom sheet
    sheet: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: SCREEN_HEIGHT,
        backgroundColor: "#EBF2FB",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },

    // Handle
    handleContainer: {
        alignItems: "center",
        paddingTop: 8,
        paddingBottom: 12,
    },
    handle: {
        width: 108,
        height: 5,
        backgroundColor: "#2F2F2F",
        borderRadius: 24,
    },

    // Action buttons
    actionButtons: {
        flexDirection: "row",
        gap: 16,
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    depenserButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        backgroundColor: "#846DED",
        paddingVertical: 12,
        borderRadius: 8,
        shadowColor: "#4E31CF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    economiserButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        backgroundColor: "#FD618C",
        paddingVertical: 12,
        borderRadius: 8,
        shadowColor: "#D1325E",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    actionButtonText: {
        color: "#fff",
        fontFamily: "DMSans_700Bold",
        fontSize: 16,
    },

    // Sheet content
    sheetContent: {
        paddingHorizontal: 24,
        paddingBottom: 120,
        gap: 24,
    },
    sheetSection: {
        gap: 16,
    },
    sectionTitle: {
        fontFamily: "DMSans_700Bold",
        fontSize: 20,
        color: "#2F2F2F",
    },

    // Stats grid
    statsRow: {
        flexDirection: "row",
        gap: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.white,
        padding: 12,
        borderRadius: 4,
        gap: spacing.sm,
        ...cardShadow,
    },
    statCardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    statCardIcon: {
        width: 32,
        height: 32,
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
    },
    debitIcon: {
        backgroundColor: colors.primary[20],
    },
    creditIcon: {
        backgroundColor: colors.aquamarine[60],
    },
    savingsIcon: {
        backgroundColor: "rgba(254, 160, 186, 0.4)",
    },
    tasksIcon: {
        backgroundColor: "rgba(151, 201, 255, 0.4)",
    },
    statCardAmount: {
        fontFamily: "DMSans_700Bold",
        fontSize: 24,
        color: "#2F2F2F",
        flexShrink: 1,
    },
    statCardLabel: {
        fontSize: 14,
        color: "#2F2F2F",
    },

    // Task progress card
    taskProgressCard: {
        backgroundColor: colors.white,
        padding: 12,
        borderRadius: 4,
        gap: 8,
        ...cardShadow,
    },
    taskProgressHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    taskProgressIconBg: {
        width: 32,
        height: 32,
        borderRadius: 4,
        backgroundColor: "#E1FFF6",
        justifyContent: "center",
        alignItems: "center",
    },
    taskProgressPercent: {
        fontFamily: "DMSans_700Bold",
        fontSize: 24,
        color: "#2F2F2F",
    },
    progressTrack: {
        height: 8,
        backgroundColor: "#EBF2FB",
        borderRadius: 40,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#16AA75",
        borderRadius: 37,
    },
    taskProgressFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    taskProgressRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    taskProgressLabel: {
        fontSize: 14,
        color: "#828282",
    },
    taskProgressCount: {
        fontSize: 14,
        fontFamily: "DMSans_700Bold",
        color: "#828282",
    },
});
