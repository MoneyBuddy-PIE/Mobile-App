import React, { useCallback, useRef, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Animated,
    PanResponder,
    useWindowDimensions,
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { goalsService } from '@/services/goalService'
import { Goal, GoalStatus } from '@/types/Goal'
import { UserStorage } from '@/utils/storage'
import colorList from '@/styles/colors'

const SHEET_PEEK_RATIO = 0.30   // sheet height (collapsed) relative to screen
const SHEET_MAX_RATIO  = 0.70  // sheet height (expanded) relative to screen
const DRAG_THRESHOLD   = 60     // px drag to trigger snap

const getBgColor = (index: number) => colorList[index % colorList.length]

const formatGoalDate = (dateStr: string) => {
    try {
        const d = new Date(dateStr)
        const dd = String(d.getDate()).padStart(2, '0')
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const yy = String(d.getFullYear()).slice(-2)
        return `${dd}/${mm}/${yy}`
    } catch {
        return '--/--/--'
    }
}

interface ActiveCardProps {
    goal: Goal
    index: number
    onPress: () => void
}

const ActiveGoalCard = ({ goal, index, onPress }: ActiveCardProps) => {
    const deposited = (goal.amount * goal.progression) / 100
    const target = goal.amount || 1
    const pct = goal.progression

    return (
        <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.75}>
            {/* Row: icon + name + arrow */}
            <View style={cardStyles.topRow}>
                <View style={[cardStyles.iconBadge, { backgroundColor: getBgColor(index) }]}>
                    <Text style={cardStyles.iconEmoji}>{goal.emoji ?? '🎯'}</Text>
                </View>
                <Text style={cardStyles.name} numberOfLines={1}>{goal.name}</Text>
                <View style={cardStyles.arrow}>
                    <Ionicons name="arrow-forward" size={14} color="2F2F2F" />
                </View>
            </View>

            {/* Progress bar */}
            <View style={cardStyles.trackWrap}>
                <View style={[cardStyles.fill, { width: `${pct}%`, backgroundColor: '#F06C8A' }]} />
            </View>

            {/* Amounts */}
            <View style={cardStyles.bottomRow}>
                <Text style={cardStyles.amountText}>
                    {deposited.toFixed(2)}€
                    <Text style={cardStyles.amountSeparator}> / </Text>
                    <Text style={cardStyles.amountSeparator}>{target.toFixed(2)}€</Text>
                </Text>
                <Text style={cardStyles.pctText}>{pct}%</Text>
            </View>
        </TouchableOpacity>
    )
}

interface DoneCardProps {
    goal: Goal
    index: number
    onPress: () => void
}

const DoneGoalCard = ({ goal, index, onPress }: DoneCardProps) => {
    const deposited = goal.depositStatement ?? 0

    return (
        <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.75}>
            {/* Row: icon + name + checkmark */}
            <View style={cardStyles.topRow}>
                <View style={[cardStyles.iconBadge, { backgroundColor: getBgColor(index) }]}>
                    <Text style={cardStyles.iconEmoji}>{goal.emoji ?? '🎯'}</Text>
                </View>
                <Text style={cardStyles.name} numberOfLines={1}>{goal.name}</Text>
                <View style={[cardStyles.checkBadge, {backgroundColor: "#16AA75"}]}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
            </View>

            {/* Progress bar – full */}
            <View style={cardStyles.trackWrap}>
                <View style={[cardStyles.fill, { width: '100%', backgroundColor: '#4FAEE8' }]} />
            </View>

            {/* Amounts */}
            <View style={cardStyles.bottomRow}>
                <Text style={cardStyles.amountText}>{deposited.toFixed(2)}€</Text>
                <Text style={cardStyles.doneLabel}>Terminé le {formatGoalDate(goal.updatedAt)} !</Text>
            </View>
        </TouchableOpacity>
    )
}

