import React, { useState, useEffect } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Dimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { UserStorage } from "@/utils/storage";
import { transactionService } from "@/services/transactionService";
import { userService } from "@/services/userService";
import { logger } from "@/utils/logger";
import { categories } from "@/utils/fn/getIconFromCategory";
import DatePickerInput from "@/components/DatePickerInput";
import SpendReceipt from "@/components/SpendReceipt";
import { colors, typography, spacing } from "@/styles";
import { CATEGORY_ICONS } from "@/utils/fn/getIconFromCategory";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const GRID_PADDING = spacing.xl * 2;
const GRID_GAP = 12;
const ITEM_WIDTH = (SCREEN_WIDTH - GRID_PADDING - GRID_GAP * 3) / 4;

interface AddExpenseSheetProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AddExpenseSheet({ visible, onClose, onSuccess }: AddExpenseSheetProps) {
    const [step, setStep] = useState<"form" | "receipt">("form");
    const [amount, setAmount] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [date, setDate] = useState<Date | null>(new Date());
    const [details, setDetails] = useState("");
    const [loading, setLoading] = useState(false);
    const [submittedAmount, setSubmittedAmount] = useState("");
    const [submittedDate, setSubmittedDate] = useState(new Date());
    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
        if (!visible) return;
        userService
            .getSubAccount()
            .then((sub) => {
                setBalance(sub.money ?? null);
            })
            .catch(() => {});
    }, [visible]);

    const resetForm = () => {
        setStep("form");
        setAmount("");
        setSelectedCategory(null);
        setDate(new Date());
        setDetails("");
        setLoading(false);
        setBalance(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const parsedAmount = parseFloat(amount);
    const isOverBalance = balance !== null && !isNaN(parsedAmount) && parsedAmount > balance;
    const isFormValid = amount.trim() !== "" && parsedAmount > 0 && selectedCategory !== null && !isOverBalance;

    const handleSubmit = async () => {
        if (!isFormValid) return;
        setLoading(true);
        try {
            const subAccount = await UserStorage.getSubAccount();
            if (!subAccount) {
                Alert.alert("Erreur", "Impossible de récupérer les informations du compte");
                return;
            }

            const description = details.trim() || categories.find((c) => c.value === selectedCategory)?.label || "";
            const result = await transactionService.addExpense({
                subAccountId: subAccount.id,
                amount: parseFloat(amount),
                emoji: selectedCategory!,
                description,
            });

            if (result.success) {
                setSubmittedAmount(amount);
                setSubmittedDate(date ?? new Date());
                setStep("receipt");
                onSuccess?.();
            } else {
                Alert.alert("Erreur", result.message || "Impossible d'enregistrer la dépense");
            }
        } catch (error: any) {
            logger.error("Error adding expense:", error);
            Alert.alert("Erreur", "Une erreur inattendue s'est produite");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={styles.overlay}>
                    <View style={[styles.sheet, step === "receipt" && styles.sheetReceipt]}>
                        {/* Handle */}
                        <View style={styles.handle} />

                        {step === "form" ? (
                            <>
                                {/* Header */}
                                <View style={styles.header}>
                                    <Text style={styles.title}>Ajouter une dépense</Text>
                                    <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                                        <Ionicons name="close" size={24} color="#fff" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView
                                    style={styles.scrollContent}
                                    contentContainerStyle={styles.scrollContentContainer}
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                >
                                    {/* Amount */}
                                    <View style={styles.amountBox}>
                                        <TextInput
                                            style={[styles.amountText, !amount && styles.amountTextPlaceholder]}
                                            value={amount}
                                            onChangeText={setAmount}
                                            keyboardType="decimal-pad"
                                            placeholder="0.00"
                                            placeholderTextColor="#979797"
                                        />
                                        <Text style={[styles.amountCurrency, !amount && styles.amountTextPlaceholder]}> €</Text>
                                    </View>

                                    {isOverBalance && (
                                        <Text style={styles.balanceError}>Solde insuffisant — tu as {balance?.toFixed(2)} € disponible</Text>
                                    )}

                                    {/* Category */}
                                    <Text style={styles.categoryLabel}>Quel type de dépense est-ce-que c'est ?</Text>
                                    <View style={styles.categoryGrid}>
                                        {categories.map((cat) => (
                                            <TouchableOpacity
                                                key={cat.value}
                                                style={[styles.categoryItem, selectedCategory === cat.value && styles.categoryItemSelected]}
                                                onPress={() => setSelectedCategory(cat.value)}
                                            >
                                                {(() => {
                                                    const Icon = CATEGORY_ICONS[cat.value];
                                                    return Icon ? (
                                                        <Icon
                                                            width={24}
                                                            height={24}
                                                            color={selectedCategory === cat.value ? colors.primary[100] : "#6e6e6e"}
                                                        />
                                                    ) : null;
                                                })()}
                                                <Text
                                                    style={[
                                                        styles.categoryItemLabel,
                                                        selectedCategory === cat.value && styles.categoryItemLabelSelected,
                                                    ]}
                                                >
                                                    {cat.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {/* Date */}
                                    <View style={styles.dateRow}>
                                        <DatePickerInput
                                            value={date}
                                            onChange={setDate}
                                            minYear={new Date().getFullYear() - 5}
                                            maxYear={new Date().getFullYear()}
                                        />
                                    </View>

                                    {/* Details */}
                                    <View style={styles.detailsSection}>
                                        <Text style={styles.detailsHint}>Détails</Text>
                                        <View style={styles.detailsInputRow}>
                                            <TextInput
                                                style={styles.detailsTextInput}
                                                value={details}
                                                onChangeText={setDetails}
                                                placeholder="Ajoute un petit détail si tu veux !"
                                                placeholderTextColor="#828282"
                                                maxLength={100}
                                            />
                                            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#979797" />
                                        </View>
                                    </View>
                                </ScrollView>

                                {/* Submit */}
                                <View style={styles.footer}>
                                    <TouchableOpacity
                                        style={[styles.submitBtn, (!isFormValid || loading) && styles.submitBtnDisabled]}
                                        onPress={handleSubmit}
                                        disabled={!isFormValid || loading}
                                    >
                                        <Text style={[styles.submitBtnText, (!isFormValid || loading) && styles.submitBtnTextDisabled]}>
                                            {loading ? "Enregistrement..." : "Enregistrer"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <>
                                {/* Receipt header */}
                                <View style={styles.receiptHeader}>
                                    <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                                        <Ionicons name="close" size={24} color="#fff" />
                                    </TouchableOpacity>
                                </View>

                                {/* Receipt */}
                                <View style={styles.receiptContainer}>
                                    <SpendReceipt
                                        amount={submittedAmount}
                                        categoryEmoji={selectedCategory ?? "other"}
                                        description={details.trim() || undefined}
                                        date={submittedDate}
                                    />
                                </View>

                                {/* Receipt footer */}
                                <View style={styles.receiptFooter}>
                                    <TouchableOpacity style={styles.backBtn} onPress={() => setStep("form")}>
                                        <Ionicons name="arrow-back" size={24} color="#2F2F2F" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.validateBtn} onPress={handleClose}>
                                        <Text style={styles.validateBtnText}>Valider</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    sheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: SCREEN_HEIGHT * 0.92,
    },
    sheetReceipt: {
        backgroundColor: "#EBF2FB",
    },

    handle: {
        width: 109,
        height: 5,
        backgroundColor: "#2F2F2F",
        borderRadius: 24,
        alignSelf: "center",
        marginTop: 8,
        marginBottom: 4,
    },

    // Form header
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xl,
        paddingBottom: spacing.base,
    },
    title: {
        ...typography.bold,
        ...typography.xl,
        color: colors.carbon[100],
    },
    closeBtn: {
        width: 48,
        height: 48,
        backgroundColor: colors.carbon[100],
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },

    // Scroll
    scrollContent: {
        flex: 1,
    },
    scrollContentContainer: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl,
        gap: spacing.base,
    },

    // Amount
    amountBox: {
        backgroundColor: "#EBF2FB",
        borderRadius: 4,
        paddingVertical: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    amountText: {
        fontFamily: "DMSans_700Bold",
        fontWeight: "bold",
        fontSize: 40,
        color: colors.carbon[100],
        textAlign: "center",
        minWidth: 80,
    },
    amountTextPlaceholder: {
        color: "#979797",
    },
    balanceError: {
        fontFamily: "DMSans_600SemiBold",
        fontSize: 13,
        color: "#E53935",
        textAlign: "center",
        marginTop: -4,
    },
    amountCurrency: {
        fontFamily: "DMSans_700Bold",
        fontWeight: "bold",
        fontSize: 40,
        color: colors.carbon[100],
    },

    // Category
    categoryLabel: {
        ...typography.regular,
        fontSize: 14,
        color: colors.carbon[100],
    },
    categoryGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: GRID_GAP,
    },
    categoryItem: {
        width: ITEM_WIDTH,
        backgroundColor: colors.carbon[10],
        borderWidth: 1.5,
        borderColor: colors.carbon[20],
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 4,
        alignItems: "center",
        gap: 4,
    },
    categoryItemSelected: {
        backgroundColor: colors.primary[20],
        borderColor: colors.primary[100],
    },

    categoryItemLabel: {
        fontFamily: "DMSans_400Regular",
        fontSize: 12,
        color: colors.carbon[70],
        textAlign: "center",
    },
    categoryItemLabelSelected: {
        fontFamily: "DMSans_600SemiBold",
        color: colors.carbon[100],
    },

    // Date
    dateRow: {
        // DatePickerInput handles its own styling
    },

    // Details
    detailsSection: {
        gap: spacing.sm,
    },
    detailsHint: {
        ...typography.regular,
        fontSize: 14,
        color: colors.carbon[100],
    },
    detailsInputRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: colors.carbon[20],
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 8,
    },
    detailsTextInput: {
        flex: 1,
        fontFamily: "DMSans_400Regular",
        fontSize: 16,
        color: colors.carbon[100],
    },

    // Submit footer
    footer: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing["3xl"],
        paddingTop: spacing.base,
    },
    submitBtn: {
        backgroundColor: "#16AA75",
        paddingVertical: spacing.base,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#005C49",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    submitBtnDisabled: {
        backgroundColor: colors.carbon[20],
        shadowOpacity: 0,
        elevation: 0,
    },
    submitBtnText: {
        fontFamily: "DMSans_700Bold",
        fontSize: 20,
        color: "#fff",
    },
    submitBtnTextDisabled: {
        color: colors.carbon[60],
    },

    // Receipt
    receiptHeader: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xl,
        paddingBottom: spacing.sm,
    },
    receiptContainer: {
        flex: 1,
    },
    receiptFooter: {
        flexDirection: "row",
        gap: spacing.base,
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing["3xl"],
        paddingTop: spacing.base,
    },
    backBtn: {
        width: 68,
        height: 68,
        backgroundColor: "#fff",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#EBF2FB",
        shadowColor: "#BFD0EA",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    validateBtn: {
        flex: 1,
        height: 68,
        backgroundColor: "#16AA75",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#005C49",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    validateBtnText: {
        fontFamily: "DMSans_700Bold",
        fontSize: 20,
        color: "#fff",
    },
});
