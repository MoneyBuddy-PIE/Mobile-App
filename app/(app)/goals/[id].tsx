import { Goal } from "@/types/Goal";
import { useEffect, useState } from "react";
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import CircularProgress from "@/components/CircualProgress";
import { UserStorage } from "@/utils/storage";
import { SubAccount } from "@/types/Account";
import { logger } from "@/utils/logger";
import Loader from "@/components/Loader";
import TransactionList from "@/components/TransactionList";
import { Transaction } from "@/types/Transaction";
import { transactionService } from "@/services/transactionService";

const ChildrenProgressBar = ({goal}: {goal: Goal}) => {
    const { amount } = goal
    const depostitAmount = (amount * goal.progression) / 100
    return (
        <View style={{flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 16}}>
            <View style={{paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, backgroundColor: "#75B7FF"}}>
                <Text style={{fontSize: 24, fontWeight: 700}}>{goal.emoji ?? '🧱'}</Text>
            </View>
            <Text style={{fontWeight: 800, fontSize: 48, color: "#2F2F2F"}}>{depostitAmount.toFixed(2)}€</Text>
            <Text style={{fontWeight: 700, fontSize: 16, color: "#2F2F2F"}}>{goal.name}</Text>
            <Text  style={{fontWeight: 800, fontSize: 24, color: "#2F2F2F"}}>{amount.toFixed(2)}€</Text>
            <Text  style={{fontWeight: 400, fontSize: 14, color: "#2F2F2F"}}>
                {depostitAmount === amount ? 'Objectif atteint 🎉' : 'restants'}
            </Text>
        </View>
    )
}

export default function GoalDetailScreen() {
    const params = useLocalSearchParams<{ goal: string; childId: string; childName: string }>();
    const [goal, setGoal] = useState<Goal>(() => JSON.parse(params.goal ?? "{}") as Goal);

    const [loading, setloading] = useState<boolean>(true)
    const [subAccount, setSubAccount] = useState<SubAccount | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])

    useEffect(() => {loadData()}, [])

    const loadData = async () => {
        try {
            setSubAccount(await UserStorage.getSubAccount())
            setTransactions(await transactionService.getTransactionByGoaldId(goal.id))
        } catch (error) {
            logger.warn("Error loading Data", error)
        } finally {
            setloading(false)
        }
    }

    if (loading) 
        return <Loader />

    if (!subAccount?.id) return router.back()

    const depostitAmount = (goal.amount * goal.progression) / 100

    return (
        <SafeAreaView style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={18} color="#fff" />
                </TouchableOpacity>
                <View style={styles.coinPill}>
                    <Text style={styles.coinText}>🟡 {subAccount?.coin ?? 0}</Text>
                </View>
            </View>

            {/* Content */}
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Hero card */}
                <View style={[styles.heroCard, styles.margin]}>
                    <CircularProgress
                        progress={goal.progression > 0 ? goal.progression : 0.1}
                        size={342}
                        strokeWidth={14}
                        color={"#75B7FF"}
                        trackColor="#FFFFFF"
                    >
                        <ChildrenProgressBar goal={goal}/>
                    </CircularProgress>
                </View>

                {/* Buttons */}
                <View style={[styles.margin, {flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%"}]}>
                    <TouchableOpacity
                        style={[styles.button, {backgroundColor: "#16AA75", shadowColor: "#005C49"}]}
                        onPress={() => {}}
                    >
                        <Ionicons name="wallet-outline" size={32} color={"#FFFFFF"}/>
                        <Text style={styles.buttonText}>Ajouter</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, depostitAmount === 0 ? {backgroundColor: "#ACACAC", shadowColor: "#6E6E6E"} : {backgroundColor: "#846DED", shadowColor: "#4E31CF"}]}
                        onPress={() => {}}
                        disabled={depostitAmount === 0}
                    >
                        <Ionicons name="remove" size={32} color={"#FFFFFF"}/>
                        <Text style={styles.buttonText}>Retirer</Text>
                    </TouchableOpacity>
                </View>
                
                {/* Update Container */}
                <TouchableOpacity 
                    style={[styles.updateContainer, styles.margin]}
                    onPress={() => {}}
                >
                    <View style={{backgroundColor: "#9BFFE24D", padding: 12, borderRadius: 4}}>
                        <Ionicons name="star" color={"#16AA75"} size={20}/>
                    </View>
                    <View>
                        <Text style={{fontWeight: 700, fontSize: 14}}>Mettre à jour l’objectif</Text>
                        <Text style={{fontWeight: 400, fontSize: 14}}>Modifier le montant ou supprimer</Text>
                    </View>
                    <View style={{backgroundColor: "#EAEAEA", padding: 12,  borderRadius: 4}}>
                        <Ionicons name="arrow-back" color={"#828282"} size={20}/>
                    </View>
                </TouchableOpacity>

                {/* Transactions Container */}
                <View style={[styles.margin]}>
                    <Text style={{fontWeight: 700, fontSize: 20, marginBottom: 12}}>Dernières transactions</Text>
                    {transactions?.length > 0
                        ? <TransactionList transactions={transactions} />
                        :   <View
                                style={{backgroundColor: "#BFD0EA99", borderRadius: 4, padding: 12, flexDirection: "column", gap: 8, justifyContent: "center", alignItems: "center"}}
                            >
                                <Image
                                    source={require('@/assets/images/pig.png')}
                                    resizeMode="cover"
                                />
                                <Text style={{fontWeight: 700, fontSize: 16, textAlign: "center"}}>Prêt à commencer ?</Text>
                                <Text style={{fontWeight: 400, fontSize: 14, textAlign: "center"}}>Commence à mettre de côté pour te rapprocher de ton objectif !</Text>
                            </View>
                    }
                </View>

                
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // Page
    container: {
        flex: 1,
        backgroundColor: "#EBF2FB",
    },
    margin: {
        marginBottom: 24
    },
    // Header
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        backgroundColor: "#2F2F2F",
        borderRadius: 8,
        padding: 12,
    },
    coinPill: {
        backgroundColor: "#FFFFFF",
        padding: 8,
        borderRadius: 8,
    },
    coinText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#2F2F2F",
    },
    // Content
    scroll: {
        flex: 1,
        padding: 20,
    },
    // Hero card
    heroCard: {
        alignItems: "center",
    },
    // Buttons
    button: {
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        width: "47%",
        shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
    },
    buttonText: {
        fontWeight: 700,
        fontSize: 16,
        color: "#FFFFFF"
    },
    // Update Container
    updateContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 4,
        padding: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
        alignItems: "center"
    },
});