const ChildGoalsPage = () => {
    const { height: screenH } = useWindowDimensions()

    const peekH  = Math.round(screenH * SHEET_PEEK_RATIO)
    const maxH   = Math.round(screenH * SHEET_MAX_RATIO)

    // Animated sheet height
    const sheetAnim = useRef(new Animated.Value(peekH)).current
    const currentH  = useRef(peekH)

    // State
    const [goals, setGoals]           = useState<Goal[]>([])
    const [coins, setCoins]           = useState<number>(0)
    const [childId, setChildId]       = useState<string>('')
    const [loading, setLoading]       = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [doneOpen, setDoneOpen]     = useState(true)

    // Derived lists
    const activeGoals = goals.filter(g => g.goalStatus === GoalStatus.ACTIVATED)
    const doneGoals   = goals.filter(g => g.goalStatus === GoalStatus.DONE || g.goalStatus === GoalStatus.USED)

    // ── Data loading ────────────────────────────────────────────────────────
    const loadData = async () => {
        try {
            const sub = await UserStorage.getSubAccount()
            if (!sub) return
            setChildId(sub.id)
            setCoins(Number(sub.coin) ?? 0)
            const data = await goalsService.getAllGoals({ childId: sub.id })
            setGoals(data)
        } catch (e) {
            console.error('ChildGoalsPage loadData:', e)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useFocusEffect(
        useCallback(() => {
            loadData()
        }, [])
    )

    const onRefresh = () => {
        setRefreshing(true)
        loadData()
    }

    // ── Sheet drag gesture ───────────────────────────────────────────────────
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
            onPanResponderMove: (_, g) => {
                const next = currentH.current - g.dy
                const clamped = Math.max(peekH, Math.min(maxH, next))
                sheetAnim.setValue(clamped)
            },
            onPanResponderRelease: (_, g) => {
                const target = g.dy < -DRAG_THRESHOLD
                    ? maxH
                    : g.dy > DRAG_THRESHOLD
                    ? peekH
                    : currentH.current
                currentH.current = target
                Animated.spring(sheetAnim, {
                    toValue: target,
                    useNativeDriver: false,
                    friction: 12,
                    tension: 100,
                }).start()
            },
        })
    ).current

    // ── Navigate to detail ───────────────────────────────────────────────────
    const goToDetail = (goal: Goal) => {
        router.push({
            pathname: '/(app)/goals/[id]',
            params: { id: goal.id, goal: JSON.stringify(goal), childId },
        })
    }

    // ── Navigate to create ───────────────────────────────────────────────────
    const goToCreate = () => {
        router.push({
            pathname: '/(app)/goals/create',
            params: { childId },
        })
    }

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <View style={styles.root}>

            {/* Background image */}
            <Image
                source={require('@/assets/images/child_goal_page.png')}
                style={styles.bgImage}
                resizeMode="cover"
            />

            {/* Absolute overlay: back + coins */}
            <SafeAreaView style={styles.overlay} pointerEvents="box-none">
                <View style={styles.topBar}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={14} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.coinPill}>
                        <Text style={styles.coinEmoji}>🟡</Text>
                        <Text style={styles.coinText}>{coins}</Text>
                    </View>
                </View>
            </SafeAreaView>

            {/* Draggable bottom sheet */}
            <Animated.View style={[styles.sheet, { height: sheetAnim }]}>

                {/* Drag handle */}
                <View style={styles.handleWrap} {...panResponder.panHandlers}>
                    <View style={styles.handle} />
                </View>

                {/* Sheet header */}
                <View style={styles.sheetHeader}>
                    <View style={styles.sheetTitleRow}>
                        <View style={[styles.IconContainer, {backgroundColor: "#FEA0BA66"}]}>
                            <Ionicons name="wallet" size={20} color={"#FD618C"}/>
                        </View>
                        <Text style={styles.sheetTitle}>Mes objectifs</Text>
                    </View>
                    <TouchableOpacity style={styles.addBtn} onPress={goToCreate}>
                        <Ionicons name="add" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Scrollable content */}
                {loading ? (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator size="large" color="#16AA75" />
                    </View>
                ) : (
                    <ScrollView
                        style={styles.scroll}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16AA75" />
                        }
                    >
                        {/* Empty state */}
                        {goals.length === 0 && (
                            <View style={styles.emptyWrap}>
                                <Text style={styles.emptyEmoji}>🎯</Text>
                                <Text style={styles.emptyTitle}>Aucun objectif</Text>
                                <Text style={styles.emptyText}>Crée ton premier objectif pour commencer à épargner !</Text>
                            </View>
                        )}

                        {/* Active goals */}
                        {activeGoals.map((goal, i) => (
                            <ActiveGoalCard
                                key={goal.id}
                                goal={goal}
                                index={i}
                                onPress={() => goToDetail(goal)}
                            />
                        ))}

                        {/* Done goals section */}
                        {doneGoals.length > 0 && (
                            <View style={styles.doneSection}>
                                <TouchableOpacity
                                    style={styles.doneSectionHeader}
                                    onPress={() => setDoneOpen(o => !o)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.doneCountBadge}>
                                        <Text style={styles.doneCountText}>{doneGoals.length}</Text>
                                    </View>
                                    <Text style={styles.doneSectionTitle}>Terminés ✅</Text>
                                    <Ionicons
                                        name={doneOpen ? 'chevron-up' : 'chevron-down'}
                                        size={24}
                                        color="#2F2F2F"
                                        style={{ marginLeft: 'auto' }}
                                    />
                                </TouchableOpacity>

                                {doneOpen && doneGoals.map((goal, i) => (
                                    <DoneGoalCard
                                        key={goal.id}
                                        goal={goal}
                                        index={activeGoals.length + i}
                                        onPress={() => goToDetail(goal)}
                                    />
                                ))}
                            </View>
                        )}

                        <View style={{ height: 40 }} />
                    </ScrollView>
                )}
            </Animated.View>
        </View>
    )
}

