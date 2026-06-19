import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { tasksService } from "@/services/tasksService";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@/styles";
import Cross from "@/components/Icons/Cross";
import { CoinIcon } from "@/components/Icons/CoinIcon";
import DatePickerInput from "@/components/DatePickerInput";
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

    const [taskName, setTaskName] = useState("");

    const [rewardType, setRewardType] = useState<RewardType>("money");
    const [selectedMoneyAmount, setSelectedMoneyAmount] = useState("");
    const [customMoneyAmount, setCustomMoneyAmount] = useState("");
    const [showCustomMoney, setShowCustomMoney] = useState(false);
    const [selectedCoinAmount, setSelectedCoinAmount] = useState<number | null>(null);
    const [customCoinAmount, setCustomCoinAmount] = useState("");
    const [showCustomCoin, setShowCustomCoin] = useState(false);

    const [frequencyModalVisible, setFrequencyModalVisible] = useState(false);
    const [taskType, setTaskType] = useState<TaskType>("PONCTUAL");
    const [selectedWeekDays, setSelectedWeekDays] = useState<WeekDay[]>([]);
    const [monthlyDay, setMonthlyDay] = useState(1);
    const [dateLimit, setDateLimit] = useState<Date | null>(null);

    const [validationModalVisible, setValidationModalVisible] = useState(false);
    const [validationMode, setValidationMode] = useState<"BOTH" | "PARENTS_ONLY">("BOTH");

    const [loading, setLoading] = useState(false);

    const handleMoneyAmountSelect = (amount: string) => {
        setRewardType("money");
        setSelectedMoneyAmount(amount);
        setShowCustomMoney(false);
        setCustomMoneyAmount("");
        setSelectedCoinAmount(null);
        setShowCustomCoin(false);
        setCustomCoinAmount("");
    };

    const handleCustomMoneyAmount = () => {
        setRewardType("money");
        setShowCustomMoney(true);
        setSelectedMoneyAmount("");
        setSelectedCoinAmount(null);
        setShowCustomCoin(false);
        setCustomCoinAmount("");
    };

    const handleCoinAmountSelect = (amount: number) => {
        setRewardType("coins");
        setSelectedCoinAmount(amount);
        setShowCustomCoin(false);
        setCustomCoinAmount("");
        setSelectedMoneyAmount("");
        setShowCustomMoney(false);
        setCustomMoneyAmount("");
    };

    const handleCustomCoinAmount = () => {
        setRewardType("coins");
        setShowCustomCoin(true);
        setSelectedCoinAmount(null);
        setSelectedMoneyAmount("");
        setShowCustomMoney(false);
        setCustomMoneyAmount("");
    };

    const getMoneyReward = (): number => {
        if (rewardType !== "money") return 0;
        if (showCustomMoney) return parseFloat(customMoneyAmount) || 0;
        return parseFloat(selectedMoneyAmount) || 0;
    };

    const getCoinReward = (): number => {
        if (rewardType !== "coins") return 0;
        if (showCustomCoin) return parseInt(customCoinAmount) || 0;
        return selectedCoinAmount || 0;
    };

    const hasReward = (): boolean => getMoneyReward() > 0 || getCoinReward() > 0;

    const toggleWeekDay = (day: WeekDay) => {
        setSelectedWeekDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
    };

    const getFrequencyLabel = (): string => {
        if (taskType === "PONCTUAL") {
            if (dateLimit) return `Une seule fois — avant le ${dateLimit.toLocaleDateString("fr-FR")}`;
            return "Sélectionner";
        }
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
        if (taskType === "PONCTUAL") return dateLimit !== null;
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
                dateLimit: (dateLimit ?? new Date()).toISOString(),
                weeklyDays: taskType === "WEEKLY" ? selectedWeekDays : [],
                monthlyDay: taskType === "MONTHLY" ? monthlyDay : 0,
                prevalidation: validationMode === "PARENTS_ONLY",
            });

            Alert.alert("Succès", "Tâche créée avec succès", [{ text: "OK", onPress: () => router.back() }]);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Impossible de créer la tâche";
            Alert.alert("Erreur", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const canCreate = taskName.trim() && hasReward() && isFrequencyValid() && !loading;

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            {/* ── Frequency bottom sheet ── */}
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

                        <ScrollView style={styles.bottomSheetContent} showsVerticalScrollIndicator={false}>
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

                            {taskType === "PONCTUAL" && (
                                <View style={styles.subPanel}>
                                    <Text style={styles.subPanelHint}>Date limite pour compléter la tâche :</Text>
                                    <DatePickerInput
                                        value={dateLimit}
                                        onChange={setDateLimit}
                                        placeholder="Choisir une date"
                                        minYear={new Date().getFullYear()}
                                    />
                                </View>
                            )}

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

                            {taskType === "WEEKLY" && (
                                <View style={styles.subPanel}>
                                    <Text style={styles.subPanelHint}>Cette tâche se répètera le(s) jour(s) choisi(s).</Text>
                                    <View style={styles.weekDaysRow}>
                                        {WEEK_DAYS.map((day, index) => (
                                            <TouchableOpacity
                                                key={`${day.key}-${index}`}
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

                            {taskType === "MONTHLY" && (
                                <View style={styles.subPanel}>
                                    <Text style={styles.subPanelHint}>Le jour du mois :</Text>
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
                        </ScrollView>

                        <View style={styles.bottomSheetFooter}>
                            <TouchableOpacity
                                style={[styles.primaryButton, !isFrequencyValid() && styles.primaryButtonDisabled]}
                                onPress={() => setFrequencyModalVisible(false)}
                                disabled={!isFrequencyValid()}
                            >
                                <Text style={styles.primaryButtonText}>Appliquer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ── Validation full-screen modal ── */}
            <Modal visible={validationModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <SafeAreaView style={styles.modalSafeArea}>
                        <Image source={require("@/assets/images/child_task_validate.png")} style={styles.validationBanner} resizeMode="cover" />

                        <Text style={styles.validationTitle}>Qui pourra valider les tâches une fois terminées ?</Text>

                        <View style={styles.validationContent}>
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
                                style={styles.primaryButton}
                                onPress={() => {
                                    setValidationModalVisible(false);
                                    handleCreateTask();
                                }}
                            >
                                <Text style={styles.primaryButtonText}>Enregistrer ma sélection</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>

            {/* ── Header ── */}
            <View style={styles.header}>
                <Text style={styles.title}>Ajouter une tâche</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                    <Cross width={24} height={24} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Nom */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>C'est quoi la tâche ?</Text>
                    <View style={[styles.inputContainer, taskName.trim() && styles.inputContainerValid]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ex : Sortir les poubelles"
                            placeholderTextColor={colors.carbon[60]}
                            value={taskName}
                            onChangeText={setTaskName}
                            autoCapitalize="sentences"
                        />
                        {taskName.trim() && <Ionicons name="checkmark-outline" size={18} color={colors.jadegreen[100]} />}
                    </View>
                </View>

                {/* Montant attribué */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Montant attribué</Text>
                    <View style={styles.tagsRow}>
                        {PREDEFINED_MONEY_AMOUNTS.map((amount) => {
                            const selected = rewardType === "money" && selectedMoneyAmount === amount;
                            return (
                                <TouchableOpacity
                                    key={amount}
                                    style={[styles.tag, selected && styles.tagSelected]}
                                    onPress={() => handleMoneyAmountSelect(amount)}
                                >
                                    <Text style={[styles.tagText, selected && styles.tagTextSelected]}>{amount}€</Text>
                                </TouchableOpacity>
                            );
                        })}
                        <TouchableOpacity
                            style={[styles.tag, rewardType === "money" && showCustomMoney && styles.tagSelected]}
                            onPress={handleCustomMoneyAmount}
                        >
                            <Text style={[styles.tagText, rewardType === "money" && showCustomMoney && styles.tagTextSelected]}>Définir</Text>
                        </TouchableOpacity>
                    </View>
                    {showCustomMoney && (
                        <View style={styles.customInputRow}>
                            <TextInput
                                style={styles.customInput}
                                placeholder="Montant personnalisé"
                                placeholderTextColor={colors.carbon[60]}
                                value={customMoneyAmount}
                                onChangeText={setCustomMoneyAmount}
                                keyboardType="decimal-pad"
                                autoFocus
                            />
                            <Text style={styles.inputSuffix}>€</Text>
                        </View>
                    )}
                </View>

                {/* Récompense (coins) */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Récompense</Text>
                    <View style={styles.tagsRow}>
                        {PREDEFINED_COIN_AMOUNTS.map((amount) => {
                            const selected = rewardType === "coins" && selectedCoinAmount === amount;
                            return (
                                <TouchableOpacity
                                    key={amount}
                                    style={[styles.tag, styles.coinTag, selected && styles.tagSelected]}
                                    onPress={() => handleCoinAmountSelect(amount)}
                                >
                                    <Text style={[styles.tagText, selected && styles.tagTextSelected]}>{amount}</Text>
                                    <View style={!selected && styles.coinEmojiInactive}>
                                        <CoinIcon width={20} height={20} />
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                        <TouchableOpacity
                            style={[styles.tag, rewardType === "coins" && showCustomCoin && styles.tagSelected]}
                            onPress={handleCustomCoinAmount}
                        >
                            <Text style={[styles.tagText, rewardType === "coins" && showCustomCoin && styles.tagTextSelected]}>Définir</Text>
                        </TouchableOpacity>
                    </View>
                    {showCustomCoin && (
                        <View style={styles.customInputRow}>
                            <TextInput
                                style={styles.customInput}
                                placeholder="Nombre de pièces"
                                placeholderTextColor={colors.carbon[60]}
                                value={customCoinAmount}
                                onChangeText={setCustomCoinAmount}
                                keyboardType="number-pad"
                                autoFocus
                            />
                            <CoinIcon width={20} height={20} />
                        </View>
                    )}
                </View>

                {/* Fréquence */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>À quelle fréquence ?</Text>
                    <TouchableOpacity
                        style={[styles.inputContainer, isFrequencyValid() && styles.inputContainerValid]}
                        onPress={() => setFrequencyModalVisible(true)}
                    >
                        <Text style={[styles.textInput, !isFrequencyValid() && { color: colors.carbon[60] }]}>{getFrequencyLabel()}</Text>
                        {isFrequencyValid() ? (
                            <Ionicons name="checkmark-outline" size={18} color={colors.jadegreen[100]} />
                        ) : (
                            <Ionicons name="chevron-forward" size={18} color={colors.carbon[30]} />
                        )}
                    </TouchableOpacity>
                </View>

                <View style={{ height: 160 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.primaryButton, !canCreate && styles.primaryButtonDisabled]}
                    onPress={() => setValidationModalVisible(true)}
                    disabled={!canCreate}
                >
                    <Text style={styles.primaryButtonText}>{loading ? "Création..." : "Créer la tâche"}</Text>
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
    // ── Header ──
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#BFD0EA",
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
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    // ── Content ──
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
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
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.carbon[20],
        paddingHorizontal: 14,
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
    // ── Tags ──
    tagsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.md,
    },
    tag: {
        backgroundColor: colors.carbon[10],
        padding: spacing.sm,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: colors.carbon[20],
    },
    coinTag: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    tagSelected: {
        backgroundColor: colors.primary[20],
        borderColor: colors.primary[100],
    },
    tagText: {
        ...typography.md,
        color: colors.carbon[70],
    },
    tagTextSelected: {
        color: colors.carbon[100],
    },
    coinEmojiInactive: {
        opacity: 0.4,
    },
    // ── Custom input ──
    customInputRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primary[100],
        paddingHorizontal: spacing.base,
        marginTop: spacing.md,
        height: 48,
    },
    customInput: {
        flex: 1,
        ...typography.md,
        color: colors.carbon[100],
    },
    inputSuffix: {
        ...typography.md,
        color: colors.carbon[60],
    },
    // ── Footer ──
    footer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        paddingTop: spacing.base,
    },
    // ── Shared button ──
    primaryButton: {
        backgroundColor: colors.primary[100],
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#4E31CF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    primaryButtonDisabled: {
        backgroundColor: colors.carbon[30],
        shadowColor: "transparent",
        elevation: 0,
    },
    primaryButtonText: {
        color: colors.white,
        ...typography.button,
    },
    // ── Frequency bottom sheet ──
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
        maxHeight: "90%",
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
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
    },
    bottomSheetTitle: {
        fontSize: 20,
        ...typography.bold,
        color: colors.carbon[100],
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    bottomSheetContent: {
        paddingHorizontal: spacing.lg,
    },
    bottomSheetFooter: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: "#BFD0EA",
    },
    // ── Frequency options ──
    frequencyOption: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.carbon[20],
        paddingLeft: 20,
        paddingRight: 12,
        paddingVertical: 12,
        marginBottom: spacing.md,
    },
    frequencyOptionSelected: {
        backgroundColor: colors.primary[10],
        borderColor: colors.primary[100],
    },
    frequencyOptionText: {
        ...typography.md,
        color: colors.carbon[100],
        flex: 1,
    },
    frequencyOptionTextSelected: {
        ...typography.bold,
    },
    // ── Sub-panels (date / weekdays / monthly) ──
    subPanel: {
        backgroundColor: colors.primary[10],
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    subPanelHint: {
        ...typography.sm,
        color: colors.carbon[100],
    },
    weekDaysRow: {
        flexDirection: "row",
        gap: spacing.sm,
    },
    weekDayButton: {
        flex: 1,
        backgroundColor: colors.white,
        paddingVertical: spacing.sm,
        borderRadius: 8,
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
    monthlyDayInput: {
        backgroundColor: colors.white,
        borderRadius: 8,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        ...typography.md,
        color: colors.carbon[100],
        textAlign: "center",
        width: 60,
    },
    // ── Radio ──
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
    // ── Validation modal ──
    modalContainer: {
        flex: 1,
        backgroundColor: colors.white,
    },
    modalSafeArea: {
        flex: 1,
    },
    validationBanner: {
        width: "100%",
        height: 200,
    },
    validationTitle: {
        fontSize: 20,
        ...typography.bold,
        color: colors.carbon[100],
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl,
    },
    validationContent: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },
    radioButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.carbon[20],
        paddingLeft: 20,
        paddingRight: 12,
        paddingVertical: 12,
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
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        paddingTop: spacing.base,
    },
});
