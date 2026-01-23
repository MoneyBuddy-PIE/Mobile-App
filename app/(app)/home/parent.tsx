import React, { useEffect, useState, useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserStorage } from "@/utils/storage";
import { SubAccount } from "@/types/Account";
import { useAuthContext } from "@/contexts/AuthContext";
import { tasksService } from "@/services/tasksService";
import { chapterService } from "@/services/chapterService";
import { colors, spacing, typography, shadows } from "@/styles";
import { ValidateTasksModal } from "@/components/modal/ValidateTasksModal";
import Bells from "@/components/Icons/Bells";
import CheckMark from "@/components/Icons/CheckMark";
import MoneyBill from "@/components/Icons/MoneyBill";
import ListCheck from "@/components/Icons/ListCheck";
import { Task } from "@/types/Task";
import { Chapter } from "@/types/Chapter";
import { Course } from "@/types/Chapter";
import ChildCard from "@/components/ChildCard";
import CourseCard from "@/components/CourseCard";
import { logger } from "@/utils/logger";

export interface ChildSummary {
    child: SubAccount;
    tasksCount: number;
    completedTasksCount: number;
    preValidateTasksCount: number;
    preValidateTasks?: Task[];
    loading: boolean;
}

export default function ParentHome() {
    const { user, refreshUserData } = useAuthContext();
    const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
    const [childrenSummary, setChildrenSummary] = useState<ChildSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [currentCourse, setCurrentCourse] = useState<Course | null>(null);

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
            preValidateTasksCount: 0,
            loading: true,
        }));
        setChildrenSummary(initialSummaries);

        // Charger les tâches pour chaque enfant
        for (let i = 0; i < childAccounts.length; i++) {
            const child = childAccounts[i];
            try {
                const tasks = await tasksService.getTasksByChild(child.id);
                const completedTasks = tasks.filter((task) => task.status === "COMPLETED");
                const preValidateTasks = tasks.filter((task) => task.status === "PRE_VALIDATE");
                setChildrenSummary((prev) =>
                    prev.map((summary, index) =>
                        index === i
                            ? {
                                  ...summary,
                                  tasksCount: tasks.length,
                                  completedTasksCount: completedTasks.length,
                                  preValidateTasksCount: preValidateTasks.length,
                                  preValidateTasks: preValidateTasks,
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

    useEffect(() => {
        const fetchChapters = async () => {
            try {
                // Récupérer les chapitres pour le rôle PARENT
                const parentChapters = await chapterService.getAllChapters();
                setChapters(parentChapters);

                if (parentChapters.length > 0) {
                    // Récupérer les cours de tous les chapitres
                    const coursesData = await Promise.all(
                        parentChapters.map(async (chapter) => {
                            const chapterCourses = await chapterService.getChapterCourses(chapter.id);
                            return chapterCourses;
                        }),
                    );
                    const flattenedCourses = coursesData.flat();

                    // Sélectionner le premier cours non verrouillé
                    const firstUnlockedCourse = flattenedCourses.find((course) => !course.locked);
                    if (firstUnlockedCourse) {
                        setCurrentCourse(firstUnlockedCourse);
                    } else if (flattenedCourses.length > 0) {
                        // Si tous sont verrouillés, prendre le premier
                        setCurrentCourse(flattenedCourses[0]);
                    }
                }
            } catch (error) {
                console.error("Error loading chapters:", error);
            }
        };

        fetchChapters();
    }, []);

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

    const getTotalPreValidateTasks = () => {
        return childrenSummary.reduce((total, summary) => {
            return total + summary.preValidateTasksCount;
        }, 0);
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={colors.primary[100]} />
                <Text style={[styles.loadingText, typography.regular]}>Chargement...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[100]} />}
        >
            <View style={{ backgroundColor: colors.screenBackground }}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.nameText, typography.bold]}>
                        {getGreeting()}, {subAccount?.name || "Parent"} !
                    </Text>
                    <TouchableOpacity style={styles.notifsIcon}>
                        <Bells />
                    </TouchableOpacity>
                </View>

                {/* Infos */}
                <View style={styles.infosContainer}>
                    <Text style={styles.infosTitle}>Vous avez ...</Text>
                    <View style={styles.infoCardsContainer}>
                        {/* Taches à valider */}
                        <View style={styles.infosCard}>
                            <View style={styles.infoCardHeader}>
                                <View style={[styles.infoCardHeaderIcon, styles.preValidateTasksCardIcon]}>
                                    <CheckMark width={20} height={20} />
                                </View>
                            </View>
                            <View style={{ flexDirection: "column", gap: spacing.xs }}>
                                <Text style={styles.infoCardHeaderTitle}>{getTotalPreValidateTasks()}</Text>
                                <Text style={styles.infoCardSubtitle}>Tâches en attente de validation</Text>
                            </View>
                            <TouchableOpacity style={styles.preValidateTasksCardButton} onPress={() => setModalVisible(true)}>
                                <Text>Voir les tâches</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1, display: "flex", flexDirection: "column", gap: spacing.base }}>
                            <View style={styles.infosCard}>
                                <View style={styles.infoCardHeader}>
                                    <View style={[styles.infoCardHeaderIcon, styles.moneyCardIcon]}>
                                        <MoneyBill color={colors.primary[100]} width={20} height={20} />
                                    </View>
                                    <Text style={styles.infoCardHeaderTitle}>{getTotalMoney().toFixed(2)} €</Text>
                                </View>
                                <Text style={styles.infoCardSubtitle}>A verser samedi</Text>
                            </View>
                            <View style={styles.infosCard}>
                                <View style={styles.infoCardHeader}>
                                    <View style={[styles.infoCardHeaderIcon, styles.completedTasksCardIcon]}>
                                        <ListCheck width={20} height={20} />
                                    </View>
                                    <Text style={styles.infoCardHeaderTitle}>
                                        {getTotalCompletedTasks()}/{getTotalTasks()}
                                    </Text>
                                </View>
                                <Text style={styles.infoCardSubtitle}>Tâches terminées</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Message */}
                <View style={styles.messageContainer}>
                    <View style={{ flexDirection: "row", gap: spacing.md }}>
                        <Image source={require("@/assets/images/home/money-bag.png")} style={styles.messageImage} />
                        <View style={{ flex: 1, flexShrink: 1, gap: spacing.xs }}>
                            <Text style={styles.messageText}>Créez un rituel clair d'argent de poche ! 💸</Text>
                            <Text style={styles.messageSubtext}>
                                Un versement régulier aide votre enfant à planifier et comprendre la valeur de l'argent.
                            </Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.base }}>
                        <Text style={{ color: colors.carbon[80], ...typography.bold, paddingVertical: spacing.md, paddingHorizontal: spacing.base }}>
                            Ignorer
                        </Text>
                        <TouchableOpacity
                            style={{
                                backgroundColor: colors.primary[100],
                                paddingVertical: spacing.md,
                                paddingHorizontal: spacing.base,
                                borderRadius: 4,
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ color: colors.white, ...typography.bold }}>Configurer le versement</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Children Cards */}
                {childrenSummary.length > 0 && (
                    <View style={styles.childrenCardsContainer}>
                        <Text style={[styles.infosTitle, { paddingHorizontal: spacing.xl }]}>Mes enfants</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ marginTop: spacing.base, paddingHorizontal: spacing.xl }}
                            contentContainerStyle={{ gap: spacing.base, paddingRight: spacing.xl, paddingVertical: spacing.xs }}
                        >
                            {childrenSummary.map((childSummary) => (
                                <ChildCard key={childSummary.child.id} childSummary={childSummary} />
                            ))}
                        </ScrollView>
                    </View>
                )}
                {/* Cours */}
                <View style={styles.coursesContainer}>
                    <Text style={styles.infosTitle}>Continuez votre progression !</Text>
                    {currentCourse && (
                        <View style={styles.courseCardWrapper}>
                            <CourseCard
                                course={currentCourse}
                                progress={25}
                                onPress={() => {
                                    // TODO: Navigate to course detail
                                    // TODO: Implement course progress tracking
                                    console.log("Open course:", currentCourse.title);
                                }}
                            />
                        </View>
                    )}
                </View>

                <ValidateTasksModal
                    visible={modalVisible}
                    tasks={childrenSummary.flatMap((child) => child.preValidateTasks || [])}
                    children={childAccounts}
                    onClose={() => setModalVisible(false)}
                    onValidateTasks={() => setModalVisible(false)}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.screenBackground,
    },
    content: {
        flex: 1,
        backgroundColor: colors.white,
        paddingTop: 58,
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
    // Header
    header: {
        backgroundColor: colors.white,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: colors.shadow,
    },
    nameText: {
        ...typography.title,
        flex: 1,
    },
    notifsIcon: {
        width: 36,
        height: 36,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.shadow,
        justifyContent: "center",
        alignItems: "center",
    },
    // Infos
    infosContainer: {
        paddingTop: spacing.base,
        paddingHorizontal: spacing.xl,
        backgroundColor: colors.screenBackground,
    },
    infosTitle: {
        ...typography.xl,
        ...typography.bold,
        color: colors.carbon[100],
    },
    infoCardsContainer: {
        marginTop: spacing.base,
        display: "flex",
        flexDirection: "row",
        gap: spacing.base,
    },
    infosCard: {
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
    preValidateTasksCardIcon: {
        backgroundColor: "#E1FFF6",
    },
    moneyCardIcon: {
        backgroundColor: colors.primary[20],
    },
    completedTasksCardIcon: {
        backgroundColor: "#97C9FF66",
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
    preValidateTasksCardButton: {
        backgroundColor: colors.screenBackground,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.base,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
        ...typography.body,
        color: colors.carbon[80],
    },
    // message
    messageContainer: {
        marginVertical: spacing["3xl"],
        marginHorizontal: spacing.xl,
        padding: spacing.md,
        backgroundColor: "#BFD0EA99",
        borderRadius: 8,
        flexDirection: "column",
    },
    messageImage: {
        flexShrink: 0,
    },
    messageText: {
        ...typography.bold,
        ...typography.md,
        flexShrink: 1,
    },
    messageSubtext: {
        ...typography.sm,
        color: colors.carbon[80],
        flexShrink: 1,
    },
    // Children Cards
    childrenCardsContainer: {
        paddingBottom: spacing["3xl"],
    },
    // Cours
    coursesContainer: {
        paddingBottom: 200,
        paddingHorizontal: spacing.xl,
    },
    courseCardWrapper: {
        marginTop: spacing.base,
    },
});