// ─── Goal card styles ─────────────────────────────────────────────────────────

const cardStyles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 4,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#BFD0EA',
        shadowOffset: { width: 0, height: 3.89 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 3,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    iconBadge: {
        borderRadius: 4,
        paddingHorizontal: 3,
        paddingVertical: 6,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    iconEmoji: {
        fontSize: 18,
    },
    name: {
        flex: 1,
        fontSize: 16,
        fontWeight: 700,
        color: '#2F2F2F',
    },
    arrow: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#F3F3F3',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    checkBadge: {
        borderRadius: 40,
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    trackWrap: {
        height: 8,
        backgroundColor: '#EBF2FB',
        borderRadius: 40,
        overflow: 'hidden',
        marginBottom: 8,
    },
    fill: {
        height: '100%',
        borderRadius: 40,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amountText: {
        fontWeight: 700,
        fontSize: 16,
        color: '#2F2F2F',
    },
    amountSeparator: {
        fontWeight: 700,
        fontSize: 16,
        color: '#828282',
    },
    pctText: {
        fontWeight: 700,
        fontSize: 16,
        color: '#828282',
    },
    doneLabel: {
        fontSize: 16,
        color: '#828282',
        fontWeight: 700
    },
})

// ─── Page styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#C5E8D8',
    },
    bgImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '70%',
    },

    // Top overlay
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 6,
    },
    backBtn: {
        backgroundColor: '#2F2F2F',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    coinPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 8,
        gap: 4,
    },
    coinEmoji: {
        fontSize: 16,
    },
    coinText: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 20,
        fontWeight: 700,
        color: '#2F2F2F',
    },

    // Sheet
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 16,
    },
    handleWrap: {
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 4,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#D5D5D5',
    },

    // Sheet header
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 14,
        paddingTop: 6,
    },
    sheetTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sheetTitleEmoji: {
        fontSize: 20,
    },
    sheetTitle: {
        fontSize: 24,
        fontWeight: 700,
        color: '#2F2F2F',
    },
    addBtn: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#16AA75',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#005C49',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 3,
    },

    // Scroll
    scroll: {
        flex: 1,
        backgroundColor: '#EBF2FB',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 120
    },
    scrollContent: {
    },

    // Loading
    loadingWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Empty state
    emptyWrap: {
        alignItems: 'center',
        paddingTop: 40,
        gap: 10,
    },
    emptyEmoji: {
        fontSize: 44,
    },
    emptyTitle: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 17,
        color: '#2F2F2F',
    },
    emptyText: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
        color: '#828282',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },

    // Done section
    doneSection: {
        marginTop: 6,
    },
    doneSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        gap: 8,
        marginBottom: 16
    },
    doneCountBadge: {
        borderRadius: 4,
        paddingVertical: 3,
        paddingHorizontal: 5,
        backgroundColor: '#BFD0EA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    doneCountText: {
        fontWeight: 700,
        fontSize: 14,
        color: '#2F2F2F',
    },
    doneSectionTitle: {
        fontWeight: 700,
        fontSize: 20,
        color: '#2F2F2F',
    },
    IconContainer: {
        borderRadius: 4,
        padding: 4
    }
})

export default ChildGoalsPage
