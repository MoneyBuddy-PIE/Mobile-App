import { Goal, GoalStatus } from "@/types/Goal";
import { goalsService } from "@/services/goalService";
import { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert,
    TextInput,
    Modal,
    Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CircularProgress from "@/components/CircualProgress";
import GoalForm from "@/components/forms/GoalForm";

const DEPOSIT_PRESETS = ["1", "5", "10", "20"];

function GoalStatusBadge({ status }: { status: GoalStatus }) {
    const config = {
        [GoalStatus.ACTIVATED]: { label: "En cours", bg: "#E1FFF6", color: "#16AA75" },
        [GoalStatus.DONE]: { label: "Objectif atteint ! 🎉", bg: "#E6E2FB", color: "#846DED" },
        [GoalStatus.USED]: { label: "Utilisé", bg: "#F0F0F0", color: "#828282" },
    }[status];

    return (
        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
            <Text style={[styles.statusBadgeText, { color: config.color }]}>{config.label}</Text>
        </View>
    );
}

export default function GoalDetailScreen() {
    const params = useLocalSearchParams<{ goal: string; childId: string; childName: string }>();
    const [goal, setGoal] = useState<Goal>(() => JSON.parse(params.goal ?? "{}") as Goal);
    const childId = params.childId ?? "";
    const childName = params.childName ?? "";

    const [showEditModal, setShowEditModal] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState(false);

    const [depositPreset, setDepositPreset] = useState("");
    const [depositCustom, setDepositCustom] = useState("");
    const [depositLoading, setDepositLoading] = useState(false);

    const [actionLoading, setActionLoading] = useState(false);

    const depositAmount = parseFloat(depositPreset || depositCustom);
    const isDepositValid = !isNaN(depositAmount) && depositAmount > 0;

    const deposited = goal.depositStatement ?? 0;
    const target = goal.amount ?? 0;
    const remaining = Math.max(0, target - deposited);
    const isReached = goal.progression >= 100;

    function handleDepositPreset(v: string) {
        setDepositPreset(v);
        setDepositCustom("");
    }

    function handleDepositCustom(v: string) {
        setDepositCustom(v);
        setDepositPreset("");
    }

    function resetDepositForm() {
        setDepositPreset("");
        setDepositCustom("");
    }

    async function handleDeposit() {
        if (!isDepositValid) return;
        setDepositLoading(true);
        try {
            const updated = await goalsService.depositToGoal(goal.id, { depositAmount });
            setGoal(updated);
            setShowDepositModal(false);
            resetDepositForm();
            if (updated.progression >= 100) {
                Alert.alert("🎉 Objectif atteint !", "Bravo ! Tu peux maintenant valider ton objectif.");
            }
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Impossible d'effectuer le versement";
            Alert.alert("Erreur", msg);
        } finally {
            setDepositLoading(false);
        }
    }

    async function handleComplete() {
        Alert.alert(
            "Valider l'objectif",
            "Es-tu sûr de vouloir valider cet objectif ? Tu pourras ensuite utiliser l'argent épargné.",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Valider",
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            const updated = await goalsService.completeGoal(goal.id);
                            setGoal(updated);
                        } catch (error: any) {
                            const msg = error?.response?.data?.message || "Impossible de valider l'objectif";
                            Alert.alert("Erreur", msg);
                        } finally {
                            setActionLoading(false);
                        }
                    },
                },
            ]
        );
    }

    async function handleUse() {
        Alert.alert(
            "Utiliser l'épargne",
            `Tu vas récupérer ${deposited.toFixed(2)}€ dans ton compte. Cette action est irréversible.`,
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Récupérer",
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            const updated = await goalsService.useGoal(goal.id);
                            setGoal(updated);
                            Alert.alert(
                                "Argent récupéré !",
                                `${deposited.toFixed(2)}€ ont été ajoutés à ton solde.`,
                                [{ text: "OK", onPress: () => router.back() }]
                            );
                        } catch (error: any) {
                            const msg = error?.response?.data?.message || "Impossible d'utiliser l'objectif";
                            Alert.alert("Erreur", msg);
                        } finally {
                            setActionLoading(false);
                        }
                    },
                },
            ]
        );
    }

    async function handleDelete() {
        Alert.alert(
            "Supprimer l'objectif",
            "Cette action est irréversible. L'argent épargné sera perdu.",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            await goalsService.deleteGoal(goal.id);
                            router.back();
                        } catch (error: any) {
                            const msg = error?.response?.data?.message || "Impossible de supprimer";
                            Alert.alert("Erreur", msg);
                            setActionLoading(false);
                        }
                    },
                },
            ]
        );
    }

    const isActivated = goal.goalStatus === GoalStatus.ACTIVATED;
    const isDone = goal.goalStatus === GoalStatus.DONE;
    const isUsed = goal.goalStatus === GoalStatus.USED;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={18} color="#fff" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{goal.name}</Text>
                    {childName && <Text style={styles.headerSubtitle}>Épargne de {childName}</Text>}
                </View>
                {isActivated && (
                    <TouchableOpacity style={styles.editButton} onPress={() => setShowEditModal(true)}>
                        <Ionicons name="pencil-outline" size={18} color="#846DED" />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Hero card */}
                <View style={styles.heroCard}>
                    <View style={styles.emojiWrapper}>
                        <Text style={styles.heroEmoji}>{goal.emoji ?? "🎯"}</Text>
                    </View>

                    <GoalStatusBadge status={goal.goalStatus} />

                    <Text style={styles.heroName}>{goal.name}</Text>

                    <CircularProgress
                        progress={goal.progression}
                        size={140}
                        strokeWidth={14}
                        color={isUsed ? "#D5D5D5" : isDone ? "#846DED" : "#F06C8A"}
                        trackColor="#F0F0F0"
                    />

                    <View style={styles.amountsRow}>
                        <View style={styles.amountBlock}>
                            <Text style={styles.amountLabel}>Épargné</Text>
                            <Text style={styles.amountValueGreen}>{deposited.toFixed(2)}€</Text>
                        </View>
                        <View style={styles.amountDivider} />
                        <View style={styles.amountBlock}>
                            <Text style={styles.amountLabel}>Objectif</Text>
                            <Text style={styles.amountValueTarget}>{target.toFixed(2)}€</Text>
                        </View>
                        {!isReached && isActivated && (
                            <>
                                <View style={styles.amountDivider} />
                                <View style={styles.amountBlock}>
                                    <Text style={styles.amountLabel}>Reste</Text>
                                    <Text style={styles.amountValueRemaining}>{remaining.toFixed(2)}€</Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {isActivated && (
                    <View style={styles.actionsCard}>
                        <TouchableOpacity
                            style={styles.actionRowBtn}
                            onPress={() => setShowDepositModal(true)}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: "#E1FFF6" }]}>
                                <Ionicons name="arrow-down-circle-outline" size={22} color="#16AA75" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.actionTitle}>Verser de l'argent</Text>
                                <Text style={styles.actionSubtitle}>Ajouter une somme à cet objectif</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#D5D5D5" />
                        </TouchableOpacity>

                        {isReached && (
                            <TouchableOpacity
                                style={[styles.actionRowBtn, styles.actionRowBtnHighlight]}
                                onPress={handleComplete}
                                disabled={actionLoading}
                            >
                                <View style={[styles.actionIcon, { backgroundColor: "#E6E2FB" }]}>
                                    <Ionicons name="trophy-outline" size={22} color="#846DED" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.actionTitle, { color: "#846DED" }]}>Valider l'objectif</Text>
                                    <Text style={styles.actionSubtitle}>Objectif atteint, félicitations !</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="#846DED" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {isDone && (
                    <View style={styles.actionsCard}>
                        <TouchableOpacity
                            style={[styles.actionRowBtn, styles.actionRowBtnHighlight]}
                            onPress={handleUse}
                            disabled={actionLoading}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: "#E6E2FB" }]}>
                                <Ionicons name="wallet-outline" size={22} color="#846DED" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.actionTitle, { color: "#846DED" }]}>Utiliser l'épargne</Text>
                                <Text style={styles.actionSubtitle}>Récupérer {deposited.toFixed(2)}€ dans ton compte</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#846DED" />
                        </TouchableOpacity>
                    </View>
                )}

                {!isUsed && (
                    <View style={styles.dangerCard}>
                        <TouchableOpacity style={styles.dangerBtn} onPress={handleDelete} disabled={actionLoading}>
                            <Ionicons name="trash-outline" size={18} color="#E74C3C" />
                            <Text style={styles.dangerBtnText}>Supprimer l'objectif</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            <Modal transparent visible={showDepositModal} animationType="slide">
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <Pressable style={styles.modalOverlay} onPress={() => { setShowDepositModal(false); resetDepositForm(); }}>
                        <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
                            {/* Header modal */}
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Verser de l'argent</Text>
                                <TouchableOpacity
                                    style={styles.modalCloseBtn}
                                    onPress={() => { setShowDepositModal(false); resetDepositForm(); }}
                                >
                                    <Ionicons name="close" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            {/* Infos objectif */}
                            <View style={styles.depositInfo}>
                                <Text style={styles.depositInfoText}>
                                    <Text style={{ fontWeight: "700" }}>{deposited.toFixed(2)}€</Text> épargnés sur{" "}
                                    <Text style={{ fontWeight: "700" }}>{target.toFixed(2)}€</Text>
                                </Text>
                                {remaining > 0 && (
                                    <Text style={styles.depositInfoSub}>Il reste {remaining.toFixed(2)}€ à atteindre</Text>
                                )}
                            </View>

                            {/* Presets */}
                            <View style={styles.depositPresetsRow}>
                                {DEPOSIT_PRESETS.map((v) => (
                                    <TouchableOpacity
                                        key={v}
                                        style={[styles.depositPresetBtn, depositPreset === v && styles.depositPresetBtnSelected]}
                                        onPress={() => handleDepositPreset(v)}
                                    >
                                        <Text style={[styles.depositPresetText, depositPreset === v && styles.depositPresetTextSelected]}>
                                            {v}€
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                                {remaining > 0 && (
                                    <TouchableOpacity
                                        key="tout"
                                        style={[styles.depositPresetBtn, depositPreset === remaining.toFixed(2) && styles.depositPresetBtnSelected]}
                                        onPress={() => handleDepositPreset(remaining.toFixed(2))}
                                    >
                                        <Text style={[styles.depositPresetText, depositPreset === remaining.toFixed(2) && styles.depositPresetTextSelected]}>
                                            Tout ({remaining.toFixed(2)}€)
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Input custom */}
                            <View style={styles.depositCustomRow}>
                                <View style={[styles.depositInput, depositCustom ? styles.depositInputActive : null]}>
                                    <TextInput
                                        style={styles.depositInputText}
                                        placeholder="Montant personnalisé"
                                        value={depositCustom}
                                        onChangeText={handleDepositCustom}
                                        keyboardType="decimal-pad"
                                        placeholderTextColor="#aaa"
                                    />
                                    <Text style={styles.depositEuro}>€</Text>
                                </View>
                            </View>

                            {/* Bouton confirmer */}
                            <View style={styles.depositFooter}>
                                <TouchableOpacity
                                    style={[styles.depositConfirmBtn, (!isDepositValid || depositLoading) && styles.depositConfirmBtnDisabled]}
                                    onPress={handleDeposit}
                                    disabled={!isDepositValid || depositLoading}
                                >
                                    <Text style={styles.depositConfirmBtnText}>
                                        {depositLoading
                                            ? "Versement en cours…"
                                            : isDepositValid
                                            ? `Verser ${depositAmount.toFixed(2)}€`
                                            : "Entrer un montant"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Pressable>
                    </Pressable>
                </GestureHandlerRootView>
            </Modal>

            <Modal transparent visible={showEditModal} animationType="slide">
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <Pressable style={styles.modalOverlay} onPress={() => setShowEditModal(false)}>
                        <Pressable style={[styles.modalSheet, { height: "85%" }]} onPress={(e) => e.stopPropagation()}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Modifier l'objectif</Text>
                                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowEditModal(false)}>
                                    <Ionicons name="close" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            <View style={{ flex: 1 }}>
                                <GoalForm
                                    childId={childId}
                                    goal={goal}
                                />
                            </View>
                        </Pressable>
                    </Pressable>
                </GestureHandlerRootView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    backButton: {
        backgroundColor: "#2F2F2F",
        borderRadius: 8,
        padding: 12,
    },
    editButton: {
        backgroundColor: "#F3F0FD",
        borderRadius: 8,
        padding: 12,
    },
    headerTitle: {
        fontFamily: "DMSans_700Bold",
        fontSize: 18,
        color: "#2F2F2F",
    },
    headerSubtitle: {
        fontFamily: "DMSans_400Regular",
        fontSize: 13,
        color: "#828282",
        marginTop: 2,
    },
    scroll: {
        backgroundColor: "#EBF2FB",
        flex: 1,
        padding: 20,
    },
    // Hero card
    heroCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        gap: 16,
        shadowColor: "#BFD0EA",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
        marginBottom: 16,
    },
    emojiWrapper: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: "#F3F0FD",
        alignItems: "center",
        justifyContent: "center",
    },
    heroEmoji: {
        fontSize: 36,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusBadgeText: {
        fontSize: 13,
        fontWeight: "600",
    },
    heroName: {
        fontFamily: "DMSans_700Bold",
        fontSize: 22,
        color: "#2F2F2F",
        textAlign: "center",
    },
    amountsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        marginTop: 8,
        width: "100%",
        justifyContent: "center",
    },
    amountBlock: {
        alignItems: "center",
        gap: 4,
    },
    amountLabel: {
        fontSize: 12,
        color: "#828282",
        fontWeight: "400",
    },
    amountValueGreen: {
        fontSize: 20,
        fontWeight: "800",
        color: "#16AA75",
    },
    amountValueTarget: {
        fontSize: 20,
        fontWeight: "800",
        color: "#2F2F2F",
    },
    amountValueRemaining: {
        fontSize: 20,
        fontWeight: "800",
        color: "#F06C8A",
    },
    amountDivider: {
        width: 1,
        height: 32,
        backgroundColor: "#F0F0F0",
    },
    // Actions card
    actionsCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#BFD0EA",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
        marginBottom: 16,
    },
    actionRowBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    actionRowBtnHighlight: {
        backgroundColor: "#FAFAFE",
        borderBottomWidth: 0,
    },
    actionIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#2F2F2F",
    },
    actionSubtitle: {
        fontSize: 12,
        color: "#828282",
        marginTop: 2,
    },
    // Danger
    dangerCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 16,
        overflow: "hidden",
        shadowColor: "#BFD0EA",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    dangerBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 16,
    },
    dangerBtnText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#E74C3C",
    },
    // ---- MODAL DÉPÔT ----
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalSheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 30,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    modalTitle: {
        fontFamily: "DMSans_700Bold",
        fontSize: 17,
        color: "#2F2F2F",
    },
    modalCloseBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#333",
        alignItems: "center",
        justifyContent: "center",
    },
    depositInfo: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: "#F8F9FA",
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    depositInfoText: {
        fontSize: 14,
        color: "#2F2F2F",
    },
    depositInfoSub: {
        fontSize: 12,
        color: "#828282",
        marginTop: 2,
    },
    depositPresetsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    depositPresetBtn: {
        backgroundColor: "#EAEAEA",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "transparent",
    },
    depositPresetBtnSelected: {
        backgroundColor: "#E6E2FB",
        borderColor: "#846DED",
    },
    depositPresetText: {
        fontSize: 14,
        color: "#6E6E6E",
        fontWeight: "500",
    },
    depositPresetTextSelected: {
        color: "#2F2F2F",
        fontWeight: "700",
    },
    depositCustomRow: {
        paddingHorizontal: 20,
        paddingTop: 14,
    },
    depositInput: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#D5D5D5",
        paddingHorizontal: 16,
    },
    depositInputActive: {
        borderColor: "#846DED",
        backgroundColor: "#fff",
    },
    depositInputText: {
        flex: 1,
        fontSize: 16,
        color: "#333",
        paddingVertical: 14,
    },
    depositEuro: {
        fontSize: 16,
        color: "#666",
        fontWeight: "500",
    },
    depositFooter: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    depositConfirmBtn: {
        backgroundColor: "#846DED",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#4E31CF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    depositConfirmBtnDisabled: {
        backgroundColor: "#ccc",
        shadowColor: "transparent",
    },
    depositConfirmBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
