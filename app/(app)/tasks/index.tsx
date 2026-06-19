import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    Animated,
    PanResponder,
    Dimensions,
    ScrollView,
    Alert,
    Modal,
    FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SubAccount } from "@/types/Account";
import { tasksService } from "@/services/tasksService";
import { userService } from "@/services/userService";
import { Task } from "@/types/Task";
import { typography, colors, spacing } from "@/styles";
import { formatMoney } from "@/utils/money";
import { Ionicons } from "@expo/vector-icons";
import { CoinIcon } from "@/components/Icons/CoinIcon";
import { LightningIcon } from "@/components/Icons/LightningIcon";
import TodoIcon from "@/components/Icons/TodoIcon";
import TimeCheckIcon from "@/components/Icons/TimeCheckIcon";
import EmptyTasksIcon from "@/components/Icons/EmptyTasksIcon";
import TaskTile from "@/components/TaskTile";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const DRAGON_HEIGHT = Math.min(370, SCREEN_HEIGHT * 0.44);
const TOPBAR_HEIGHT = 80;

// European week index: Mon=0, Tue=1, ..., Sat=5, Sun=6
const EU_DOW: Record<string, number> = {
    MONDAY: 0,
    TUESDAY: 1,
    WEDNESDAY: 2,
    THURSDAY: 3,
    FRIDAY: 4,
    SATURDAY: 5,
    SUNDAY: 6,
};

function todayEuDow(): number {
    return (new Date().getDay() + 6) % 7;
}

function categorizeTasks(tasks: Task[]) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayDate = now.getDate();
    const euToday = todayEuDow();
    const todayDowStr = Object.keys(EU_DOW).find((k) => EU_DOW[k] === euToday) ?? "";

    const pending = tasks.filter((t) => t.status === "PENDING" || t.status === "PRE_VALIDATE" || t.status === "REFUSED");

    const late: Task[] = [];
    const todayList: Task[] = [];
    const upcoming: Task[] = [];

    for (const task of pending) {
        if (task.type === "WEEKLY") {
            if (task.weeklyDays.includes(todayDowStr as any)) {
                todayList.push(task);
            } else if (task.weeklyDays.some((d) => EU_DOW[d] < euToday)) {
                late.push(task);
            } else {
                upcoming.push(task);
            }
        } else if (task.type === "MONTHLY") {
            if (task.monthlyDay === todayDate) todayList.push(task);
            else if (task.monthlyDay < todayDate) late.push(task);
            else upcoming.push(task);
        } else if (!task.dateLimit) {
            todayList.push(task);
        } else {
            const dl = new Date(task.dateLimit);
            const dlDate = new Date(dl.getFullYear(), dl.getMonth(), dl.getDate());
            if (dlDate < today) late.push(task);
            else if (dlDate.getTime() === today.getTime()) todayList.push(task);
            else upcoming.push(task);
        }
    }

    return { late, today: todayList, upcoming };
}

