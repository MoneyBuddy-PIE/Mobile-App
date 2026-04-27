import { Transaction, TransactionType } from "@/types/Transaction"
import { StyleSheet, FlatList, View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const GetIcon = ({transactionType}: {transactionType: TransactionType}) => {
    const backgroundColor = transactionType === TransactionType.CREDIT ? "#9BFFE2" : "#FD618C"
    const iconColor = transactionType === TransactionType.CREDIT ? "#16AA75" : "#D1325E"

    return (
        <View style={[styles.iconContainer, {backgroundColor}]}>
            <Ionicons name={transactionType === TransactionType.CREDIT ? "wallet-outline" : "wallet-sharp"} color={iconColor} size={24}/>
        </View>
    )
}

const ButtonFullList = () => {

    return (
        <TouchableOpacity
            onPress={() => router.push("/(app)/transactions")}
            style={styles.buttonContainer}
        >
            <Text style={styles.buttonTitle}>Voir tout</Text>
            <Ionicons name="arrow-forward" color={"#FFFFFF"} size={24}/>
        </TouchableOpacity>
    )
}


type IProps = {
    transactions: Transaction[]
    lilList?: boolean
}

const TransactionList = ({transactions, lilList = false}: IProps) => {
    const transactionList = lilList ? transactions.slice(0, 4) : transactions

    return (
        <FlatList
            scrollEnabled={false}
            data={transactionList}
            keyExtractor={transaction => transaction.id}
            renderItem={({item, index}) => {
                const isAdd = item.type === TransactionType.CREDIT
                const radius = lilList && index === 0 
                    ? {borderTopRightRadius: 8, borderTopLeftRadius: 8} 
                    : lilList && transactionList?.length - 1 === index? {borderBottomRightRadius: 8, borderBottomLeftRadius: 8} 
                    : lilList ? {} : {borderRadius: 8, marginTop: 8}

                return (
                    <View style={[styles.transactionFullContainer, radius]}>
                        <View style={styles.transactionContainer}>
                            <View style={{display: "flex", flexDirection: "row", alignItems: "center", gap: 8}}>
                                <GetIcon transactionType={item.type}/>
                                <View style={{display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4}}>
                                    <Text style={[styles.transactionTitle, {fontSize: 16, color: "2F2F2F"}]}>{item.description.substring(0, 18)}</Text>
                                    <Text style={styles.transactionText}>{new Date(item.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric"})}</Text>
                                </View>
                            </View>
                            <View>
                                <Text  style={[styles.transactionTitle, {fontSize: 20, color: isAdd ? "#16AA75" : "#FD618C"}]}>
                                    {isAdd ? "+" : "-"}{Number(item.amount).toFixed(2)}€
                                </Text>
                            </View>
                        </View>
                        {lilList && transactionList?.length - 1 === index && <ButtonFullList />}
                    </View>
                )
            }}
        />
    )
}

const styles = StyleSheet.create({
    transactionFullContainer: {
        backgroundColor: "#FFFFFF",
        padding: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#EBF2FB",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 24,
        width: "100%"
    },
    transactionContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        alignItems: "center",
        width: "100%"
    },
    transactionTitle: {
        fontWeight: 700,
    },
    transactionText: {
        fontWeight: 400,
        fontSize: 14,
        color: "#6E6E6E"
    },
    iconContainer: {
        borderRadius: 4,
        padding: 4
    },
    buttonContainer: {
        backgroundColor: "#ACACAC",
        padding: 12,
        borderRadius: 12,
        display: "flex",
        flexDirection: "row",
        gap: 12,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#6E6E6E",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
        width: "100%"
    },
    buttonTitle: {
        fontWeight: 700,
        fontSize: 16,
        color: "#FFFFFF"
    },
})

export default TransactionList