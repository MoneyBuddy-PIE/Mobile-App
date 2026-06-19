import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { goalsService } from "@/services/goalService";
import { Goal } from "@/types/Goal";
import { formatMoney } from "@/utils/money";
import { typography } from "@/styles";
import CheckCircleIcon from "@/components/Icons/CheckCircleIcon";

type SheetState = "edit" | "confirmDelete" | "deleteSuccess" | "editSuccess";

interface Props {
    visible: boolean;
    goal: Goal;
    onClose: () => void;
    onGoalUpdated: (updated: Goal) => void;
    onGoalDeleted: () => void;
}

const UpdateGoalSheet: React.FC<Props> = ({ visible, goal, onClose, onGoalUpdated, onGoalDeleted }) => {
    const [state, setState] = useState<SheetState>("edit");
    const [name, setName] = useState(goal.name);
    const [amount, setAmount] = useState(String(goal.amount));
    const [loading, setLoading] = useState(false);
    const [updatedGoal, setUpdatedGoal] = useState<Goal | null>(null);
    const slideAnim = useRef(new Animated.Value(900)).current;

    const depositAmount = (goal.amount * goal.progression) / 100;

    useEffect(() => {
        if (visible) {
            setState("edit");
            setName(goal.name);
            setAmount(String(goal.amount));
            setUpdatedGoal(null);
            slideAnim.setValue(900);
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        }
    }, [visible]);

    const slideDown = (cb?: () => void) => {
        Keyboard.dismiss();
        Animated.timing(slideAnim, {
            toValue: 900,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            onClose();
            cb?.();
        });
    };

    const switchState = (next: SheetState) => {
        Keyboard.dismiss();
        Animated.timing(slideAnim, {
            toValue: 900,
            duration: 220,
            useNativeDriver: true,
        }).start(() => {
            setState(next);
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
        if (loading) return;
        Keyboard.dismiss();
        setLoading(true);
        try {
            const updated = await goalsService.updateGoal(goal.id, {
                name: name.trim() || goal.name,
                amount: parseFloat(amount) || goal.amount,
            });
            setUpdatedGoal(updated);
            switchState("editSuccess");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (loading) return;
        setLoading(true);
        try {
            await goalsService.deleteGoal(goal.id);
            switchState("deleteSuccess");
        } finally {
            setLoading(false);
        }
    };

    const handleFinish = () => {
        if (state === "deleteSuccess") {
            slideDown(onGoalDeleted);
        } else {
            slideDown(() => {
                if (updatedGoal) onGoalUpdated(updatedGoal);
            });
        }
    };

    if (!visible) return null;

    return (
        <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={() => slideDown()}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <View style={styles.overlay}>
                    {state === "edit" && (
                        <TouchableWithoutFeedback onPress={() => slideDown()}>
                            <View style={StyleSheet.absoluteFill} />
                        </TouchableWithoutFeedback>
                    )}
                    <Animated.View style={[styles.sheet, state !== "edit" && styles.sheetCompact, { transform: [{ translateY: slideAnim }] }]}>
                        {state === "edit" && (
                            <>
                                {/* Handle */}
                                <View style={styles.handleWrap}>
                                    <View style={styles.handle} />
                                </View>

                                {/* Header */}
                                <View style={styles.editHeader}>
                                    <Text style={styles.editTitle}>Modifier cet objectif</Text>
                                    <TouchableOpacity style={styles.closeBtn} onPress={() => slideDown()}>
                                        <Ionicons name="close" size={20} color="#fff" />
                                    </TouchableOpacity>
                                </View>

                                {/* Body */}
                                <ScrollView
                                    contentContainerStyle={styles.editBody}
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={false}
                                >
                                    {/* Emoji with pencil badge */}
                                    <View style={styles.emojiContainer}>
                                        <View style={styles.emojiBadge}>
                                            <Text style={styles.emojiText}>{goal.emoji ?? "🎯"}</Text>
                                        </View>
                                        <View style={styles.pencilBadge}>
                                            <Ionicons name="pencil" size={10} color="#fff" />
                                        </View>
                                    </View>

                                    {/* Name field */}
                                    <View style={styles.fieldWrap}>
                                        <Text style={styles.fieldLabel}>Nom de l'objectif</Text>
                                        <View style={styles.inputRow}>
                                            <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor="#ACACAC" />
                                            <Ionicons name="checkmark" size={18} color="#16AA75" />
                                        </View>
                                    </View>

                                    {/* Amount field */}
                                    <View style={styles.fieldWrap}>
                                        <Text style={styles.fieldLabel}>Combien souhaites tu économiser ?</Text>
                                        <View style={styles.amountBox}>
                                            <TextInput
                                                style={[styles.amountInput, typography.bold]}
                                                value={amount}
                                                onChangeText={setAmount}
                                                keyboardType="decimal-pad"
                                                placeholderTextColor="#ACACAC"
                                            />
                                            <Text style={[styles.amountSuffix, typography.bold]}>€</Text>
                                        </View>
                                    </View>
                                </ScrollView>

                                {/* Bottom bar */}
                                <View style={styles.editBottom}>
                                    <TouchableOpacity style={styles.trashBtn} onPress={() => switchState("confirmDelete")}>
                                        <Ionicons name="trash" size={24} color="#fff" />
                                    </TouchableOpacity>
                                    <View style={styles.editActions}>
                                        <TouchableOpacity style={styles.cancelBtn} onPress={() => slideDown()}>
                                            <Text style={styles.cancelText}>Annuler</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
                                            onPress={handleSave}
                                            disabled={loading}
                                        >
                                            <Text style={styles.saveBtnText}>Enregistrer</Text>
                                            <Ionicons name="checkmark" size={20} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </>
                        )}

                        {state === "confirmDelete" && (
                            <View style={styles.modalContent}>
                                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => switchState("edit")}>
                                    <Ionicons name="close" size={20} color="#2F2F2F" />
                                </TouchableOpacity>
                                <View style={[styles.iconCircle, { backgroundColor: "rgba(254,160,186,0.4)" }]}>
                                    <Ionicons name="trash" size={40} color="#FD618C" />
                                </View>
                                <View style={styles.modalTextWrap}>
                                    <Text style={styles.modalTitle}>Supprimer cet objectif</Text>
                                    <Text style={styles.modalBody}>
                                        {"Es-tu sûr de vouloir supprimer cet objectif ? "}
                                        <Text style={styles.modalBodyBold}>{formatMoney(depositAmount)}€ sera transféré</Text>
                                        {" vers ton solde courant."}
                                    </Text>
                                </View>
                                <View style={styles.modalBtns}>
                                    <TouchableOpacity
                                        style={[
                                            styles.primaryBtn,
                                            { backgroundColor: "#FD618C", shadowColor: "#D1325E" },
                                            loading && { opacity: 0.7 },
                                        ]}
                                        onPress={handleDeleteConfirm}
                                        disabled={loading}
                                    >
                                        <Text style={styles.primaryBtnText}>Supprimer cet objectif</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.grayBtn} onPress={() => switchState("edit")}>
                                        <Text style={styles.grayBtnText}>Annuler</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {(state === "deleteSuccess" || state === "editSuccess") && (
                            <View style={styles.modalContent}>
                                <TouchableOpacity style={styles.modalCloseBtn} onPress={handleFinish}>
                                    <Ionicons name="close" size={20} color="#2F2F2F" />
                                </TouchableOpacity>
                                <View
                                    style={[
                                        styles.iconCircle,
                                        state === "deleteSuccess"
                                            ? { backgroundColor: "rgba(254,160,186,0.4)" }
                                            : { backgroundColor: "rgba(155,255,226,0.3)" },
                                    ]}
                                >
                                    <CheckCircleIcon width={40} height={40} color={state === "deleteSuccess" ? "#FD618C" : "#16AA75"} />
                                </View>
                                <View style={styles.modalTextWrap}>
                                    <Text style={styles.modalTitle}>{state === "deleteSuccess" ? "Objectif supprimé" : "Objectif modifié"}</Text>
                                    <Text style={styles.modalBody}>
                                        {state === "deleteSuccess" ? (
                                            <>
                                                <Text style={styles.modalBodyBold}>{formatMoney(depositAmount)}€ a été transféré</Text>
                                                {" vers ton solde courant."}
                                            </>
                                        ) : (
                                            "Tes modifications ont bien été enregistrées."
                                        )}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.primaryBtn, { backgroundColor: "#16AA75", shadowColor: "#005C49" }]}
                                    onPress={handleFinish}
                                >
                                    <Text style={styles.primaryBtnText}>Terminer</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Animated.View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(47,47,47,0.3)",
        justifyContent: "flex-end",
    },
    // Sheet containers
    sheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: "hidden",
    },
    sheetCompact: {
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 40,
    },
    // Handle
    handleWrap: {
        alignItems: "center",
        paddingTop: 8,
        paddingBottom: 4,
    },
    handle: {
        width: 108,
        height: 5,
        backgroundColor: "#2F2F2F",
        borderRadius: 24,
    },
    // Edit — Header
    editHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderBottomWidth: 2,
        borderBottomColor: "#BFD0EA",
    },
    editTitle: {
        fontFamily: "DMSans_700Bold",
        fontSize: 20,
        color: "#2F2F2F",
    },
    closeBtn: {
        backgroundColor: "#2F2F2F",
        borderRadius: 8,
        padding: 12,
    },
    // Edit — Body
    editBody: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
        gap: 24,
        alignItems: "center",
    },
    emojiContainer: {
        position: "relative",
    },
    emojiBadge: {
        width: 60,
        height: 60,
        backgroundColor: "#75B7FF",
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
    },
    emojiText: {
        fontSize: 32,
    },
    pencilBadge: {
        position: "absolute",
        bottom: -6,
        right: -6,
        backgroundColor: "#846DED",
        borderRadius: 4,
        padding: 4,
        shadowColor: "#4E31CF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    fieldWrap: {
        width: "100%",
        gap: 12,
    },
    fieldLabel: {
        fontFamily: "DMSans_400Regular",
        fontSize: 14,
        color: "#2F2F2F",
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#16AA75",
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#2F2F2F",
    },
    amountBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#EBF2FB",
        borderRadius: 4,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    amountInput: {
        fontFamily: "DMSans_800ExtraBold",
        fontSize: 40,
        color: "#2F2F2F",
        textAlign: "center",
        minWidth: 80,
    },
    amountSuffix: {
        fontFamily: "DMSans_800ExtraBold",
        fontSize: 40,
        color: "#2F2F2F",
    },
    // Edit — Bottom bar
    editBottom: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopColor: "#BFD0EA",
        backgroundColor: "#fff",
    },
    trashBtn: {
        backgroundColor: "#FD618C",
        borderRadius: 8,
        padding: 12,
        shadowColor: "#D1325E",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    editActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    cancelBtn: {
        backgroundColor: "#D5D5D5",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
        shadowColor: "#979797",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
        width: 104,
        alignItems: "center",
    },
    cancelText: {
        fontFamily: "DMSans_700Bold",
        fontSize: 16,
        color: "#6A6A6A",
    },
    saveBtn: {
        backgroundColor: "#16AA75",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        shadowColor: "#005C49",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    saveBtnText: {
        fontFamily: "DMSans_700Bold",
        fontSize: 16,
        color: "#fff",
    },
    // Modal content (confirm / success)
    modalContent: {
        padding: 16,
        paddingTop: 24,
        gap: 24,
        alignItems: "center",
    },
    modalCloseBtn: {
        position: "absolute",
        top: 16,
        right: 16,
        backgroundColor: "#D5D5D5",
        borderRadius: 8,
        padding: 12,
    },
    iconCircle: {
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 16,
    },
    modalTextWrap: {
        gap: 8,
        alignItems: "center",
    },
    modalTitle: {
        fontFamily: "DMSans_700Bold",
        fontSize: 20,
        color: "#2F2F2F",
        textAlign: "center",
    },
    modalBody: {
        fontFamily: "DMSans_400Regular",
        fontSize: 16,
        color: "#2F2F2F",
        textAlign: "center",
        lineHeight: 22,
    },
    modalBodyBold: {
        fontFamily: "DMSans_700Bold",
        fontSize: 16,
    },
    modalBtns: {
        width: "100%",
        gap: 16,
        paddingBottom: 8,
    },
    primaryBtn: {
        width: "100%",
        alignItems: "center",
        paddingVertical: 20,
        borderRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    primaryBtnText: {
        fontFamily: "DMSans_700Bold",
        fontSize: 16,
        color: "#fff",
    },
    grayBtn: {
        width: "100%",
        alignItems: "center",
        paddingVertical: 20,
        borderRadius: 8,
        backgroundColor: "#D5D5D5",
    },
    grayBtnText: {
        fontFamily: "DMSans_700Bold",
        fontSize: 16,
        color: "#6A6A6A",
    },
});

export default UpdateGoalSheet;