export default function Tasks() {
    const { top: topInset } = useSafeAreaInsets();

    const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({ late: true, today: true, upcoming: false });
    const [showHistory, setShowHistory] = useState(false);

    const snapCollapsed = useRef(topInset + TOPBAR_HEIGHT + DRAGON_HEIGHT + 16);
    const snapExpanded = useRef(topInset + TOPBAR_HEIGHT + 10);
    const translateY = useRef(new Animated.Value(snapCollapsed.current)).current;
    const currentSnapY = useRef(snapCollapsed.current);
    const gestureStartY = useRef(snapCollapsed.current);

    const onBackgroundLayout = useCallback(
        (e: { nativeEvent: { layout: { height: number } } }) => {
            const { height } = e.nativeEvent.layout;
            const newSnap = topInset + height + 16;
            snapCollapsed.current = newSnap;
            currentSnapY.current = newSnap;
            translateY.setValue(newSnap);
        },
        [topInset, translateY],
    );

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onStartShouldSetPanResponderCapture: () => false,
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
                Animated.spring(translateY, { toValue: target, useNativeDriver: true, tension: 65, friction: 11 }).start();
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
        } catch (error) {
            console.error("Error loading tasks:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCompleteTask = async (task: Task) => {
        try {
            if (task.status === "PRE_VALIDATE") {
                await tasksService.preValidateTask(task.id);
                await loadData();
                return;
            }
            if (task.preValidate) {
                await tasksService.preValidateTask(task.id);
                Alert.alert("Envoyé ! 📩", "Ta tâche a été envoyée à tes parents pour validation.", [
                    { text: "Compris !", onPress: () => loadData() },
                ]);
            } else {
                await tasksService.completeTask(task.id);
                Alert.alert("Bravo ! 🎉", "Tu as terminé cette tâche !", [{ text: "Super !", onPress: () => loadData() }]);
            }
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

    const currentBalance = subAccount?.money ?? 0;
    const completedTasks = tasks.filter((t) => t.status === "COMPLETED");
    const totalEarned = completedTasks.reduce((s, t) => s + t.moneyReward, 0);
    const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

    const { late: lateTasks, today: todayTasks, upcoming: upcomingTasks } = categorizeTasks(tasks);

    const now = new Date();
    const rawDate = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const formattedDate = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

    const sections = [
        { key: "late", label: "❗️ En retard", tasks: lateTasks },
        { key: "today", label: "Aujourd'hui", tasks: todayTasks },
        { key: "upcoming", label: "À venir", tasks: upcomingTasks },
    ].filter((s) => s.tasks.length > 0);

    const toggleSection = (key: string) => {
        setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <View style={[styles.container, { paddingTop: topInset }]}>
            {/* Background layer: topbar + dragon */}
            <View onLayout={onBackgroundLayout}>
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
            </View>

            {/* Completed tasks history modal */}
            <Modal visible={showHistory} animationType="slide" transparent onRequestClose={() => setShowHistory(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHeader}>
                            <View style={styles.headerTitleRow}>
                                <View style={styles.headerIcon}>
                                    <TimeCheckIcon width={20} height={20} />
                                </View>
                                <Text style={styles.headerTitle}>Tâches terminées</Text>
                                <View style={styles.sectionCountBadge}>
                                    <Text style={styles.sectionCountText}>{completedTasks.length}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setShowHistory(false)} style={styles.modalCloseButton} activeOpacity={0.7}>
                                <Ionicons name="close" size={20} color="#2F2F2F" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={completedTasks}
                            keyExtractor={(t) => t.id}
                            contentContainerStyle={styles.modalList}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <EmptyTasksIcon width={64} height={64} />
                                    <Text style={styles.emptyText}>Aucune tâche terminée pour l'instant.</Text>
                                </View>
                            }
                            renderItem={({ item }) => <TaskTile key={item.id} task={item} />}
                        />
                    </View>
                </View>
            </Modal>

            {/* Draggable bottom sheet */}
            <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
                {/* White header — drag zone */}
                <View {...panResponder.panHandlers} style={styles.sheetHeaderSection}>
                    <View style={styles.handleContainer}>
                        <View style={styles.handle} />
                    </View>
                    <View style={styles.headerContent}>
                        <View style={styles.headerLeft}>
                            <View style={styles.headerTitleRow}>
                                <View style={styles.headerIcon}>
                                    <TodoIcon width={20} height={20} />
                                </View>
                                <Text style={styles.headerTitle}>Mes tâches</Text>
                            </View>
                            <Text style={styles.headerDate}>{formattedDate}</Text>
                        </View>
                        <TouchableOpacity style={styles.historyButton} onPress={() => setShowHistory(true)} activeOpacity={0.8}>
                            <TimeCheckIcon width={24} height={24} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* White progress section */}
                <View style={styles.progressSection}>
                    <Text style={styles.progressAmount}>+ {formatMoney(totalEarned)}€</Text>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${Math.max(completionRate, 2)}%` as any }]} />
                    </View>
                    <View style={styles.progressFooter}>
                        <View style={styles.progressRow}>
                            <Text style={styles.progressLabel}>Tâches</Text>
                            <Text style={styles.progressCount}>{tasks.length}</Text>
                        </View>
                        <View style={styles.progressRow}>
                            <Text style={styles.progressLabel}>Terminées</Text>
                            <Text style={styles.progressCount}>{completedTasks.length}</Text>
                        </View>
                    </View>
                </View>

                {/* Scrollable content */}
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
                    {sections.length === 0 ? (
                        <View style={styles.emptyState}>
                            <EmptyTasksIcon width={80} height={80} />
                            <Text style={styles.emptyText}>
                                {tasks.length === 0
                                    ? "Rien à faire pour l'instant…\nDemande à ton parent d'en ajouter\nune pour commencer ! 🚀✨"
                                    : "Toutes tes tâches sont terminées ! 🎉\nBravo pour ton travail !"}
                            </Text>
                        </View>
                    ) : (
                        sections.map((section) => (
                            <View key={section.key} style={styles.section}>
                                <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection(section.key)} activeOpacity={0.7}>
                                    <View style={styles.sectionCountBadge}>
                                        <Text style={styles.sectionCountText}>{section.tasks.length}</Text>
                                    </View>
                                    <Text style={styles.sectionTitle}>{section.label}</Text>
                                    <Ionicons name={expanded[section.key] ? "chevron-up" : "chevron-down"} size={24} color={colors.carbon[100]} />
                                </TouchableOpacity>
                                {expanded[section.key] && (
                                    <View style={styles.sectionContent}>
                                        {section.tasks.map((task) => (
                                            <TaskTile key={task.id} task={task} onPress={() => handleCompleteTask(task)} />
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))
                    )}
                </ScrollView>
            </Animated.View>
        </View>
    );
}

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

    // White header section
    sheetHeaderSection: {
        backgroundColor: "#fff",
        borderBottomWidth: 2,
        borderBottomColor: "#BFD0EA",
        paddingBottom: 24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
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
    headerContent: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        paddingHorizontal: 24,
    },
    headerLeft: {
        gap: 4,
    },
    headerTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    headerIcon: {
        width: 32,
        height: 32,
        borderRadius: 4,
        backgroundColor: "#D5E9FF",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontFamily: "DMSans_700Bold",
        fontSize: 24,
        color: "#2F2F2F",
    },
    headerDate: {
        fontFamily: "DMSans_700Bold",
        fontSize: 14,
        color: "#828282",
    },
    historyButton: {
        backgroundColor: "#ACACAC",
        borderRadius: 8,
        padding: 12,
        shadowColor: "#6E6E6E",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },

    // White progress section
    progressSection: {
        backgroundColor: "#fff",
        borderBottomWidth: 2,
        borderBottomColor: "#BFD0EA",
        paddingHorizontal: 24,
        paddingVertical: 16,
        gap: 8,
    },
    progressAmount: {
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
    progressFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    progressRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    progressLabel: {
        fontSize: 14,
        color: "#828282",
    },
    progressCount: {
        fontSize: 14,
        fontFamily: "DMSans_700Bold",
        color: "#828282",
    },

    // Scrollable content
    scrollContent: {
        paddingTop: 24,
        paddingHorizontal: 24,
        paddingBottom: 120,
        gap: 24,
        backgroundColor: colors.screenBackground,
    },

    // Empty state
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 24,
        paddingHorizontal: 12,
        gap: 12,
    },
    emptyIcon: {
        fontSize: 64,
    },
    emptyText: {
        fontSize: 16,
        color: "#2F2F2F",
        textAlign: "center",
        lineHeight: 22,
    },

    // Accordion sections
    section: {
        gap: 16,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    sectionCountBadge: {
        width: 26,
        backgroundColor: "#BFD0EA",
        borderRadius: 4,
        alignItems: "center",
        paddingVertical: 3,
        paddingHorizontal: 5,
    },
    sectionCountText: {
        fontFamily: "DMSans_700Bold",
        fontSize: 14,
        color: "#2F2F2F",
    },
    sectionTitle: {
        flex: 1,
        fontFamily: "DMSans_700Bold",
        fontSize: 20,
        color: "#2F2F2F",
    },
    sectionContent: {
        gap: 16,
    },

    // History modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },
    modalSheet: {
        backgroundColor: "#EBF2FB",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: SCREEN_HEIGHT * 0.75,
        paddingBottom: 32,
    },
    modalHandle: {
        width: 108,
        height: 5,
        backgroundColor: "#2F2F2F",
        borderRadius: 24,
        alignSelf: "center",
        marginTop: 8,
        marginBottom: 12,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderBottomWidth: 2,
        borderBottomColor: "#BFD0EA",
    },
    modalCloseButton: {
        backgroundColor: "#EBF2FB",
        borderRadius: 8,
        padding: 8,
    },
    modalList: {
        padding: 24,
        gap: 12,
    },
});
