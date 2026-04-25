import { goalsService } from "@/services/goalService";
import { Ionicons } from "@expo/vector-icons"
import { Goal, GoalStatus } from "@/types/Goal";
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, RefreshControl, View, Text, TouchableOpacity, ActivityIndicator } from "react-native"
import { router, useLocalSearchParams } from "expo-router";
import GoalCard from "@/components/GoalCard";

const GoalPage = () => {
    const { childId, childName } = useLocalSearchParams<{ childId: string; childName: string }>()

    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true)
    const [goals, setGoals] = useState<Goal[]>([])

    const activeGoals = goals.filter((g) => g.goalStatus === GoalStatus.ACTIVATED)
    const doneGoals = goals.filter((g) => g.goalStatus === GoalStatus.DONE)
    const usedGoals = goals.filter((g) => g.goalStatus === GoalStatus.USED)

    const totalSaved = goals
        .filter((g) => g.goalStatus !== GoalStatus.USED)
        .reduce((sum, g) => sum + (g.depositStatement ?? 0), 0)

    const loadData = async () => {
        if (!childId) return
        try {
            const data = await goalsService.getAllGoals({ childId })
            setGoals(data)
        } catch (error) {
            console.error("Erreur chargement goals:", error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const onRefresh = () => {
        setRefreshing(true)
        loadData()
    }

    useEffect(() => {
        loadData()
    }, [])

    function navigateToDetail(goal: Goal) {
        router.push({
            pathname: "/(app)/goals/[id]",
            params: {
                id: goal.id,
                goal: JSON.stringify(goal),
                childId,
                childName,
            },
        })
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#846DED" />
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={18} color="#fff" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Épargne de {childName}</Text>
                    <Text style={styles.amountText}>{totalSaved.toFixed(2)}€</Text>
                    <Text style={styles.amountSubtitle}>en cours d'épargne</Text>
                </View>
            </View>

            {/* Hero */}
            <View style={styles.heroContainer}>
                {goals.length > 0 ? (
                    <Text style={styles.heroText}>
                        {childName} a {activeGoals.length} objectif{activeGoals.length > 1 ? "s" : ""} en cours 🚀
                    </Text>
                ) : (
                    <Text style={styles.heroText}>Aidez {childName} à économiser en créant un objectif 🐷</Text>
                )}
            </View>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#846DED" />
                }
            >
                {goals.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>🎯</Text>
                        <Text style={styles.emptyTitle}>Aucun objectif</Text>
                        <Text style={styles.emptySubtitle}>
                            Créez un objectif pour aider {childName} à épargner vers un but précis.
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Objectifs actifs */}
                        {activeGoals.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>En cours</Text>
                                <View style={styles.goalCardList}>
                                    {activeGoals.map((goal) => (
                                        <GoalCard
                                            key={goal.id}
                                            goal={goal}
                                            onPress={() => navigateToDetail(goal)}
                                        />
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Objectifs atteints */}
                        {doneGoals.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Objectifs atteints 🎉</Text>
                                <View style={styles.goalCardList}>
                                    {doneGoals.map((goal) => (
                                        <GoalCard
                                            key={goal.id}
                                            goal={goal}
                                            onPress={() => navigateToDetail(goal)}
                                        />
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Objectifs utilisés */}
                        {usedGoals.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Utilisés</Text>
                                <View style={styles.goalCardList}>
                                    {usedGoals.map((goal) => (
                                        <GoalCard
                                            key={goal.id}
                                            goal={goal}
                                            onPress={() => navigateToDetail(goal)}
                                        />
                                    ))}
                                </View>
                            </View>
                        )}
                    </>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f9fa",
	},
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    // Header
    header: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
        gap: 14,
    },
    backButton: {
        backgroundColor: "#2F2F2F",
        borderRadius: 8,
        padding: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 4,
    },
    headerTitle: {
        fontFamily: "DMSans_700Bold",
        fontSize: 18,
        color: "#2F2F2F",
    },
    amountText: {
        fontSize: 40,
        fontFamily: "DMSans_700Bold",
        color: "#2F2F2F",
        lineHeight: 52,
    },
    amountSubtitle: {
        fontFamily: "DMSans_400Regular",
        fontSize: 14,
        color: "#828282",
    },
    // Hero
    heroContainer: {
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    heroText: {
        fontFamily: "DMSans_400Regular",
        fontSize: 14,
        color: "#2F2F2F",
    },
    // ScrollView
    scrollView: {
        backgroundColor: "#EBF2FB",
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    // Sections
    section: {
        marginTop: 16,
    },
    sectionTitle: {
        fontFamily: "DMSans_700Bold",
        fontSize: 14,
        color: "#828282",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 10,
    },
    goalCardList: {
        flexDirection: "column",
        gap: 12,
    },
    // Empty state
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 60,
        paddingHorizontal: 32,
        gap: 12,
    },
    emptyEmoji: {
        fontSize: 48,
    },
    emptyTitle: {
        fontFamily: "DMSans_700Bold",
        fontSize: 18,
        color: "#2F2F2F",
    },
    emptySubtitle: {
        fontFamily: "DMSans_400Regular",
        fontSize: 14,
        color: "#828282",
        textAlign: "center",
        lineHeight: 20,
    },
    // FAB
    fab: {
        position: "absolute",
        bottom: 28,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#846DED",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#4E31CF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
})

export default GoalPage
