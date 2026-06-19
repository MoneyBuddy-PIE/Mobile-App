import { AllowanceFrequency, Allowance } from "@/types/Allowance";
import { WeekDay } from "@/types/Task";
import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
    Animated,
    Dimensions,
    Easing,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { router } from "expo-router";
import { allowanceService } from "@/services/allowanceService";
import DatePickerInput, { formatDateFR } from "@/components/DatePickerInput";
import { theme, typography } from "@/styles";

enum FormSteps {
    DATE_AND_FREQUENCY = "DATE_AND_FREQUENCY",
    AMOUNT = "AMOUNT",
    SUMMARY = "SUMMARY",
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const TRIGGER_HEIGHT = 53;

const WEEKDAY_FROM_JS: WeekDay[] = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const formatDateForAPI = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const parseDateFromAPI = (dateStr: string): Date => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
};

const FREQUENCY_OPTIONS: { value: AllowanceFrequency; label: string }[] = [
    { value: AllowanceFrequency.WEEKLY, label: "Semaine" },
    { value: AllowanceFrequency.BIWEEKLY, label: "Quinzaine (15 jours)" },
    { value: AllowanceFrequency.MONTHLY, label: "Mois" },
];

type IProps = {
    childId: string;
    childName: string;
};

const AllowanceForm = ({ childId, childName }: IProps) => {
    const [formStep, setFormStep] = useState<FormSteps>(FormSteps.DATE_AND_FREQUENCY);
    const [showFrequency, setShowFrequency] = useState(false);
    const [existingAllowance, setExistingAllowance] = useState<Allowance | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState<Date | null>(null);
    const [frequency, setFrequency] = useState<AllowanceFrequency | null>(null);

    const slideAnim = useRef(new Animated.Value(0)).current;
    const isEditMode = existingAllowance !== null;

    const selectedFrequencyLabel = FREQUENCY_OPTIONS.find((o) => o.value === frequency)?.label ?? "Choisir une fréquence";

    useEffect(() => {
        (async () => {
            try {
                const existing = await allowanceService.getByChildId(childId);
                if (existing) {
                    setExistingAllowance(existing);
                    setFrequency(existing.frequency);
                    setAmount(existing.amount.toString());
                    setDate(parseDateFromAPI(existing.startDate));
                }
            } catch {
                router.back();
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const goToStep = (nextStep: FormSteps, dir: 1 | -1 = 1) => {
        setShowFrequency(false);
        Animated.timing(slideAnim, {
            toValue: -dir * SCREEN_WIDTH,
            duration: 220,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
        }).start(() => {
            setFormStep(nextStep);
            slideAnim.setValue(dir * SCREEN_WIDTH);
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 220,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }).start();
        });
    };

    const handleSubmit = async () => {
        if (!date || !frequency) return;
        setSubmitting(true);
        const weeklyDay = frequency === "WEEKLY" ? WEEKDAY_FROM_JS[date.getDay()] : undefined;
        try {
            if (isEditMode && existingAllowance) {
                await allowanceService.update(existingAllowance.id, {
                    frequency,
                    amount: parseFloat(amount),
                    startDate: formatDateForAPI(date),
                    active: true,
                    ...(weeklyDay && { weeklyDay, weeklyDayValid: true }),
                });
            } else {
                await allowanceService.create({
                    subAccountIdChild: childId,
                    frequency,
                    amount: parseFloat(amount),
                    active: true,
                    startDate: formatDateForAPI(date),
                    ...(weeklyDay && { weeklyDay }),
                });
            }
            router.back();
        } catch (error: any) {
            Alert.alert("Erreur", error?.response?.data?.message ?? "Impossible de sauvegarder l'argent de poche.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary[100]} />
            </View>
        );
    }

    const step1Valid = !!frequency && !!date;
    const step2Valid = Number(amount) > 0;

    const renderStep1 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>À quelle fréquence souhaitez-vous verser l'argent de poche de {childName} ?</Text>

            <View style={styles.fieldsContainer}>
                {/* Frequency select */}
                <View style={{ zIndex: 10 }}>
                    <Text style={styles.fieldLabel}>Chaque</Text>
                    <View>
                        <TouchableOpacity
                            style={[styles.selectTrigger, frequency && styles.selectTriggerDone]}
                            onPress={() => setShowFrequency((v) => !v)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.selectTriggerText, !frequency && styles.selectPlaceholder]}>{selectedFrequencyLabel}</Text>
                            {frequency ? (
                                <Ionicons name="checkmark-outline" size={18} color={theme.colors.jadegreen[100]} />
                            ) : (
                                <Ionicons name={showFrequency ? "chevron-up" : "chevron-down"} size={18} color={theme.colors.carbon[60]} />
                            )}
                        </TouchableOpacity>

                        {showFrequency && (
                            <View style={styles.dropdownList}>
                                {FREQUENCY_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[styles.dropdownOption, frequency === option.value && styles.dropdownOptionSelected]}
                                        onPress={() => {
                                            setFrequency(option.value);
                                            setShowFrequency(false);
                                        }}
                                    >
                                        <Text style={styles.dropdownOptionText}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* Date picker */}
                <View style={{ zIndex: 1 }}>
                    <Text style={styles.fieldLabel}>À partir du</Text>
                    <DatePickerInput value={date} onChange={setDate} placeholder="Choisir une date de début" />
                </View>
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Combien est-ce que {childName} va recevoir ?</Text>

            <View style={styles.fieldsContainer}>
                <Text style={styles.fieldLabel}>Chaque {selectedFrequencyLabel}</Text>
                <View style={[styles.selectTrigger, Number(amount) > 0 && styles.selectTriggerDone]}>
                    <TextInput
                        style={styles.selectTriggerText}
                        placeholder="0.00€"
                        placeholderTextColor={theme.colors.carbon[40]}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="decimal-pad"
                        autoFocus
                    />
                    {Number(amount) > 0 && <Ionicons name="checkmark-outline" size={18} color={theme.colors.jadegreen[100]} />}
                </View>
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Tout est prêt !</Text>

            <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Fréquence</Text>
                    <Text style={styles.summaryValue}>Chaque {selectedFrequencyLabel}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Date de début</Text>
                    <Text style={styles.summaryValue}>{date ? formatDateFR(date) : ""}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Montant</Text>
                    <Text style={styles.summaryValue}>{amount}€</Text>
                </View>

                <View style={styles.summaryNotes}>
                    <Text style={styles.summaryNote}>Votre enfant recevra désormais son argent de poche régulièrement.</Text>
                    <Text style={styles.summaryNote}>On vous enverra un rappel la veille du jour de paiement pour ne rien oublier !</Text>
                </View>
            </View>
        </View>
    );

    const isDisabled = () => {
        if (formStep === FormSteps.DATE_AND_FREQUENCY) return !step1Valid;
        if (formStep === FormSteps.AMOUNT) return !step2Valid;
        return false;
    };

    const handleNext = () => {
        if (formStep === FormSteps.DATE_AND_FREQUENCY) goToStep(FormSteps.AMOUNT, 1);
        else if (formStep === FormSteps.AMOUNT) goToStep(FormSteps.SUMMARY, 1);
        else handleSubmit();
    };

    const handleBack = () => {
        if (formStep === FormSteps.AMOUNT) goToStep(FormSteps.DATE_AND_FREQUENCY, -1);
        else if (formStep === FormSteps.SUMMARY) goToStep(FormSteps.AMOUNT, -1);
    };

    const isFirstStep = formStep === FormSteps.DATE_AND_FREQUENCY;
    const isLastStep = formStep === FormSteps.SUMMARY;
    const disabled = isDisabled();
    const buttonLabel = isLastStep ? (isEditMode ? "Mettre à jour" : "Activer l'argent de poche") : "Continuer";

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.overflow}>
                <Animated.View style={[styles.animated, { transform: [{ translateX: slideAnim }] }]}>
                    {formStep === FormSteps.DATE_AND_FREQUENCY && renderStep1()}
                    {formStep === FormSteps.AMOUNT && renderStep2()}
                    {formStep === FormSteps.SUMMARY && renderStep3()}

                    {/* Footer — always at bottom */}
                    <View style={styles.footer}>
                        {!isFirstStep && (
                            <TouchableOpacity style={styles.backButton} onPress={handleBack} disabled={submitting}>
                                <Text style={styles.backButtonText}>Retour</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.continueButton, disabled || submitting ? styles.continueButtonDisabled : styles.continueButtonActive]}
                            onPress={handleNext}
                            disabled={disabled || submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={[styles.continueButtonText, (disabled || submitting) && styles.continueButtonTextDisabled]}>
                                    {buttonLabel}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.white,
    },
    overflow: {
        flex: 1,
        overflow: "hidden",
    },
    animated: {
        flex: 1,
        flexDirection: "column",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 60,
    },
    stepContent: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    stepTitle: {
        ...typography.bold,
        fontSize: 20,
        color: theme.colors.carbon[100],
        lineHeight: 28,
    },
    fieldsContainer: {
        marginTop: 24,
        gap: 20,
    },
    fieldLabel: {
        ...typography.regular,
        fontSize: 14,
        color: theme.colors.carbon[100],
        marginBottom: 8,
    },
    selectTrigger: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.colors.white,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: theme.colors.carbon[20],
        paddingHorizontal: 14,
        height: TRIGGER_HEIGHT,
    },
    selectTriggerDone: {
        borderColor: theme.colors.jadegreen[100],
    },
    selectTriggerText: {
        flex: 1,
        ...typography.regular,
        fontSize: 16,
        color: theme.colors.carbon[100],
    },
    selectPlaceholder: {
        color: theme.colors.carbon[40],
    },
    dropdownList: {
        position: "absolute",
        top: TRIGGER_HEIGHT + 4,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.white,
        borderRadius: 8,
        padding: 4,
        zIndex: 100,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.14,
        shadowRadius: 5,
    },
    dropdownOption: {
        height: TRIGGER_HEIGHT,
        paddingHorizontal: 14,
        borderRadius: 8,
        justifyContent: "center",
    },
    dropdownOptionSelected: {
        backgroundColor: theme.colors.primary[20],
    },
    dropdownOptionText: {
        ...typography.regular,
        fontSize: 16,
        color: theme.colors.carbon[100],
    },
    summaryContainer: {
        marginTop: 24,
        gap: 16,
    },
    summaryRow: {
        flexDirection: "row",
        gap: 8,
    },
    summaryLabel: {
        ...typography.regular,
        fontSize: 16,
        color: theme.colors.carbon[60],
        width: "40%",
    },
    summaryValue: {
        ...typography.regular,
        fontSize: 16,
        color: theme.colors.carbon[100],
        flex: 1,
    },
    summaryNotes: {
        marginTop: 8,
        gap: 8,
    },
    summaryNote: {
        ...typography.regular,
        fontSize: 16,
        color: theme.colors.carbon[100],
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        paddingTop: 16,
        flexDirection: "row",
        gap: 12,
    },
    backButton: {
        width: "27%",
        backgroundColor: theme.colors.carbon[20],
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: theme.colors.carbon[50],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    backButtonText: {
        ...typography.semiBold,
        fontSize: 16,
        color: theme.colors.carbon[80],
    },
    continueButton: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    continueButtonActive: {
        backgroundColor: theme.colors.primary[100],
        shadowColor: "#4E31CF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    continueButtonDisabled: {
        backgroundColor: theme.colors.carbon[20],
        elevation: 0,
    },
    continueButtonText: {
        ...typography.bold,
        fontSize: 20,
        color: theme.colors.white,
    },
    continueButtonTextDisabled: {
        color: theme.colors.carbon[60],
    },
});

export default AllowanceForm;
