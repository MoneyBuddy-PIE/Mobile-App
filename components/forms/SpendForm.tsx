import getIconFromCategory, { categories } from "@/utils/fn/getIconFromCategory"
import { useState } from "react"
import { SafeAreaView, ScrollView, StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import DatePickerInput from "../DatePickerInput"
import { moneyService } from "@/services/moneyService"


type IProps = {
    subAccountId: string
}

const SpendForm = ({subAccountId}: IProps ) => {
    const [step, setStep] = useState<"Form" | "ValidateForm">("Form")

    const [amount, setAmount] = useState<string>("0.00")
    const [category, setCategory] = useState<string>(categories[0].value)
    const [date, setDate] = useState<Date | null>(null)
    const [details, setDetails] = useState<string>("")

    const [loading, setLoading] = useState<boolean>(false)

    const handleForm = async() => {
        setLoading(true)
        try {
            await moneyService.addMoney({subAccountId, amount: Number(amount), description: details}, "false")
            Alert.alert("Succès", "Dépense enregistré !", [{ text: "OK" }]);
        } catch (error: any){
            console.error("Error creating task:", error);
			const errorMessage = error?.response?.data?.message || "Impossible d'enregistrer la dépense";
			Alert.alert("Erreur", errorMessage);
        } finally {
            setLoading(false)
        }
    }


    return (
        <SafeAreaView style={[styles.container, {backgroundColor: step === "Form" ? "#FFFFFF" : "#ecf2fb"}]}>
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >

                {/* Content - First Step*/}
                { step === "Form" && (
                <View>
                    {/* Montant affiché */}
                    <View style={styles.customAmountContainer}>
                        <TextInput
                            style={[Number(amount) > 0 ? styles.customAmountInputSelected : styles.customAmountInputNonSelected]}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="decimal-pad"
                            autoFocus
                        />
                        <Text style={styles.customAmountInputSelected}>€</Text>
                    </View>

                    {/* Expense type */}        
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Quel type de dépense est-ce-que c’est ?</Text>
                        <View style={{display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 12}}>
                            {categories.map((cat, index) => {
                                const selected = cat.value === category
                                return (
                                    <TouchableOpacity
                                        key={`${cat.value}-${index}`}
                                        onPress={() => setCategory(cat.value)}
                                        style={[selected ? styles.categoryContainerSelected : styles.categoryContainer, {width: "22%"}]}
                                    >
                                        <Ionicons name={getIconFromCategory(cat.value) as keyof typeof Ionicons.glyphMap} size={24} color={selected ? "#2F2F2F" : "#6E6E6E"} />
                                        <Text style={[selected ? styles.categoryLabelSelected : styles.categoryLabel]}>{cat.label}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>

                    {/* Date Input */}
                    <View style={styles.section}>
                        <DatePickerInput 
                            value={date}
                            onChange={setDate}
                            placeholder="Choisir une date de début"
                        />
                    </View>

                
                    {/* Date Input */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Détails</Text>
                        <View style={styles.inputContainer}> 
                            <TextInput
                                placeholder="Ajoute un petit détail si tu veux !"
                                autoCapitalize="sentences"
                                value={details}
                                onChangeText={setDetails}
                                style={styles.textInput}
                            />
                            <Ionicons name="wallet" size={18} color="#979797" />
                        </View>
                    </View>
                    
                    {/* Footer - Button */}
                    <View style={[styles.footer]}>
                        <TouchableOpacity
                            onPress={() => {Boolean(Number(amount) && category && date) && setStep('ValidateForm')}}
                            style={[styles.button, Boolean(Number(amount) && category && date) ? styles.buttonSelected : {backgroundColor: "#D5D5D5"}, { width: "100%"}]}
                            disabled={!Boolean(Number(amount) && category && date)}
                        >
                            <Text style={[styles.buttonText, {color: Boolean(Number(amount) && category && date) ? "#FFFFFF" : "#828282"} ]}>Enregistrer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                )}

                {/* Content - First Step*/}
                { step === "ValidateForm" && (
                <View>
                    {/* Summary */}
                    <View>

                    </View>

                    {/* Footer - Button */}
                    <View style={[styles.footer]}>
                        <TouchableOpacity
                            onPress={() => {setStep("Form")}}
                            style={[styles.button, styles.buttonBack, {width: "24%"}]}
                        >
                            <Ionicons name="arrow-back" color={"#2F2F2F"} size={16}/>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {handleForm()}}
                            style={[styles.button, styles.buttonSelected, {width: "74%"} ]}
                            disabled={!Boolean(Number(amount) && category && date)}
                        >
                            <Text style={[styles.buttonText, {color: "#FFFFFF"} ]}>Valider</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                )}

            </ScrollView>
        </SafeAreaView>

    )
}

const styles = StyleSheet.create({
    // General
    section: {
        marginTop: 24,
        display: "flex",
        flexDirection: "column",
        gap: 8,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: "400",
        color: "#2F2F2F",
        marginBottom: 12,
    },
    // Container
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
        paddingHorizontal: 20
	},
    // Content - Amount Input
	customAmountContainer: {
        display: "flex",
		flexDirection: "row",
        justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#EBF2FB",
		borderRadius: 4,
        paddingVertical: 12,        
		marginTop: 16,
	},
	customAmountInputNonSelected: {
		fontSize: 40,
		color: "#979797",
        fontWeight: 800
	},
	customAmountInputSelected: {
		fontSize: 40,
		color: "#2F2F2F",
		fontWeight: 800,
	},
    // Content - Expense type
    categoryContainer: {
        padding: 8,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: "#D5D5D5",
        backgroundColor: "#EAEAEA",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    categoryContainerSelected: {
        padding: 8,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: "#846DED",
        backgroundColor: "#E6E2FB",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    categoryLabel: {
        color: "#6E6E6E",
        fontWeight: 400,
        fontSize: 12
    },
    categoryLabelSelected: {
        color: "#2F2F2F",
        fontWeight: 600,
        fontSize: 12
    },
    // Input
    inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#D5D5D5",
		paddingHorizontal: 16,
	},
    textInput: {
		flex: 1,
		fontSize: 16,
		color: "#333",
		paddingVertical: 16,
	},
    // Footer
    footer: {
		paddingBottom: 20,
		paddingTop: 16,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%"
	},
    button: {
        paddingVertical: 20,
        paddingHorizontal: 24,
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    buttonSelected: {
        backgroundColor: "#16AA75",
        shadowColor: "#005C49",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
    },
    buttonBack: {
        backgroundColor: "#FFFFFF",
        shadowColor: "#EBF2FB",
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
        fontSize: 20
    }
})



export default SpendForm