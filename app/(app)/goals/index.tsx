import React, { useCallback, useRef, useState } from "react";
import { formatMoney } from "@/utils/money";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Animated,
    PanResponder,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { goalsService } from "@/services/goalService";
import { Goal, GoalStatus } from "@/types/Goal";
import { UserStorage } from "@/utils/storage";
import colorList from "@/styles/colors";
import { CoinIcon } from "@/components/Icons/CoinIcon";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const getBgColor = (index: number) => colorList[index % colorList.length];

const formatGoalDate = (dateStr: string) => {
    try {
        const d = new Date(dateStr);
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yy = String(d.getFullYear()).slice(-2);
        return `${dd}/${mm}/${yy}`;
    } catch {
        return "--/--/--";
    }
};

interface ActiveCardProps {
    goal: Goal;
    index: number;
    onPress: () => void;
}

const ActiveGoalCard = ({ goal, index, onPress }: ActiveCardProps) => {
    const deposited = (goal.amount * goal.progression) / 100;
    const target = goal.amount || 1;
    const pct = goal.progression;

    return (
        <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.75}>
            <View style={cardStyles.topRow}>
                <View style={[cardStyles.iconBadge, { backgroundColor: getBgColor(index) }]}>
                    <Text style={cardStyles.iconEmoji}>{goal.emoji ?? "🎯"}</Text>
                </View>
                <Text style={cardStyles.name} numberOfLines={1}>
                    {goal.name}
                </Text>
                <View style={cardStyles.arrow}>
                    <Ionicons name="arrow-forward" size={14} color="#2F2F2F" />
                </View>
            </View>
            <View style={cardStyles.trackWrap}>
                <View style={[cardStyles.fill, { width: `${Math.max(pct, 2)}%` as any, backgroundColor: "#F06C8A" }]} />
            </View>
            <View style={cardStyles.bottomRow}>
                <Text style={cardStyles.amountText}>
                    {formatMoney(deposited)}€<Text style={cardStyles.amountSeparator}> / {formatMoney(target)}€</Text>
                </Text>
                <Text style={cardStyles.pctText}>{pct}%</Text>
            </View>
        </TouchableOpacity>
    );
};

interface DoneCardProps {
    goal: Goal;
    index: number;
    onPress: () => void;
}

const DoneGoalCard = ({ goal, index, onPress }: DoneCardProps) => {
    const deposited = goal.depositStatement ?? 0;

    return (
        <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.75}>
            <View style={cardStyles.topRow}>
                <View style={[cardStyles.iconBadge, { backgroundColor: getBgColor(index) }]}>
                    <Text style={cardStyles.iconEmoji}>{goal.emoji ?? "🎯"}</Text>
                </View>
                <Text style={cardStyles.name} numberOfLines={1}>
                    {goal.name}
                </Text>
                <View style={[cardStyles.checkBadge, { backgroundColor: "#16AA75" }]}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
            </View>
            <View style={cardStyles.trackWrap}>
                <View style={[cardStyles.fill, { width: "100%", backgroundColor: "#4FAEE8" }]} />
            </View>
            <View style={cardStyles.bottomRow}>
                <Text style={cardStyles.amountText}>{formatMoney(deposited)}€</Text>
                <Text style={cardStyles.doneLabel}>Terminé le {formatGoalDate(goal.updatedAt ?? "")} !</Text>
            </View>
        </TouchableOpacity>
    );
};

