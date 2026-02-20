import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { tasksService } from "@/services/tasksService";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, shadows } from "@/styles";
import Cross from "@/components/Icons/Cross";
import { TaskType, WeekDay } from "@/types/Task";

const PREDEFINED_MONEY_AMOUNTS = ["0.50", "1", "1.50"];
const PREDEFINED_COIN_AMOUNTS = [1, 5, 10, 25];

const WEEK_DAYS: { key: WeekDay; label: string }[] = [
    { key: "MONDAY", label: "L" },
    { key: "TUESDAY", label: "M" },
    { key: "WEDNESDAY", label: "M" },
    { key: "THURSDAY", label: "J" },
    { key: "FRIDAY", label: "V" },
    { key: "SATURDAY", label: "S" },
    { key: "SUNDAY", label: "D" },
];

type RewardType = "money" | "coins";

export default function CreateTask() {
    const params = useLocalSearchParams();
    const childId = params.childId as string;

    // Task name
    const [taskName, setTaskName] = useState("");

    // Reward
    const [rewardType, setRewardType] = useState<RewardType>("money");
    const [selectedMoneyAmount, setSelectedMoneyAmount] = useState("");
    const [customMoneyAmount, setCustomMoneyAmount] = useState("");
    const [showCustomMoney, setShowCustomMoney] = useState(false);
    const [selectedCoinAmount, setSelectedCoinAmount] = useState<number | null>(null);
    const [customCoinAmount, setCustomCoinAmount] = useState("");
    const [showCustomCoin, setShowCustomCoin] = useState(false);

    // Frequency
    const [frequencyModalVisible, setFrequencyModalVisible] = useState(false);
    const [taskType, setTaskType] = useState<TaskType>("PONCTUAL");
    const [selectedWeekDays, setSelectedWeekDays] = useState<WeekDay[]>([]);
    const [monthlyDay, setMonthlyDay] = useState(1);

    // Validation mode
    const [validationModalVisible, setValidationModalVisible] = useState(false);
    const [validationMode, setValidationMode] = useState<"BOTH" | "PARENTS_ONLY">("BOTH");

    const [loading, setLoading] = useState(false);

    // Money amount handlers
    const handleMoneyAmountSelect = (amount: string) => {
        setRewardType("money");
        setSelectedMoneyAmount(amount);
        setShowCustomMoney(false);
        setCustomMoneyAmount("");
        // Reset coin selection
        setSelectedCoinAmount(null);
        setShowCustomCoin(false);
        setCustomCoinAmount("");
    };

    const handleCustomMoneyAmount = () => {
        setRewardType("money");
        setShowCustomMoney(true);
        setSelectedMoneyAmount("");
        // Reset coin selection
        setSelectedCoinAmount(null);
        setShowCustomCoin(false);
        setCustomCoinAmount("");
    };

    // Coin amount handlers
    const handleCoinAmountSelect = (amount: number) => {
        setRewardType("coins");
        setSelectedCoinAmount(amount);
        setShowCustomCoin(false);
        setCustomCoinAmount("");
        // Reset money selection
        setSelectedMoneyAmount("");
        setShowCustomMoney(false);
        setCustomMoneyAmount("");
    };

    const handleCustomCoinAmount = () => {
        setRewardType("coins");
        setShowCustomCoin(true);
        setSelectedCoinAmount(null);
        // Reset money selection
        setSelectedMoneyAmount("");
        setShowCustomMoney(false);
        setCustomMoneyAmount("");
    };

    const getMoneyReward = (): number => {
        if (rewardType !== "money") return 0;
        if (showCustomMoney) {
            return parseFloat(customMoneyAmount) || 0;
        }
        return parseFloat(selectedMoneyAmount) || 0;
    };

    const getCoinReward = (): number => {
        if (rewardType !== "coins") return 0;
        if (showCustomCoin) {
            return parseInt(customCoinAmount) || 0;
        }
        return selectedCoinAmount || 0;
    };

    const hasReward = (): boolean => {
        return getMoneyReward() > 0 || getCoinReward() > 0;
    };

    // Frequency handlers
    const toggleWeekDay = (day: WeekDay) => {
        setSelectedWeekDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
    };

    const getFrequencyLabel = (): string => {
        if (taskType === "PONCTUAL") return "Une seule fois";
        if (taskType === "WEEKLY") {
            if (selectedWeekDays.length === 0) return "Toutes les semaines";
            if (selectedWeekDays.length === 1) {
                const dayNames: Record<WeekDay, string> = {
                    MONDAY: "lundis",
                    TUESDAY: "mardis",
                    WEDNESDAY: "mercredis",
                    THURSDAY: "jeudis",
                    FRIDAY: "vendredis",
                    SATURDAY: "samedis",
                    SUNDAY: "dimanches",
                };
                return `Tous les ${dayNames[selectedWeekDays[0]]}`;
            }
            return `${selectedWeekDays.length} jours par semaine`;
        }
        if (taskType === "MONTHLY") return `Le ${monthlyDay} de chaque mois`;
        return "Sélectionner";
    };

    const isFrequencyValid = (): boolean => {
        if (taskType === "PONCTUAL") return true;
        if (taskType === "WEEKLY") return selectedWeekDays.length > 0;
        if (taskType === "MONTHLY") return monthlyDay > 0 && monthlyDay <= 31;
        return false;
    };

    const handleCreateTask = async () => {
        if (!taskName.trim()) {
            Alert.alert("Erreur", "Veuillez saisir un nom de tâche");
            return;
        }

        if (!hasReward()) {
            Alert.alert("Erreur", "Veuillez sélectionner une récompense");
            return;
        }

        if (!isFrequencyValid()) {
            Alert.alert("Erreur", "Veuillez configurer la fréquence correctement");
            return;
        }

        setLoading(true);
        try {
            await tasksService.createTask({
                description: taskName.trim(),
                type: taskType,
                subAccountId: childId,
                coinReward: getCoinReward(),
                moneyReward: getMoneyReward(),
                dateLimit: new Date().toISOString(),
                weeklyDays: taskType === "WEEKLY" ? selectedWeekDays : [],
                monthlyDay: taskType === "MONTHLY" ? monthlyDay : 0,
                prevalidation: validationMode === "PARENTS_ONLY",
            });

            Alert.alert("Succès", "Tâche créée avec succès", [{ text: "OK", onPress: () => router.back() }]);
        } catch (error: any) {
            console.error("Error creating task:", error);
            const errorMessage = error.response?.data?.message || "Impossible de créer la tâche";
            Alert.alert("Erreur", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const canCreate = taskName.trim() && hasReward() && isFrequencyValid() && !loading;

    return (
        <SafeAreaView style={styles.container}>
            {/* Frequency Modal */}
            <Modal visible={frequencyModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.bottomSheet}>
                        <View style={styles.bottomSheetHandle} />
                        <View style={styles.bottomSheetHeader}>
                            <TouchableOpacity style={styles.closeButton} onPress={() => setFrequencyModalVisible(false)}>
                                <Cross width={24} height={24} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.bottomSheetTitle}>On programme ça à quelle fréquence ?</Text>

                        <View style={styles.bottomSheetContent}>
                            {/* Une seule fois */}
                            <TouchableOpacity
                                style={[styles.frequencyOption, taskType === "PONCTUAL" && styles.frequencyOptionSelected]}
                                onPress={() => setTaskType("PONCTUAL")}
                            >
                                <Text style={[styles.frequencyOptionText, taskType === "PONCTUAL" && styles.frequencyOptionTextSelected]}>
                                    Une seule fois
                                </Text>
                                <View style={[styles.radioCircle, taskType === "PONCTUAL" && styles.radioCircleSelected]}>
                                    {taskType === "PONCTUAL" && <View style={styles.radioCircleInner} />}
                                </View>
                            </TouchableOpacity>

                            {/* Toutes les semaines */}
                            <TouchableOpacity
                                style={[styles.frequencyOption, taskType === "WEEKLY" && styles.frequencyOptionSelected]}
                                onPress={() => setTaskType("WEEKLY")}
                            >
                                <Text style={[styles.frequencyOptionText, taskType === "WEEKLY" && styles.frequencyOptionTextSelected]}>
                                    Toutes les semaines
                                </Text>
                                <View style={[styles.radioCircle, taskType === "WEEKLY" && styles.radioCircleSelected]}>
                                    {taskType === "WEEKLY" && <View style={styles.radioCircleInner} />}
                                </View>
                            </TouchableOpacity>

                            {/* Week days selector */}
                            {taskType === "WEEKLY" && (
                                <View style={styles.weekDaysContainer}>
                                    <Text style={styles.weekDaysHint}>Cette tâche se répètera le(s) jour(s) choisi(s).</Text>
                                    <View style={styles.weekDaysRow}>
                                        {WEEK_DAYS.map((day) => (
                                            <TouchableOpacity
                                                key={day.key}
                                                style={[styles.weekDayButton, selectedWeekDays.includes(day.key) && styles.weekDayButtonSelected]}
                                                onPress={() => toggleWeekDay(day.key)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.weekDayButtonText,
                                                        selectedWeekDays.includes(day.key) && styles.weekDayButtonTextSelected,
                                                    ]}
                                                >
                                                    {day.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Tous les mois */}
                            <TouchableOpacity
                                style={[styles.frequencyOption, taskType === "MONTHLY" && styles.frequencyOptionSelected]}
                                onPress={() => setTaskType("MONTHLY")}
                            >
                                <Text style={[styles.frequencyOptionText, taskType === "MONTHLY" && styles.frequencyOptionTextSelected]}>
                                    Tous les mois
                                </Text>
                                <View style={[styles.radioCircle, taskType === "MONTHLY" && styles.radioCircleSelected]}>
                                    {taskType === "MONTHLY" && <View style={styles.radioCircleInner} />}
                                </View>
                            </TouchableOpacity>

                            {/* Monthly day selector */}
                            {taskType === "MONTHLY" && (
                                <View style={styles.monthlyDayContainer}>
                                    <Text style={styles.weekDaysHint}>Le jour du mois :</Text>
                                    <TextInput
                                        style={styles.monthlyDayInput}
                                        value={monthlyDay.toString()}
                                        onChangeText={(text) => {
                                            const num = parseInt(text) || 1;
                                            setMonthlyDay(Math.min(31, Math.max(1, num)));
                                        }}
                                        keyboardType="number-pad"
                                        maxLength={2}
                                    />
                                </View>
                            )}
                        </View>

                        <View style={styles.bottomSheetFooter}>
                            <TouchableOpacity
                                style={[styles.applyButton, !isFrequencyValid() && styles.applyButtonDisabled]}
                                onPress={() => setFrequencyModalVisible(false)}
                                disabled={!isFrequencyValid()}
                            >
                                <Text style={styles.applyButtonText}>Appliquer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Validation Mode Modal */}
            <Modal visible={validationModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <SafeAreaView style={styles.modalSafeArea}>
                        <View style={styles.validationModalHeader}>
                            <TouchableOpacity style={styles.closeButton} onPress={() => setValidationModalVisible(false)}>
                                <Cross width={24} height={24} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.validationIllustration} />

                        <View style={styles.validationModalContent}>
                            <Text style={styles.validationModalTitle}>Qui pourra valider les tâches une fois terminées ?</Text>

                            <TouchableOpacity
                                style={[styles.radioButton, validationMode === "BOTH" && styles.radioButtonSelected]}
                                onPress={() => setValidationMode("BOTH")}
                            >
                                <Text style={[styles.radioButtonText, validationMode === "BOTH" && styles.radioButtonTextSelected]}>
                                    Les parents et les enfants peuvent valider les tâches
                                </Text>
                                <View style={[styles.radioCircle, validationMode === "BOTH" && styles.radioCircleSelected]}>
                                    {validationMode === "BOTH" && <View style={styles.radioCircleInner} />}
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.radioButton, validationMode === "PARENTS_ONLY" && styles.radioButtonSelected]}
                                onPress={() => setValidationMode("PARENTS_ONLY")}
                            >
                                <Text style={[styles.radioButtonText, validationMode === "PARENTS_ONLY" && styles.radioButtonTextSelected]}>
                                    Seuls les parents peuvent valider les tâches
                                </Text>
                                <View style={[styles.radioCircle, validationMode === "PARENTS_ONLY" && styles.radioCircleSelected]}>
                                    {validationMode === "PARENTS_ONLY" && <View style={styles.radioCircleInner} />}
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={() => {
                                    setValidationModalVisible(false);
                                    handleCreateTask();
                                }}
                            >
                                <Text style={styles.confirmButtonText}>Enregistrer ma sélection</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Ajouter une tâche</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                    <Cross width={24} height={24} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Nom de la tâche */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Nom de la tâche</Text>
                    <View style={[styles.inputContainer, taskName.trim() ? styles.inputContainerValid : null]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ex: Sortir les poubelles"
                            value={taskName}
                            onChangeText={setTaskName}
                            autoCapitalize="sentences"
                        />
                        {taskName.trim() && <Ionicons name="checkmark-outline" size={18} color={colors.jadegreen[100]} />}
                    </View>
                </View>

                {/* Montant attribué (argent) */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Montant attribué</Text>
                    <View style={styles.amountContainer}>
                        {PREDEFINED_MONEY_AMOUNTS.map((amount) => (
                            <TouchableOpacity
                                key={amount}
                                style={[styles.amountButton, rewardType === "money" && selectedMoneyAmount === amount && styles.amountButtonSelected]}
                                onPress={() => handleMoneyAmountSelect(amount)}
                            >
                                <Text
                                    style={[
                                        styles.amountButtonText,
                                        rewardType === "money" && selectedMoneyAmount === amount && styles.amountButtonTextSelected,
                                    ]}
                                >
                                    {amount}€
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={[styles.amountButton, rewardType === "money" && showCustomMoney && styles.amountButtonSelected]}
                            onPress={handleCustomMoneyAmount}
                        >
                            <Text style={[styles.amountButtonText, rewardType === "money" && showCustomMoney && styles.amountButtonTextSelected]}>
                                Définir
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {showCustomMoney && (
                        <View style={styles.customAmountContainer}>
                            <TextInput
                                style={styles.customAmountInput}
                                placeholder="Montant personnalisé"
                                value={customMoneyAmount}
                                onChangeText={setCustomMoneyAmount}
                                keyboardType="decimal-pad"
                                autoFocus
                            />
                            <Text style={styles.euroSymbol}>€</Text>
                        </View>
                    )}
                </View>

                {/* Récompense (coins) */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Récompense</Text>
                    <View style={styles.amountContainer}>
                        {PREDEFINED_COIN_AMOUNTS.map((amount) => (
                            <TouchableOpacity
                                key={amount}
                                style={[styles.coinButton, rewardType === "coins" && selectedCoinAmount === amount && styles.coinButtonSelected]}
                                onPress={() => handleCoinAmountSelect(amount)}
                            >
                                <Text
                                    style={[
                                        styles.coinButtonText,
                                        rewardType === "coins" && selectedCoinAmount === amount && styles.coinButtonTextSelected,
                                    ]}
                                >
                                    {amount}
                                </Text>
                                <View
                                    style={[
                                        styles.coinIcon,
                                        rewardType === "coins" && selectedCoinAmount === amount ? null : styles.coinIconInactive,
                                    ]}
                                />
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={[styles.amountButton, rewardType === "coins" && showCustomCoin && styles.amountButtonSelected]}
                            onPress={handleCustomCoinAmount}
                        >
                            <Text style={[styles.amountButtonText, rewardType === "coins" && showCustomCoin && styles.amountButtonTextSelected]}>
                                Définir
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {showCustomCoin && (
                        <View style={styles.customAmountContainer}>
                            <TextInput
                                style={styles.customAmountInput}
                                placeholder="Nombre de points"
                                value={customCoinAmount}
                                onChangeText={setCustomCoinAmount}
                                keyboardType="number-pad"
                                autoFocus
                            />
                            <View style={styles.coinIcon} />
                        </View>
                    )}
                </View>

                {/* Fréquence */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>À quelle fréquence ?</Text>
                    <TouchableOpacity
                        style={[styles.inputContainer, isFrequencyValid() && taskType !== "PONCTUAL" ? styles.inputContainerValid : null]}
                        onPress={() => setFrequencyModalVisible(true)}
                    >
                        <Text style={styles.frequencyText}>{getFrequencyLabel()}</Text>
                        {isFrequencyValid() && taskType !== "PONCTUAL" ? (
                            <Ionicons name="checkmark-outline" size={18} color={colors.jadegreen[100]} />
                        ) : (
                            <Ionicons name="chevron-forward" size={18} color={colors.carbon[30]} />
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Bouton de création */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.createButton, !canCreate && styles.createButtonDisabled]}
                    onPress={() => setValidationModalVisible(true)}
                    disabled={!canCreate}
                >
                    <Text style={styles.createButtonText}>{loading ? "Création..." : "Créer la tâche"}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: colors.white,
    },
    modalSafeArea: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    bottomSheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: spacing.xl,
    },
    bottomSheetHandle: {
        width: 109,
        height: 5,
        backgroundColor: colors.carbon[100],
        borderRadius: 24,
        alignSelf: "center",
        marginTop: spacing.sm,
    },
    bottomSheetHeader: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
    },
    bottomSheetTitle: {
        ...typography.lg,
        ...typography.bold,
        color: colors.carbon[100],
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.xl,
    },
    bottomSheetContent: {
        paddingHorizontal: spacing.xl,
    },
    bottomSheetFooter: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xl,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        ...typography.lg,
        ...typography.bold,
        color: colors.carbon[100],
    },
    closeButton: {
        width: 48,
        height: 48,
        backgroundColor: colors.carbon[100],
        borderRadius: spacing.sm,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.xl,
    },
    section: {
        marginTop: spacing.xl,
    },
    sectionLabel: {
        ...typography.sm,
        color: colors.carbon[100],
        marginBottom: spacing.md,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: spacing.sm,
        borderWidth: 2,
        borderColor: colors.carbon[20],
        paddingHorizontal: spacing.base,
        height: 53,
    },
    inputContainerValid: {
        borderColor: colors.jadegreen[100],
        borderWidth: 1,
    },
    textInput: {
        flex: 1,
        ...typography.md,
        color: colors.carbon[100],
    },
    frequencyText: {
        flex: 1,
        ...typography.md,
        color: colors.carbon[100],
    },
    amountContainer: {
        flexDirection: "row",
        gap: spacing.md,
        flexWrap: "wrap",
    },
    amountButton: {
        backgroundColor: colors.carbon[10],
        padding: spacing.sm,
        borderRadius: spacing.sm,
        borderWidth: 1.5,
        borderColor: colors.carbon[20],
    },
    amountButtonSelected: {
        backgroundColor: colors.primary[20],
        borderColor: colors.primary[100],
    },
    amountButtonText: {
        ...typography.md,
        color: colors.carbon[70],
    },
    amountButtonTextSelected: {
        ...typography.bold,
        color: colors.carbon[100],
    },
    coinButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.carbon[10],
        padding: spacing.sm,
        borderRadius: spacing.sm,
        borderWidth: 1.5,
        borderColor: colors.carbon[20],
        gap: 4,
    },
    coinButtonSelected: {
        backgroundColor: colors.primary[20],
        borderColor: colors.primary[100],
    },
    coinButtonText: {
        ...typography.md,
        color: colors.carbon[70],
    },
    coinButtonTextSelected: {
        ...typography.bold,
        color: colors.carbon[100],
    },
    coinIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#FFD700",
    },
    coinIconInactive: {
        opacity: 0.4,
    },
    customAmountContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: spacing.sm,
        borderWidth: 1,
        borderColor: colors.primary[100],
        paddingHorizontal: spacing.base,
        marginTop: spacing.md,
    },
    customAmountInput: {
        flex: 1,
        ...typography.md,
        color: colors.carbon[100],
        paddingVertical: spacing.base,
    },
    euroSymbol: {
        ...typography.md,
        color: colors.carbon[60],
        ...typography.semiBold,
    },
    frequencyOption: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: spacing.sm,
        borderWidth: 2,
        borderColor: colors.carbon[20],
        paddingLeft: spacing.lg,
        paddingRight: spacing.md,
        paddingVertical: spacing.md,
        marginBottom: spacing.md,
    },
    frequencyOptionSelected: {
        backgroundColor: colors.primary[10],
        borderColor: colors.primary[100],
    },
    frequencyOptionText: {
        ...typography.md,
        color: colors.carbon[100],
    },
    frequencyOptionTextSelected: {
        ...typography.bold,
    },
    weekDaysContainer: {
        backgroundColor: colors.primary[10],
        borderRadius: spacing.sm,
        padding: spacing.lg,
        marginBottom: spacing.md,
    },
    weekDaysHint: {
        ...typography.sm,
        color: colors.carbon[100],
        marginBottom: spacing.md,
    },
    weekDaysRow: {
        flexDirection: "row",
        gap: spacing.sm,
    },
    weekDayButton: {
        flex: 1,
        backgroundColor: colors.white,
        paddingVertical: spacing.sm,
        borderRadius: spacing.sm,
        alignItems: "center",
    },
    weekDayButtonSelected: {
        backgroundColor: colors.primary[40],
        borderWidth: 1.5,
        borderColor: colors.primary[100],
    },
    weekDayButtonText: {
        ...typography.md,
        color: colors.carbon[70],
    },
    weekDayButtonTextSelected: {
        ...typography.bold,
        color: colors.carbon[100],
    },
    monthlyDayContainer: {
        backgroundColor: colors.primary[10],
        borderRadius: spacing.sm,
        padding: spacing.lg,
        marginBottom: spacing.md,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
    },
    monthlyDayInput: {
        backgroundColor: colors.white,
        borderRadius: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        ...typography.md,
        color: colors.carbon[100],
        textAlign: "center",
        width: 60,
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.carbon[20],
        justifyContent: "center",
        alignItems: "center",
    },
    radioCircleSelected: {
        borderColor: colors.primary[100],
    },
    radioCircleInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary[100],
    },
    applyButton: {
        backgroundColor: colors.primary[100],
        paddingVertical: spacing.md,
        borderRadius: spacing.sm,
        alignItems: "center",
        ...shadows.md,
    },
    applyButtonDisabled: {
        backgroundColor: colors.carbon[30],
        ...shadows.none,
    },
    applyButtonText: {
        color: colors.white,
        ...typography.button,
    },
    validationModalHeader: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
    },
    validationIllustration: {
        height: 150,
        backgroundColor: colors.primary[10],
        marginHorizontal: spacing.xl,
        borderRadius: spacing.md,
        marginBottom: spacing.xl,
    },
    validationModalContent: {
        flex: 1,
        paddingHorizontal: spacing.xl,
    },
    validationModalTitle: {
        ...typography.lg,
        ...typography.bold,
        color: colors.carbon[100],
        marginBottom: spacing.xl,
    },
    radioButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.white,
        borderRadius: spacing.sm,
        borderWidth: 2,
        borderColor: colors.carbon[20],
        paddingLeft: spacing.lg,
        paddingRight: spacing.md,
        paddingVertical: spacing.md,
        marginBottom: spacing.md,
    },
    radioButtonSelected: {
        backgroundColor: colors.primary[10],
        borderColor: colors.primary[100],
    },
    radioButtonText: {
        flex: 1,
        ...typography.md,
        color: colors.carbon[100],
        marginRight: spacing.md,
    },
    radioButtonTextSelected: {
        ...typography.bold,
    },
    modalFooter: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl,
        paddingTop: spacing.base,
    },
    confirmButton: {
        backgroundColor: colors.primary[100],
        paddingVertical: spacing.md,
        borderRadius: spacing.sm,
        alignItems: "center",
        ...shadows.md,
    },
    confirmButtonText: {
        color: colors.white,
        ...typography.button,
    },
    bottomPadding: {
        height: 100,
    },
    footer: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.lg,
        paddingTop: spacing.base,
    },
    createButton: {
        backgroundColor: colors.primary[100],
        paddingVertical: spacing.md,
        borderRadius: spacing.sm,
        alignItems: "center",
        ...shadows.md,
    },
    createButtonDisabled: {
        backgroundColor: colors.carbon[30],
        ...shadows.none,
    },
    createButtonText: {
        color: colors.white,
        ...typography.button,
    },
});
