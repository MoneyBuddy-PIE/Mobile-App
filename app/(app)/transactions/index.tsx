import {SafeAreaView, ScrollView, StyleSheet, RefreshControl, View, Text, TouchableOpacity} from 'react-native'
import {useEffect, useState} from 'react'
import { UserStorage } from '@/utils/storage'
import { SubAccount } from '@/types/Account';
import { Transaction } from '@/types/Transaction';
import { transactionService } from '@/services/transactionService';
import TransactionList from '@/components/TransactionList';
import { router } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";

const TransactionsPage = () => {
    const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false)


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
        loadData()
    }, [])

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                        <Ionicons name='arrow-back-sharp' size={24} color={"#FFFFFF"} />
                    </TouchableOpacity>
                    <View style={[{display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8}]}>
                        <View style={[{display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 8}]}>
                            <View style={[{borderRadius: 4, padding: 4, backgroundColor: "#E6E2FB"}]}><Ionicons name='wallet' size={20} color={"#846DED"} /></View>
                            <Text style={styles.headerTitle}>Mes transactions</Text>
                        </View>
                        <Text style={styles.headerText}>{new Date().toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric"})}</Text>
                    </View>
                </View>
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C5CE7" />}
            >

                {/* Content */}
                <View style={[styles.contentContainer]}>
                    <TransactionList transactions={transactions} />
                </View>

            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    // Container
	container: {
		flex: 1,
        backgroundColor: "#FFFFFF",
	},
	content: {
		flex: 1,
	},
    // Header
    header: {
		flexDirection: "row",
        gap: 16,
		alignItems: "center",
		paddingHorizontal: 20,
		paddingTop: 10,
		paddingBottom: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#BFD0EA",
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: "700",
		color: "#2F2F2F",
	},
    headerText: {
		fontSize: 14,
		fontWeight: "700",
		color: "#828282",
	},
	closeButton: {
		backgroundColor: "#2F2F2F",
        padding: 12,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	closeButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
    //Content
    contentContainer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: "#ecf2fb",
    }
})

export default TransactionsPage