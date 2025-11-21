import React, { useEffect, useState, useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { DMSans_700Bold, DMSans_400Regular, DMSans_600SemiBold } from "@expo-google-fonts/dm-sans";
import { Link, router } from "expo-router";
import { UserStorage } from "@/utils/storage";
import { SubAccount } from "@/types/Account";
import { useAuthContext } from "@/contexts/AuthContext";
import { tasksService } from "@/services/tasksService";
import { colors, spacing, typography, shadows } from "@/styles";

interface ChildSummary {
    child: SubAccount;
    tasksCount: number;
    completedTasksCount: number;
    loading: boolean;
}

export default function ParentHome() {
    const { user, refreshUserData } = useAuthContext();
    const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
    const [childrenSummary, setChildrenSummary] = useState<ChildSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [fontsLoaded] = useFonts({
        DMSans_700Bold,
        DMSans_400Regular,
        DMSans_600SemiBold,
    });

    const fontStylesTitle = fontsLoaded ? { fontFamily: "DMSans_700Bold" } : {};
    const fontStylesRegular = fontsLoaded ? { fontFamily: "DMSans_400Regular" } : {};
    const fontStylesSemiBold = fontsLoaded ? { fontFamily: "DMSans_600SemiBold" } : {};

    const childAccounts = useMemo(() => user?.subAccounts?.filter((account) => account.role === "CHILD") || [], [user?.subAccounts]);

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
        const initialSummaries: ChildSummary[] = childAccounts.map((child) => ({
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
                const completedTasks = tasks.filter((task) => task.status === "COMPLETED");

                setChildrenSummary((prev) =>
                    prev.map((summary, index) =>
                        index === i
                            ? {
                                  ...summary,
                                  tasksCount: tasks.length,
                                  completedTasksCount: completedTasks.length,
                                  loading: false,
                              }
                            : summary,
                    ),
                );
            } catch (error) {
                console.error(`Error loading tasks for child ${child.id}:`, error);
                setChildrenSummary((prev) => prev.map((summary, index) => (index === i ? { ...summary, loading: false } : summary)));
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

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Bonjour";
        if (hour < 18) return "Bon après-midi";
        return "Bonsoir";
    };

    const getTotalMoney = () => {
        return childAccounts.reduce((total, child) => {
            return total + parseFloat(child.money || "0");
        }, 0);
    };

    const getTotalTasks = () => {
        return childrenSummary.reduce((total, summary) => {
            return total + summary.tasksCount;
        }, 0);
    };

    const getTotalCompletedTasks = () => {
        return childrenSummary.reduce((total, summary) => {
            return total + summary.completedTasksCount;
        }, 0);
    };

    const renderChildCard = (summary: ChildSummary) => {
        const { child, tasksCount, completedTasksCount, loading: childLoading } = summary;
        const money = parseFloat(child.money || "0");
        const completionRate = tasksCount > 0 ? Math.round((completedTasksCount / tasksCount) * 100) : 0;

        return (
            <TouchableOpacity key={child.id} style={styles.childCard} onPress={() => router.push("/(app)/children")}>
                <View style={styles.childHeader}>
                    <View style={styles.childIconContainer}>
                        <Text style={styles.childIcon}>👶</Text>
                    </View>
                    <View style={styles.childInfo}>
                        <Text style={[styles.childName, fontStylesSemiBold]}>{child.name}</Text>
                        <Text style={[styles.childMoney, fontStylesRegular]}>{money.toFixed(2)}€</Text>
                    </View>
                </View>

                <View style={styles.childStats}>
                    <View style={styles.stat}>
                        {childLoading ? (
                            <ActivityIndicator size="small" color="#6C5CE7" />
                        ) : (
                            <>
                                <Text style={[styles.statValue, fontStylesSemiBold]}>
                                    {completedTasksCount}/{tasksCount}
                                </Text>
                                <Text style={[styles.statLabel, fontStylesRegular]}>Tâches</Text>
                            </>
                        )}
                    </View>
                    {tasksCount > 0 && (
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
                            </View>
                            <Text style={[styles.progressText, fontStylesRegular]}>{completionRate}%</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={colors.primary[100]} />
                <Text style={[styles.loadingText, fontStylesRegular]}>Chargement...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[100]} />}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.greeting, fontStylesRegular]}>{getGreeting()}</Text>
                    <Text style={[styles.nameText, fontStylesTitle]}>{subAccount?.name || "Parent"} !</Text>
                    <Text style={[styles.roleText, fontStylesRegular]}>Tableau de bord familial</Text>
                </View>

                {/* Stats générales */}
                <View style={styles.generalStats}>
                    <View style={styles.statCard}>
                        <Text style={styles.statIcon}>👨‍👩‍👧‍👦</Text>
                        <Text style={[styles.statNumber, fontStylesTitle]}>{childAccounts.length}</Text>
                        <Text style={[styles.statText, fontStylesRegular]}>{childAccounts.length > 1 ? "Enfants" : "Enfant"}</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statIcon}>💰</Text>
                        <Text style={[styles.statNumber, fontStylesTitle]}>{getTotalMoney().toFixed(0)}€</Text>
                        <Text style={[styles.statText, fontStylesRegular]}>Argent de poche</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statIcon}>✅</Text>
                        <Text style={[styles.statNumber, fontStylesTitle]}>
                            {getTotalCompletedTasks()}/{getTotalTasks()}
                        </Text>
                        <Text style={[styles.statText, fontStylesRegular]}>Tâches faites</Text>
                    </View>
                </View>

                {/* Section Enfants */}
                {childAccounts.length > 0 ? (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, fontStylesTitle]}>Mes enfants</Text>
                            <Link href="/(app)/children" asChild>
                                <TouchableOpacity style={styles.seeAllButton}>
                                    <Text style={[styles.seeAllText, fontStylesSemiBold]}>Tout voir</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>

                        <View style={styles.childrenContainer}>{childrenSummary.map(renderChildCard)}</View>
                    </View>
                ) : (
                    <View style={styles.section}>
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>👶</Text>
                            <Text style={[styles.emptyTitle, fontStylesTitle]}>Aucun enfant</Text>
                            <Text style={[styles.emptyText, fontStylesRegular]}>Créez un compte enfant pour commencer l'aventure !</Text>
                            <Link href="/accounts/create" asChild>
                                <TouchableOpacity style={styles.createButton}>
                                    <Text style={[styles.createButtonText, fontStylesSemiBold]}>Créer un compte enfant</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                )}

                {/* Actions rapides */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, fontStylesTitle]}>Actions rapides</Text>
                    <View style={styles.actionGrid}>
                        <Link href="/(app)/courses" asChild>
                            <TouchableOpacity style={styles.actionCard}>
                                <Text style={styles.actionIcon}>📚</Text>
                                <Text style={[styles.actionText, fontStylesSemiBold]}>Mes cours</Text>
                                <Text style={[styles.actionDescription, fontStylesRegular]}>Apprendre pour mieux enseigner</Text>
                            </TouchableOpacity>
                        </Link>

                        <Link href="/(app)/children" asChild>
                            <TouchableOpacity style={styles.actionCard}>
                                <Text style={styles.actionIcon}>💳</Text>
                                <Text style={[styles.actionText, fontStylesSemiBold]}>Gérer l'argent</Text>
                                <Text style={[styles.actionDescription, fontStylesRegular]}>Verser de l'argent de poche</Text>
                            </TouchableOpacity>
                        </Link>

                        <Link href="/(app)/children" asChild>
                            <TouchableOpacity style={styles.actionCard}>
                                <Text style={styles.actionIcon}>📝</Text>
                                <Text style={[styles.actionText, fontStylesSemiBold]}>Créer des tâches</Text>
                                <Text style={[styles.actionDescription, fontStylesRegular]}>Ajouter des missions</Text>
                            </TouchableOpacity>
                        </Link>

                        <Link href="/(app)/profile" asChild>
                            <TouchableOpacity style={styles.actionCard}>
                                <Text style={styles.actionIcon}>⚙️</Text>
                                <Text style={[styles.actionText, fontStylesSemiBold]}>Paramètres</Text>
                                <Text style={[styles.actionDescription, fontStylesRegular]}>Gérer les comptes</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.screenBackground,
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
        marginTop: spacing.md,
        ...typography.md,
        color: colors.carbon[60],
    },
    header: {
        paddingTop: spacing["3xl"],
        paddingBottom: spacing.lg + 10,
    },
    greeting: {
        ...typography.greeting,
        marginBottom: spacing.xs,
    },
    nameText: {
        ...typography.title,
        marginBottom: spacing.xs,
    },
    roleText: {
        ...typography.md,
        color: colors.primary[100],
        ...typography.semiBold,
    },
    generalStats: {
        flexDirection: "row",
        gap: spacing.md,
        marginBottom: spacing.lg + 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: spacing.sm,
        padding: spacing.lg,
        alignItems: "center",
        ...shadows.md,
    },
    statIcon: {
        fontSize: 28,
        marginBottom: spacing.sm,
    },
    statNumber: {
        ...typography["2xl"],
        ...typography.bold,
        color: colors.carbon[100],
        marginBottom: spacing.xs,
    },
    statText: {
        ...typography.xs,
        color: colors.carbon[60],
        textAlign: "center",
    },
    section: {
        marginBottom: spacing.lg + 10,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.base,
    },
    sectionTitle: {
        ...typography.subheading,
    },
    seeAllButton: {
        padding: spacing.sm,
    },
    seeAllText: {
        ...typography.sm,
        color: colors.primary[100],
        ...typography.semiBold,
    },
    childrenContainer: {
        gap: spacing.md,
    },
    childCard: {
        backgroundColor: colors.white,
        borderRadius: spacing.sm,
        padding: spacing.base,
        ...shadows.md,
    },
    childHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing.md,
    },
    childIconContainer: {
        width: 40,
        height: 40,
        borderRadius: spacing.sm,
        backgroundColor: colors.primary[10],
        justifyContent: "center",
        alignItems: "center",
        marginRight: spacing.md,
    },
    childIcon: {
        fontSize: 20,
    },
    childInfo: {
        flex: 1,
    },
    childName: {
        ...typography.md,
        ...typography.semiBold,
        color: colors.carbon[100],
        marginBottom: 2,
    },
    childMoney: {
        ...typography.sm,
        color: colors.primary[100],
        ...typography.semiBold,
    },
    childStats: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    stat: {
        alignItems: "center",
    },
    statValue: {
        ...typography.md,
        ...typography.bold,
        color: colors.carbon[100],
        marginBottom: 2,
    },
    statLabel: {
        ...typography.xs,
        color: colors.carbon[60],
    },
    progressContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        marginLeft: spacing.base,
        gap: spacing.sm,
    },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: colors.carbon[20],
        borderRadius: 3,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: colors.jadegreen[100],
        borderRadius: 3,
    },
    progressText: {
        ...typography.xs,
        color: colors.carbon[60],
        minWidth: 30,
    },
    emptyContainer: {
        backgroundColor: colors.white,
        borderRadius: spacing.sm,
        padding: spacing["3xl"],
        alignItems: "center",
        ...shadows.md,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: spacing.base,
    },
    emptyTitle: {
        ...typography.xl,
        ...typography.bold,
        color: colors.carbon[100],
        marginBottom: spacing.sm,
    },
    emptyText: {
        ...typography.subtitle,
        textAlign: "center",
        marginBottom: spacing.lg,
    },
    createButton: {
        backgroundColor: colors.primary[100],
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: spacing.sm,
    },
    createButtonText: {
        color: colors.white,
        ...typography.sm,
        ...typography.semiBold,
    },
    actionGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.md,
        marginTop: spacing.base,
    },
    actionCard: {
        backgroundColor: colors.white,
        borderRadius: spacing.sm,
        padding: spacing.lg,
        width: "47%",
        alignItems: "center",
        ...shadows.md,
    },
    actionIcon: {
        fontSize: 32,
        marginBottom: spacing.md,
    },
    actionText: {
        ...typography.sm,
        ...typography.semiBold,
        color: colors.carbon[100],
        textAlign: "center",
        marginBottom: spacing.xs,
    },
    actionDescription: {
        ...typography.xs,
        color: colors.carbon[60],
        textAlign: "center",
        lineHeight: 16,
    },
    bottomPadding: {
        height: spacing.lg,
    },
});
