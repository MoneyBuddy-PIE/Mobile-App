import { goalsService } from "@/services/goalService";
import { Ionicons } from "@expo/vector-icons"
import { Goal } from "@/types/Goal";
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, RefreshControl, View, Text, TouchableOpacity, ActivityIndicator } from "react-native"
import { router, useLocalSearchParams } from "expo-router";
import GoalCard from "@/components/GoalCard";

const GoalPage = () => {
    const { childId, childName } = useLocalSearchParams<{ childId: string; childName: string }>()
    
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false)
    
    const [goals, setGoals] = useState<Goal[]>([])

    const totalAmount = goals
    .reduce((sum, i) => sum + (i.amount ?? 0), 0)

    const loadData = async () => {
        if (!childId) return
        try {
            const goals = await goalsService.getAllGoals({ childId })
            setGoals(goals)
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
                <Text style={styles.headerTitle}>Épargne de {childName}</Text>
                <Text style={styles.amountText}>
                    {totalAmount.toFixed(2)}€
                </Text>
            </View>

            {/* Hero */}
            <View style={styles.heroContainer}>
                <Text>{childName} a économisé {totalAmount.toFixed(2)} ce mois-ci ! 🥳</Text>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#846DED" />
                }
            >
                {goals?.length > 0 ? 
                    <View style={styles.goalCardList}>
                        {goals.map((goal) => <View key={goal.id} ><GoalCard goal={goal} /></View>) }
                    </View>:
                    <View>
                        <Text>Aidez-le à comprendre comment son argent grandit en créant un objectif.</Text>
                    </View>
                }
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
        flexDirection: "column",
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
    },
    headerTitle: {
        fontFamily: "DMSans_700Bold",
        fontSize: 18,
        color: "#2F2F2F",
    },

    // ScrollView
    scrollView: {
        flex: 1,
        backgroundColor: "#ECF2FB",
        paddingHorizontal: 20,
        paddingVertical: 10
    },

    // Amount Section
    amountText: {
        fontSize: 40,
        color: "#2F2F2F",
        lineHeight: 56,
    },
    amountSubtitle: {
        fontFamily: "DMSans_400Regular",
        fontSize: 14,
        color: "#828282",
        marginTop: 4,
    },

    // Hero Section
    heroContainer: {
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },

    //GoalCard
    goalCardList: {
        display: "flex",
        flexDirection: "column",
        gap: 15
    },

    //No Goals
    noGoalsContainer: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
    }
})

export default GoalPage