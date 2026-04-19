import { AllowanceFrequency, Allowance } from "@/types/Allowance"
import { WeekDay } from "@/types/Task"
import { useEffect, useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native"
import { TextInput } from "react-native-gesture-handler"
import { router } from "expo-router"
import { SubAccount } from "@/types/Account"
import { userService } from "@/services/userService"
import { allowanceService } from "@/services/allowanceService"
import DatePickerInput, { formatDateFR } from "@/components/DatePickerInput"

enum FormSteps {
    DATE_AND_FREQUENCY = "DATE_AND_FREQUENCY",
    AMOUNT = "AMOUNT",
    SUMMARY = "SUMMARY",
}

const WEEKDAY_FROM_JS: WeekDay[] = [
    WeekDay.SUNDAY,
    WeekDay.MONDAY,
    WeekDay.TUESDAY,
    WeekDay.WEDNESDAY,
    WeekDay.THURSDAY,
    WeekDay.FRIDAY,
    WeekDay.SATURDAY,
]

const formatDateForAPI = (date: Date): string => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
}

const parseDateFromAPI = (dateStr: string): Date => {
    const [y, m, d] = dateStr.split("-").map(Number)
    return new Date(y, m - 1, d)
}

const guessAllowanceLabel = (frequency: AllowanceFrequency | null) => {
    switch (frequency) {
        case AllowanceFrequency.WEEKLY:   return "Semaine"
        case AllowanceFrequency.BIWEEKLY: return "Quinzaine (15 jours)"
        case AllowanceFrequency.MONTHLY:  return "Mois"
        default: return null
    }
}

type IProps = {
    childId: string
}