const ChildGoalsPage = () => {
    const { top: topInset } = useSafeAreaInsets();

    const [goals, setGoals] = useState<Goal[]>([]);
    const [coins, setCoins] = useState<number>(0);
    const [childId, setChildId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [doneOpen, setDoneOpen] = useState(true);

    const activeGoals = goals.filter((g) => g.goalStatus === GoalStatus.ACTIVATED);
    const doneGoals = goals.filter((g) => g.goalStatus === GoalStatus.DONE || g.goalStatus === GoalStatus.USED);

    const snapCollapsed = useRef(SCREEN_HEIGHT * 0.57 - 40);
    const snapExpanded = useRef(200);
    const translateY = useRef(new Animated.Value(snapCollapsed.current)).current;
    const currentSnapY = useRef(snapCollapsed.current);
    const gestureStartY = useRef(snapCollapsed.current);

    const onBackgroundLayout = useCallback(
        (e: { nativeEvent: { layout: { height: number } } }) => {
            const { height } = e.nativeEvent.layout;
            const newSnap = height - 40;
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

    const loadData = async () => {
        try {
            const sub = await UserStorage.getSubAccount();
            if (!sub) return;
            setChildId(sub.id ?? "");
            setCoins(Number(sub.coin) ?? 0);
            const data = await goalsService.getAllGoals({ childId: sub.id });
            setGoals(data);
        } catch (e) {
            console.error("ChildGoalsPage loadData:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, []),
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const goToDetail = (goal: Goal) => {
        router.push({
            pathname: "/(app)/goals/[id]",
            params: { id: goal.id, goal: JSON.stringify(goal), childId },
        });
    };

    const goToCreate = () => {
        router.push({
            pathname: "/(app)/goals/create",
            params: { childId },
        });
    };

    return (
        <View style={styles.container}>
            {/* Background image */}
            <View onLayout={onBackgroundLayout}>
                <Image source={require("@/assets/images/child_goal_page.png")} style={styles.catImage} resizeMode="cover" />
            </View>

            {/* Draggable bottom sheet */}
            <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
                {/* White header — drag zone */}
                <View {...panResponder.panHandlers} style={styles.sheetHeaderSection}>
                    <View style={styles.handleContainer}>
                        <View style={styles.handle} />
                    </View>
                    <View style={styles.headerContent}>
                        <View style={styles.headerTitleRow}>
                            <View style={styles.headerIcon}>
                                <Ionicons name="wallet" size={20} color="#FD618C" />
                            </View>
                            <Text style={styles.headerTitle}>Mes objectifs</Text>
                        </View>
                        <TouchableOpacity style={styles.addBtn} onPress={goToCreate} activeOpacity={0.8}>
                            <Ionicons name="add" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Scrollable content */}
                {loading ? (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator size="large" color="#16AA75" />
                    </View>
                ) : (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={{ flex: 1 }}
                        contentContainerStyle={styles.scrollContent}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16AA75" />}
                    >
                        {goals.length === 0 ? (
                            <View style={styles.emptyWrap}>
                                <Text style={styles.emptyEmoji}>🎯</Text>
                                <Text style={styles.emptyTitle}>Aucun objectif</Text>
                                <Text style={styles.emptyText}>Crée ton premier objectif pour commencer à épargner !</Text>
                            </View>
                        ) : (
                            <>
                                {activeGoals.map((goal, i) => (
                                    <ActiveGoalCard key={goal.id} goal={goal} index={i} onPress={() => goToDetail(goal)} />
                                ))}

                                {doneGoals.length > 0 && (
                                    <View style={styles.doneSection}>
                                        <TouchableOpacity style={styles.doneSectionHeader} onPress={() => setDoneOpen((o) => !o)} activeOpacity={0.7}>
                                            <View style={styles.doneCountBadge}>
                                                <Text style={styles.doneCountText}>{doneGoals.length}</Text>
                                            </View>
                                            <Text style={styles.doneSectionTitle}> Terminés ✅</Text>
                                            <Ionicons
                                                name={doneOpen ? "chevron-up" : "chevron-down"}
                                                size={24}
                                                color="#2F2F2F"
                                                style={{ marginLeft: "auto" }}
                                            />
                                        </TouchableOpacity>

                                        {doneOpen &&
                                            doneGoals.map((goal, i) => (
                                                <DoneGoalCard
                                                    key={goal.id}
                                                    goal={goal}
                                                    index={activeGoals.length + i}
                                                    onPress={() => goToDetail(goal)}
                                                />
                                            ))}
                                    </View>
                                )}
                            </>
                        )}
                    </ScrollView>
                )}
            </Animated.View>

            {/* Overlay: back button + coin pill — rendered after sheet so it always appears on top */}
            <View
                style={[styles.overlay, { top: topInset }]}
                pointerEvents="box-none"
                onLayout={(e) => {
                    snapExpanded.current = e.nativeEvent.layout.y + e.nativeEvent.layout.height;
                }}
            >
                <View style={styles.topBar}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={20} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.coinPill}>
                        <CoinIcon width={24} height={24} />
                        <Text style={styles.coinText}>{coins}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const cardStyles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 4,
        padding: 16,
        shadowColor: "#BFD0EA",
        shadowOffset: { width: 0, height: 3.89 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 3,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 8,
    },
    iconBadge: {
        width: 40,
        height: 40,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    iconEmoji: {
        fontSize: 22,
    },
    name: {
        flex: 1,
        fontFamily: "DMSans_700Bold",
        fontSize: 16,
        color: "#2F2F2F",
    },
    arrow: {
        width: 28,
        height: 28,
        borderRadius: 4,
        backgroundColor: "#EAEAEA",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    checkBadge: {
        borderRadius: 40,
        padding: 4,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    trackWrap: {
        height: 8,
        backgroundColor: "#EBF2FB",
        borderRadius: 40,
        overflow: "hidden",
        marginBottom: 8,
    },
    fill: {
        height: "100%",
        borderRadius: 40,
    },
    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    amountText: {
        fontFamily: "DMSans_700Bold",
        fontSize: 16,
        color: "#2F2F2F",
    },
    amountSeparator: {
        fontFamily: "DMSans_700Bold",
        fontSize: 16,
        color: "#828282",
    },
    pctText: {
        fontFamily: "DMSans_700Bold",
        fontSize: 16,
        color: "#828282",
    },
    doneLabel: {
        fontFamily: "DMSans_700Bold",
        fontSize: 16,
        color: "#828282",
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#C5E8D8",
    },

    // Background image
    catImage: {
        width: "100%",
        height: Math.min(500, SCREEN_HEIGHT * 0.57),
    },

    // Overlay (back + coins)
    overlay: {
        position: "absolute",
        left: 0,
        right: 0,
        zIndex: 10,
    },
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    backBtn: {
        backgroundColor: "#2F2F2F",
        borderRadius: 8,
        padding: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    coinPill: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 8,
        gap: 8,
    },
    coinText: {
        fontFamily: "DMSans_700Bold",
        fontSize: 20,
        color: "#2F2F2F",
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
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
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
        backgroundColor: "rgba(254, 160, 186, 0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontFamily: "DMSans_700Bold",
        fontSize: 24,
        color: "#2F2F2F",
    },
    addBtn: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: "#16AA75",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#005C49",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },

    // Loading
    loadingWrap: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    // Scroll
    scrollContent: {
        paddingTop: 24,
        paddingHorizontal: 24,
        paddingBottom: 120,
        gap: 16,
        backgroundColor: "#EBF2FB",
    },

    // Empty state
    emptyWrap: {
        alignItems: "center",
        paddingTop: 16,
        gap: 10,
    },
    emptyEmoji: {
        fontSize: 44,
    },
    emptyTitle: {
        fontFamily: "DMSans_700Bold",
        fontSize: 17,
        color: "#2F2F2F",
    },
    emptyText: {
        fontFamily: "DMSans_400Regular",
        fontSize: 14,
        color: "#828282",
        textAlign: "center",
        lineHeight: 20,
        paddingHorizontal: 20,
    },

    // Done section
    doneSection: {
        gap: 16,
    },
    doneSectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    doneCountBadge: {
        width: 26,
        backgroundColor: "#BFD0EA",
        borderRadius: 4,
        alignItems: "center",
        paddingVertical: 3,
        paddingHorizontal: 5,
    },
    doneCountText: {
        fontFamily: "DMSans_700Bold",
        fontSize: 14,
        color: "#2F2F2F",
    },
    doneSectionTitle: {
        fontFamily: "DMSans_700Bold",
        fontSize: 20,
        color: "#2F2F2F",
    },
});

export default ChildGoalsPage;
