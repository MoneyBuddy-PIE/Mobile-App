import React, { useState, useEffect, useRef } from "react";
import {
    Animated,
    Keyboard,
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Task, TaskType, WeekDay } from "@/types/Task";
import { tasksService } from "@/services/tasksService";
import { colors, spacing, typography } from "@/styles";
import Cross from "@/components/Icons/Cross";
import { CoinIcon } from "@/components/Icons/CoinIcon";
import DatePickerInput from "@/components/DatePickerInput";

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
type Step = "FORM" | "SUCCESS";

type Props = {
    task: Task | null;
    visible: boolean;
    onClose: () => void;
    onSaved: () => void;
    onDeleteRequest: () => void;
};

export default function EditTaskModal({ task, visible, onClose, onSaved, onDeleteRequest }: Props) {
    const [step, setStep] = useState<Step>("FORM");

    // Form state
    const [taskName, setTaskName] = useState("");
    const [rewardType, setRewardType] = useState<RewardType>("money");
    const [selectedMoneyAmount, setSelectedMoneyAmount] = useState("");
    const [customMoneyAmount, setCustomMoneyAmount] = useState("");
    const [showCustomMoney, setShowCustomMoney] = useState(false);
    const [selectedCoinAmount, setSelectedCoinAmount] = useState<number | null>(null);
    const [customCoinAmount, setCustomCoinAmount] = useState("");
    const [showCustomCoin, setShowCustomCoin] = useState(false);
    const [taskType, setTaskType] = useState<TaskType>("PONCTUAL");
    const [selectedWeekDays, setSelectedWeekDays] = useState<WeekDay[]>([]);
    const [monthlyDay, setMonthlyDay] = useState(1);
    const [dateLimit, setDateLimit] = useState<Date | null>(null);
    const [frequencyModalVisible, setFrequencyModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const slideAnim = useRef(new Animated.Value(900)).current;

    // Pre-fill form when task changes
    useEffect(() => {
        if (visible && task) {
            setStep("FORM");
            slideAnim.setValue(900);
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
            setTaskName(task.description);
            setTaskType(task.type);
            setSelectedWeekDays(task.weeklyDays ?? []);
            setMonthlyDay(task.monthlyDay ?? 1);
            setDateLimit(task.dateLimit ? new Date(task.dateLimit) : null);

            if (task.moneyReward > 0) {
                setRewardType("money");
                const moneyStr = task.moneyReward.toString();
                if (PREDEFINED_MONEY_AMOUNTS.includes(moneyStr)) {
                    setSelectedMoneyAmount(moneyStr);
                    setShowCustomMoney(false);
                    setCustomMoneyAmount("");
                } else {
                    setSelectedMoneyAmount("");
                    setShowCustomMoney(true);
                    setCustomMoneyAmount(moneyStr);
                }
                setSelectedCoinAmount(null);
                setShowCustomCoin(false);
                setCustomCoinAmount("");
            } else if (task.coinReward > 0) {
                setRewardType("coins");
                if (PREDEFINED_COIN_AMOUNTS.includes(task.coinReward)) {
                    setSelectedCoinAmount(task.coinReward);
                    setShowCustomCoin(false);
                    setCustomCoinAmount("");
                } else {
                    setSelectedCoinAmount(null);
                    setShowCustomCoin(true);
                    setCustomCoinAmount(task.coinReward.toString());
                }
                setSelectedMoneyAmount("");
                setShowCustomMoney(false);
                setCustomMoneyAmount("");
            }
        }
    }, [visible, task?.id]);

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

    const hasReward = () => getMoneyReward() > 0 || getCoinReward() > 0;

    const isFrequencyValid = (): boolean => {
        if (taskType === "PONCTUAL") return dateLimit !== null;
        if (taskType === "WEEKLY") return selectedWeekDays.length > 0;
        if (taskType === "MONTHLY") return monthlyDay > 0 && monthlyDay <= 31;
        return false;
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

    const toggleWeekDay = (day: WeekDay) => {
        setSelectedWeekDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
    };

    const slideDown = (cb?: () => void) => {
        Keyboard.dismiss();
        Animated.timing(slideAnim, {
            toValue: 900,
            duration: 250,
            useNativeDriver: true,
        }).start(() => cb?.());
    };

    const switchToSuccess = () => {
        Keyboard.dismiss();
        Animated.timing(slideAnim, {
            toValue: 900,
            duration: 220,
            useNativeDriver: true,
        }).start(() => {
            setStep("SUCCESS");
            slideAnim.setValue(900);
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        });
    };

    const handleSave = async () => {
        if (!task) return;
        setLoading(true);
        try {
            await tasksService.updateTask(task.id, {
                description: taskName.trim(),
                type: taskType,
                coinReward: getCoinReward(),
                moneyReward: getMoneyReward(),
                dateLimit: taskType === "PONCTUAL" && dateLimit ? dateLimit.toISOString() : undefined,
                weeklyDays: taskType === "WEEKLY" ? selectedWeekDays : [],
                monthlyDay: taskType === "MONTHLY" ? monthlyDay : 0,
                preValidate: task.preValidate,
            });
            switchToSuccess();
        } catch {
            // keep form visible
        } finally {
            setLoading(false);
        }
    };

    const handleFinish = () => {
        slideDown(() => {
            onSaved();
            onClose();
        });
    };

    const handleClose = () => {
        slideDown(onClose);
    };

    const handleDeletePress = () => {
        slideDown(() => {
            onDeleteRequest();
        });
    };

    const canSave = taskName.trim() && hasReward() && isFrequencyValid() && !loading;

    if (!visible || !task) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
            <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                {/* Dimmed backdrop */}
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={step === "FORM" ? handleClose : undefined} />

                <Animated.View style={[step === "SUCCESS" ? styles.successCard : styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
                    {step === "SUCCESS" ? (
                        /* ── Success state ── */
                        <>
                            <TouchableOpacity style={styles.closeBtnGrey} onPress={handleFinish}>
                                <Ionicons name="close" size={20} color="#2F2F2F" />
                            </TouchableOpacity>

                            <View style={styles.iconContainer}>
                                <Ionicons name="checkmark-circle" size={40} color="#16AA75" />
                            </View>

                            <Text style={styles.successTitle}>La tâche a été modifiée !</Text>

                            <TouchableOpacity style={[styles.btn, styles.btnPrimary, { width: "100%" }]} onPress={handleFinish}>
                                <Text style={styles.btnWhiteText}>Terminer</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        /* ── Edit form bottom sheet ── */
                        <>
                            {/* Handle */}
                            <View style={styles.handle} />

                            {/* Sheet header */}
                            <View style={styles.sheetHeader}>
                                <Text style={styles.sheetTitle}>Modifier cette tâche</Text>
                                <TouchableOpacity style={styles.closeBtnDark} onPress={handleClose}>
                                    <Cross width={24} height={24} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                                {/* Task name */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionLabel}>Nom de la tâche</Text>
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

                                {/* Money amount */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionLabel}>Montant attribué</Text>
                                    <View style={styles.tagsRow}>
                                        {PREDEFINED_MONEY_AMOUNTS.map((amount) => {
                                            const selected = rewardType === "money" && selectedMoneyAmount === amount;
                                            return (
                                                <TouchableOpacity
                                                    key={amount}
                                                    style={[styles.tag, selected && styles.tagSelected]}
                                                    onPress={() => {
                                                        setRewardType("money");
                                                        setSelectedMoneyAmount(amount);
                                                        setShowCustomMoney(false);
                                                        setCustomMoneyAmount("");
                                                        setSelectedCoinAmount(null);
                                                        setShowCustomCoin(false);
                                                        setCustomCoinAmount("");
                                                    }}
                                                >
                                                    <Text style={[styles.tagText, selected && styles.tagTextSelected]}>{amount}€</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                        <TouchableOpacity
                                            style={[styles.tag, rewardType === "money" && showCustomMoney && styles.tagSelected]}
                                            onPress={() => {
                                                setRewardType("money");
                                                setShowCustomMoney(true);
                                                setSelectedMoneyAmount("");
                                                setSelectedCoinAmount(null);
                                                setShowCustomCoin(false);
                                                setCustomCoinAmount("");
                                            }}
                                        >
                                            <Text style={[styles.tagText, rewardType === "money" && showCustomMoney && styles.tagTextSelected]}>
                                                Définir
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    {showCustomMoney && rewardType === "money" && (
                                        <View style={styles.customInputRow}>
                                            <TextInput
                                                style={styles.customInput}
                                                placeholder="Montant personnalisé"
                                                placeholderTextColor={colors.carbon[60]}
                                                value={customMoneyAmount}
                                                onChangeText={setCustomMoneyAmount}
                                                keyboardType="decimal-pad"
                                            />
                                            <Text style={styles.inputSuffix}>€</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Coin reward */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionLabel}>Récompense</Text>
                                    <View style={styles.tagsRow}>
                                        {PREDEFINED_COIN_AMOUNTS.map((amount) => {
                                            const selected = rewardType === "coins" && selectedCoinAmount === amount;
                                            return (
                                                <TouchableOpacity
                                                    key={amount}
                                                    style={[styles.tag, styles.coinTag, selected && styles.tagSelected]}
                                                    onPress={() => {
                                                        setRewardType("coins");
                                                        setSelectedCoinAmount(amount);
                                                        setShowCustomCoin(false);
                                                        setCustomCoinAmount("");
                                                        setSelectedMoneyAmount("");
                                                        setShowCustomMoney(false);
                                                        setCustomMoneyAmount("");
                                                    }}
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
                                            onPress={() => {
                                                setRewardType("coins");
                                                setShowCustomCoin(true);
                                                setSelectedCoinAmount(null);
                                                setSelectedMoneyAmount("");
                                                setShowCustomMoney(false);
                                                setCustomMoneyAmount("");
                                            }}
                                        >
                                            <Text style={[styles.tagText, rewardType === "coins" && showCustomCoin && styles.tagTextSelected]}>
                                                Définir
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    {showCustomCoin && rewardType === "coins" && (
                                        <View style={styles.customInputRow}>
                                            <TextInput
                                                style={styles.customInput}
                                                placeholder="Nombre de pièces"
                                                placeholderTextColor={colors.carbon[60]}
                                                value={customCoinAmount}
                                                onChangeText={setCustomCoinAmount}
                                                keyboardType="number-pad"
                                            />
                                            <CoinIcon width={20} height={20} />
                                        </View>
                                    )}
                                </View>

                                {/* Frequency */}
                                <View style={styles.section}>
                                    <Text style={styles.sectionLabel}>À quelle fréquence ?</Text>
                                    <TouchableOpacity
                                        style={[styles.inputContainer, isFrequencyValid() && styles.inputContainerValid]}
                                        onPress={() => setFrequencyModalVisible(true)}
                                    >
                                        <Text style={[styles.textInput, !isFrequencyValid() && { color: colors.carbon[60] }]}>
                                            {getFrequencyLabel()}
                                        </Text>
                                        {isFrequencyValid() ? (
                                            <Ionicons name="checkmark-outline" size={18} color={colors.jadegreen[100]} />
                                        ) : (
                                            <Ionicons name="chevron-forward" size={18} color={colors.carbon[30]} />
                                        )}
                                    </TouchableOpacity>
                                </View>

                                <View style={{ height: 160 }} />
                            </ScrollView>

                            {/* Footer actions */}
                            <View style={styles.footer}>
                                <TouchableOpacity style={styles.deleteBtn} onPress={handleDeletePress}>
                                    <Ionicons name="trash-outline" size={24} color={colors.white} />
                                </TouchableOpacity>

                                <View style={styles.footerRight}>
                                    <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                                        <Text style={styles.cancelBtnText}>Annuler</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.okBtn, !canSave && styles.okBtnDisabled]}
                                        onPress={handleSave}
                                        disabled={!canSave}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color={colors.white} size="small" />
                                        ) : (
                                            <>
                                                <Text style={styles.okBtnText}>OK</Text>
                                                <Ionicons name="checkmark-outline" size={24} color={colors.white} />
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </>
                    )}
                </Animated.View>

                {/* Frequency picker sub-modal */}
                <Modal visible={frequencyModalVisible} animationType="slide" transparent>
                    <View style={styles.subModalOverlay}>
                        <View style={styles.bottomSheet}>
                            <View style={styles.bottomSheetHandle} />

                            <View style={styles.bottomSheetHeader}>
                                <TouchableOpacity style={styles.closeBtnDark} onPress={() => setFrequencyModalVisible(false)}>
                                    <Cross width={24} height={24} />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.bottomSheetTitle}>On programme ça à quelle fréquence ?</Text>

                            <ScrollView style={styles.bottomSheetContent} showsVerticalScrollIndicator={false}>
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
                                    style={[styles.btn, styles.btnPrimary, !isFrequencyValid() && styles.btnDisabled]}
                                    onPress={() => setFrequencyModalVisible(false)}
                                    disabled={!isFrequencyValid()}
                                >
                                    <Text style={styles.btnWhiteText}>Appliquer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(47,47,47,0.3)",
    },
    // ── Success card ──
    successCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        paddingTop: 24,
        marginHorizontal: 16,
        marginBottom: 40,
        alignItems: "center",
        gap: 16,
        overflow: "hidden",
    },
    successTitle: {
        ...typography.bold,
        fontSize: 20,
        color: colors.carbon[100],
        textAlign: "center",
    },
    iconContainer: {
        backgroundColor: "rgba(155,255,226,0.3)",
        padding: 16,
        borderRadius: 16,
        marginTop: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    closeBtnGrey: {
        position: "absolute",
        top: 16,
        right: 16,
        backgroundColor: "#D5D5D5",
        borderRadius: 8,
        padding: 12,
    },
    // ── Edit bottom sheet ──
    sheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "90%",
    },
    handle: {
        width: 109,
        height: 5,
        backgroundColor: colors.carbon[100],
        borderRadius: 24,
        alignSelf: "center",
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
    },
    sheetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#BFD0EA",
    },
    sheetTitle: {
        ...typography.bold,
        fontSize: 20,
        color: colors.carbon[100],
    },
    closeBtnDark: {
        width: 48,
        height: 48,
        backgroundColor: colors.carbon[100],
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContent: {
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
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.base,
        paddingBottom: spacing.xl + spacing.base,
        borderTopWidth: 1,
        borderTopColor: "#BFD0EA",
    },
    deleteBtn: {
        width: 48,
        height: 48,
        backgroundColor: colors.pink[100],
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#D1325E",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    footerRight: {
        flexDirection: "row",
        gap: spacing.base,
        alignItems: "center",
    },
    cancelBtn: {
        backgroundColor: colors.carbon[20],
        paddingVertical: 12,
        paddingHorizontal: spacing.base,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: colors.carbon[50],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
        minWidth: 100,
    },
    cancelBtnText: {
        ...typography.bold,
        fontSize: 16,
        color: colors.carbon[80],
    },
    okBtn: {
        flexDirection: "row",
        gap: spacing.sm,
        backgroundColor: colors.primary[100],
        paddingVertical: 12,
        paddingHorizontal: spacing.base,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#4E31CF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    okBtnDisabled: {
        backgroundColor: colors.carbon[30],
        shadowColor: "transparent",
        elevation: 0,
    },
    okBtnText: {
        ...typography.bold,
        fontSize: 16,
        color: colors.white,
    },
    // ── Shared button ──
    btn: {
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: spacing.base,
        alignItems: "center",
        justifyContent: "center",
    },
    btnPrimary: {
        backgroundColor: colors.primary[100],
        shadowColor: "#4E31CF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    btnDisabled: {
        backgroundColor: colors.carbon[30],
        shadowColor: "transparent",
        elevation: 0,
    },
    btnWhiteText: {
        ...typography.bold,
        fontSize: 16,
        color: colors.white,
    },
    // ── Frequency picker sub-modal ──
    subModalOverlay: {
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
    subPanel: {
        backgroundColor: colors.primary[10],
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: spacing.base,
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
});