const AllowanceForm = ({ childId }: IProps) => {
    const [formStep, setFormStep] = useState<FormSteps>(FormSteps.DATE_AND_FREQUENCY)
    const [showFrequency, setShowFrequency] = useState<boolean>(false)

    const [child, setChild] = useState<SubAccount | null>(null)
    const [existingAllowance, setExistingAllowance] = useState<Allowance | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [amount, setAmount] = useState<string>("")
    const [date, setDate] = useState<Date | null>(null)
    const [frequency, setFrequency] = useState<AllowanceFrequency | null>(null)

    const isEditMode = existingAllowance !== null

    const loadData = async () => {
        try {
            const [account, existing] = await Promise.all([
                userService.getAccount(),
                allowanceService.getByChildId(childId),
            ])

            setChild(account.subAccounts.find((s) => s.id === childId) ?? null)

            if (existing) {
                setExistingAllowance(existing)
                setFrequency(existing.frequency)
                setAmount(existing.amount.toString())
                setDate(parseDateFromAPI(existing.startDate))
            }
        } catch {
            router.back()
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleSubmit = async () => {
        if (!date || !frequency) return
        setSubmitting(true)

        const weeklyDay =
            frequency === AllowanceFrequency.WEEKLY
                ? WEEKDAY_FROM_JS[date.getDay()]
                : undefined

        try {
            if (isEditMode && existingAllowance) {
                await allowanceService.update(existingAllowance.id, {
                    frequency,
                    amount: parseFloat(amount),
                    startDate: formatDateForAPI(date),
                    active: true,
                    ...(weeklyDay && { weeklyDay, weeklyDayValid: true }),
                })
            } else {
                await allowanceService.create({
                    subAccountIdChild: childId,
                    frequency,
                    amount: parseFloat(amount),
                    active: true,
                    startDate: formatDateForAPI(date),
                    ...(weeklyDay && { weeklyDay }),
                })
            }
            router.back()
        } catch (error: any) {
            Alert.alert(
                "Erreur",
                error?.response?.data?.message ?? "Impossible de sauvegarder l'argent de poche."
            )
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#846DED" />
            </View>
        )
    }

    return (
        <ScrollView style={{ flex: 1 }}>
            <View style={styles.contentSetup}>

                {/* ── Étape 1 : Fréquence + Date ── */}
                {formStep === FormSteps.DATE_AND_FREQUENCY && (
                    <View>
                        <Text style={styles.title}>
                            À quelle fréquence souhaitez-vous verser l'argent de poche de {child?.name} ?
                        </Text>

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Chaque</Text>

                            <TouchableOpacity
                                onPress={() => setShowFrequency(!showFrequency)}
                                style={frequency ? styles.inputContainerSelectedGreen : styles.inputContainer}
                            >
                                <Text style={styles.textInput}>
                                    {guessAllowanceLabel(frequency) ?? "Choisir une fréquence"}
                                </Text>
                                {frequency
                                    ? <Ionicons name="checkmark-outline" size={18} color="#16AA75" />
                                    : <Ionicons
                                        name="arrow-back"
                                        size={18}
                                        color="#D5D5D5"
                                        style={{ transform: [{ rotate: showFrequency ? "90deg" : "-90deg" }] }}
                                    />
                                }
                            </TouchableOpacity>

                            {showFrequency && (
                                <View style={styles.frequencyContainer}>
                                    {Object.values(AllowanceFrequency).map((v) => (
                                        <TouchableOpacity
                                            key={v}
                                            style={[
                                                styles.frequencyOption,
                                                frequency === v && styles.frequencyOptionSelected,
                                            ]}
                                            onPress={() => {
                                                setShowFrequency(false)
                                                setFrequency(v)
                                            }}
                                        >
                                            <Text style={styles.textInput}>{guessAllowanceLabel(v)}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <Text style={styles.sectionLabel}>À partir du</Text>
                            <DatePickerInput
                                value={date}
                                onChange={setDate}
                                placeholder="Choisir une date de début"
                            />
                        </View>

                        <AllowanceButton
                            textButton="Continuer"
                            onNext={() => setFormStep(FormSteps.AMOUNT)}
                            disabled={!frequency || !date}
                        />
                    </View>
                )}

                {/* ── Étape 2 : Montant ── */}
                {formStep === FormSteps.AMOUNT && (
                    <View>
                        <Text style={styles.title}>
                            Combien est-ce que {child?.name} va recevoir ?
                        </Text>

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Chaque {guessAllowanceLabel(frequency)}</Text>
                            <View style={Number(amount) > 0 ? styles.inputContainerSelectedGreen : styles.inputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="0.00€"
                                    value={amount}
                                    onChangeText={setAmount}
                                    keyboardType="decimal-pad"
                                    autoFocus
                                />
                                {Number(amount) > 0 && (
                                    <Ionicons name="checkmark-outline" size={18} color="#16AA75" />
                                )}
                            </View>
                        </View>

                        <AllowanceButton
                            textButton="Continuer"
                            onNext={() => setFormStep(FormSteps.SUMMARY)}
                            onBack={() => setFormStep(FormSteps.DATE_AND_FREQUENCY)}
                            disabled={Number(amount) <= 0}
                        />
                    </View>
                )}

                {/* ── Étape 3 : Récapitulatif ── */}
                {formStep === FormSteps.SUMMARY && (
                    <View>
                        <Text style={styles.title}>Tout est prêt !</Text>

                        <View style={styles.summaryContent}>
                            <View style={styles.summaryContent}>
                                <View style={styles.summaryContainer}>
                                    <Text style={styles.summaryTextLight}>Fréquence</Text>
                                    <Text style={[styles.summaryText, { width: "60%" }]}>
                                        Chaque {guessAllowanceLabel(frequency)}
                                    </Text>
                                </View>
                                <View style={styles.summaryContainer}>
                                    <Text style={styles.summaryTextLight}>Date de début</Text>
                                    <Text style={[styles.summaryText, { width: "60%" }]}>
                                        {date ? formatDateFR(date) : ""}
                                    </Text>
                                </View>
                                <View style={styles.summaryContainer}>
                                    <Text style={styles.summaryTextLight}>Montant</Text>
                                    <Text style={[styles.summaryText, { width: "60%" }]}>{amount}€</Text>
                                </View>
                            </View>

                            <View style={styles.summaryContent}>
                                <Text style={styles.summaryText}>
                                    Votre enfant recevra désormais son argent de poche régulièrement.
                                </Text>
                                <Text style={styles.summaryText}>
                                    On vous enverra un rappel la veille du jour de paiement pour ne rien oublier !
                                </Text>
                            </View>
                        </View>

                        <AllowanceButton
                            textButton={isEditMode ? "Mettre à jour" : "Activer l'argent de poche"}
                            onNext={handleSubmit}
                            onBack={() => setFormStep(FormSteps.AMOUNT)}
                            loading={submitting}
                        />
                    </View>
                )}

            </View>
        </ScrollView>
    )
}

type AllowanceButtonProps = {
    textButton: string
    onNext: () => void
    onBack?: () => void
    disabled?: boolean
    loading?: boolean
}

const AllowanceButton = ({
    textButton,
    onNext,
    onBack,
    disabled = false,
    loading = false,
}: AllowanceButtonProps) => (
    <View style={styles.footer}>
        {!!onBack && (
            <TouchableOpacity
                style={[styles.button, styles.backButton]}
                onPress={onBack}
                disabled={loading}
            >
                <Text style={[styles.createButtonText, { color: "#6A6A6A" }]}>Retour</Text>
            </TouchableOpacity>
        )}
        <TouchableOpacity
            style={[
                styles.button,
                disabled || loading ? styles.createButtonDisabled : styles.createButton,
                { width: !!onBack ? "70%" : "100%" },
            ]}
            onPress={onNext}
            disabled={disabled || loading}
        >
            {loading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={[styles.createButtonText, { color: "#fff" }]}>{textButton}</Text>
            }
        </TouchableOpacity>
    </View>
)

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 60,
    },
    contentSetup: {
        flex: 1,
        justifyContent: "flex-end",
        paddingHorizontal: 20,
    },
    title: {
        fontWeight: "700",
        fontSize: 20,
        marginTop: 20,
    },
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
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#D5D5D5",
        paddingHorizontal: 16,
    },
    inputContainerSelectedGreen: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#16AA75",
        paddingHorizontal: 16,
    },
    textInput: {
        fontSize: 16,
        color: "#333",
        paddingVertical: 16,
    },
    frequencyContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        backgroundColor: "#fff",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#D5D5D5",
        padding: 4,
        marginBottom: 12,
    },
    frequencyOption: {
        width: "100%",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    frequencyOptionSelected: {
        backgroundColor: "#E6E2FB",
    },
    button: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    createButton: {
        shadowColor: "#4E31CF",
        backgroundColor: "#846DED",
    },
    backButton: {
        width: "27%",
        backgroundColor: "#D5D5D5",
        shadowColor: "#979797",
    },
    createButtonDisabled: {
        backgroundColor: "#ccc",
        shadowColor: "transparent",
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    summaryContent: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginTop: 20,
        justifyContent: "flex-start",
    },
    summaryContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    summaryText: {
        fontSize: 16,
        color: "#2F2F2F",
        fontWeight: "400",
    },
    summaryTextLight: {
        color: "#828282",
        fontSize: 16,
        fontWeight: "400",
        width: "35%",
    },
    footer: {
        paddingBottom: 20,
        paddingTop: 16,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
    },
})

export default AllowanceForm
