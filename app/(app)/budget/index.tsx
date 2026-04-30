
import ButtonsActionChildren from "@/components/ButtonsActionChildren";
import TransactionList from "@/components/TransactionList";
import { transactionService } from "@/services/transactionService";
import { SubAccount } from "@/types/Account";
import { Transaction } from "@/types/Transaction";
import { UserStorage } from "@/utils/storage";
import { useEffect, useState } from "react";
import { StyleSheet, SafeAreaView, ScrollView, View, ActivityIndicator, Text, RefreshControl, Image, TouchableOpacity } from "react-native"
import { Ionicons } from '@expo/vector-icons'
import { router } from "expo-router";


const BudgetPage = () => {
    const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async() => {
        try {
			const accountData = await UserStorage.getSubAccount();
			setSubAccount(accountData);

            if (accountData)
                setTransactions(await transactionService.getTransactions({}))

		} catch (error) {
			console.error("Error loading chapters:", error);
		} finally {
			setLoading(false);
		}
    } 

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

    if (loading || !subAccount) {
        return (
			<View style={[styles.container, styles.center]}>
				<ActivityIndicator size="large" color="#6C5CE7" />
				<Text style={styles.loadingText}>Chargement...</Text>
			</View>
		);
    }


    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
				style={styles.content}
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C5CE7" />}
			>
                {/* Content - Bank card */}
                <View style={styles.bankCardContainer}>
                    <View style={styles.bankCardHalf}>
                        <View style={styles.column}>
                            <Text style={styles.bankCardTitle}>Solde disponible</Text>
                            <Text style={styles.bankCardSubTitle}>{Number(subAccount?.money)?.toFixed(2)}€</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.bankCardText}>{subAccount?.name}</Text>
                            <Text style={styles.bankCardText}>••••  ••••  ••••  CASH</Text>
                        </View>
                    </View>
                    <Image source={require('@/assets/images/reminder/image_8.png')} />
                </View>

                {/* Content - Buttons */}
                <View style={styles.buttonsContainer}>
                    <ButtonsActionChildren subAccount={subAccount} labelPosition="outside" addScan/>
                </View>

                {/* Content - Buttons bis */}
                <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between", marginTop: 32,}}>
                    <TouchableOpacity
                        onPress={() => {}}
                        style={styles.cardButtonContainer}
                    >
                        <View style={[styles.cardButtonRow, {gap: 4}]}>
                            <View style={[styles.cardButtonIconContainer, {backgroundColor: "#E6E2FB"}]}>
                                <Ionicons name="wallet" size={20} color={"#846DED"}/>
                            </View>
                            <Text style={styles.cardButtonTitle}>Dépenses</Text>
                        </View>
                        <View style={[styles.cardButtonRow, {justifyContent: "space-between"}]}>
                            <Text style={styles.cardButtonText}>{Number(subAccount.money).toFixed(2)}€</Text>
                            <View style={[styles.cardButtonIconContainer, {backgroundColor: "#EAEAEA"}]}>
                                <Ionicons name="arrow-back" size={20} color={"#2F2F2F"} style={{transform: [{rotate: "180deg"}]}} />
                            </View>
                        </View>
                        <Text style={styles.cardButtonSubText}>{new Date().toLocaleString("fr-FR", {month: "long", year: "numeric"})}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push('goals/child')}
                        style={styles.cardButtonContainer}
                    >
                        <View style={[styles.cardButtonRow, {gap: 4}]}>
                            <View style={[styles.cardButtonIconContainer, {backgroundColor: "#FEA0BA66"}]}>
                                <Ionicons name="wallet" size={20} color={"#FD618C"}/>
                            </View>
                            <Text style={styles.cardButtonTitle}>Objectifs</Text>
                        </View>
                        <View style={[styles.cardButtonRow, {justifyContent: "space-between"}]}>
                            <Text style={styles.cardButtonText}>{Number(subAccount.money).toFixed(2)}€</Text>
                            <View style={[styles.cardButtonIconContainer, {backgroundColor: "#EAEAEA"}]}>
                                <Ionicons name="arrow-back" size={20} color={"#2F2F2F"} style={{transform: [{rotate: "180deg"}]}} />
                            </View>
                        </View>
                        <Text style={styles.cardButtonSubText}>Voir détails</Text>
                    </TouchableOpacity>
                </View>

                {/* Content - Transaction */}
                <View style={{display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12, marginVertical: 32,}}>
                    <Text style={styles.title}>Dernières transactions</Text>
                    <View style={[{width: "100%"}]}>
                        <TransactionList transactions={transactions} lilList/>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    // Generic
    column: {
        display: "flex",
        flexDirection: "column",
        gap: 8
    },
    title: {
        fontWeight: 700,
        color: "#2F2F2F",
        fontSize: 20
    },  
    // Container
	container: {
		flex: 1,
		backgroundColor: "#ecf2fb"
	},
	content: {
		flex: 1,
        paddingHorizontal: 20,
	},
    // Loading
    center: {
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 12,
		fontSize: 16,
		color: "#666",
	},
    //Content - Bank card
    bankCardContainer: {
        marginTop: 12,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        backgroundColor: "#846DED",
        padding: 24,
        borderRadius: 12,
        shadowColor: "#BFD0EA",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    bankCardHalf: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 16
    },
    bankCardTitle: {
        fontWeight: 700,
        fontSize: 20,
        color: "#FFFFFF",
    },
    bankCardSubTitle: {
        fontWeight: 800,
        fontSize: 40,
        color: "#FFFFFF",
    },
    bankCardText: {
        fontWeight: 400,
        fontSize: 16,
        color: "#FFFFFF",
    },
    // Content - Buttons
    buttonsContainer: {
        marginTop: 32,
        backgroundColor: "#D1DEF1",
        borderRadius: 8,
        padding: 12
    },
    // Content - card
    cardButtonContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 8,
        paddingHorizontal: 8,
        paddingTop: 8,
        paddingBottom: 16,
        borderRadius: 4,
        backgroundColor: "#FFFFFF",
        shadowColor: "#BFD0EA",
        shadowOffset: { width: 0, height: 3.89 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
        width: "48%"
    },
    cardButtonRow: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        width: "100%"
    },
    cardButtonIconContainer: {
        borderRadius: 4,
        padding: 4
    },
    cardButtonTitle: {
        fontWeight: 700,
        fontSize: 14,
        color: "#2F2F2F"
    },
    cardButtonText: {
        fontWeight: 800,
        fontSize: 24,
        color: "#2F2F2F"
    },
    cardButtonSubText: {
        fontWeight: 400,
        fontSize: 14,
        color: "#2F2F2F",
        textTransform: "capitalize"
    },
})

export default BudgetPage