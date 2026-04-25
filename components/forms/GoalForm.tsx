import { Goal } from "@/types/Goal";
import { goalsService } from "@/services/goalService";
import { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import getRandomItemFromList from "@/utils/fn/getRandomItemFromList";
import emojis from "@/styles/emojis";

const PREDEFINED_AMOUNTS = ["10", "20", "50", "100"];

type IProps = {
    childId: string;
    goal?: Goal | null;
};

export default function GoalForm({ childId, goal }: IProps) {
    const isUpdate = Boolean(goal?.id);

    const [name, setName] = useState(goal?.name ?? "");
    const [selectedEmoji, setSelectedEmoji] = useState(goal?.emoji ?? getRandomItemFromList(emojis));
    const [customAmount, setCustomAmount] = useState(goal?.amount?.toString() ?? "");
    const [selectedPreset, setSelectedPreset] = useState("");
    const [loading, setLoading] = useState(false);

    const finalAmount = selectedPreset || customAmount;
    const isValid = name.trim().length > 0 && parseFloat(finalAmount) > 0;

    function handlePresetSelect(value: string) {
        setSelectedPreset(value);
        setCustomAmount("");
    }

    function handleCustomAmountChange(value: string) {
        setCustomAmount(value);
        setSelectedPreset("");
    }

    async function handleSubmit() {
        if (!isValid) return;
        setLoading(true);
        try {
            if (isUpdate && goal?.id) {
                await goalsService.updateGoal(goal.id, {
                    name: name.trim(),
                    amount: parseFloat(finalAmount),
                    emoji: selectedEmoji,
                });
                Alert.alert("Succès", "Objectif modifié avec succès", [
                    { text: "OK", onPress: () => router.back() },
                ]);
            } else {
                await goalsService.createGoal({
                    name: name.trim(),
                    amount: parseFloat(finalAmount),
                    emoji: selectedEmoji,
                    subaccountIdChild: childId,
                });
                Alert.alert("Succès", "Objectif créé avec succès !", [
                    { text: "OK", onPress: () => router.back() },
                ]);
            }
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Une erreur est survenue";
            Alert.alert("Erreur", msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Nom */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Quel est ton objectif ?</Text>
                    <View style={[name.trim() ? styles.inputActive : styles.inputContainer]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ex: Acheter une console"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="sentences"
                        />
                        {name.trim() && <Ionicons name="checkmark-outline" size={18} color="#16AA75" />}
                    </View>
                </View>

                {/* Montant cible */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Montant à atteindre</Text>
                    <View style={styles.presetsRow}>
                        {PREDEFINED_AMOUNTS.map((v) => (
                            <TouchableOpacity
                                key={v}
                                style={[styles.presetBtn, selectedPreset === v && styles.presetBtnSelected]}
                                onPress={() => handlePresetSelect(v)}
                            >
                                <Text style={[styles.presetBtnText, selectedPreset === v && styles.presetBtnTextSelected]}>
                                    {v}€
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={[styles.amountInputRow, customAmount ? styles.inputActive : styles.inputContainer, { marginTop: 12 }]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Autre montant"
                            value={customAmount}
                            onChangeText={handleCustomAmountChange}
                            keyboardType="decimal-pad"
                        />
                        <Text style={styles.euroSymbol}>€</Text>
                    </View>
                </View>

                {/* Emoji */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Choisis une icône</Text>
                    <View style={styles.emojiGrid}>
                        {emojis.map((emoji) => (
                            <Pressable
                                key={emoji}
                                style={[styles.emojiBtn, selectedEmoji === emoji && styles.emojiBtnSelected]}
                                onPress={() => setSelectedEmoji(emoji)}
                            >
                                <Text style={styles.emojiText}>{emoji}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, isUpdate && styles.footerUpdate]}>
                {isUpdate ? (
                    <View style={styles.footerRow}>
                        <TouchableOpacity style={[styles.btnSecondary]} onPress={() => router.back()}>
                            <Text style={styles.btnSecondaryText}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btnPrimary, (!isValid || loading) && styles.btnDisabled]}
                            onPress={handleSubmit}
                            disabled={!isValid || loading}
                        >
                            <Text style={styles.btnPrimaryText}>{loading ? "Modification..." : "Enregistrer"}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.btnPrimary, (!isValid || loading) && styles.btnDisabled]}
                        onPress={handleSubmit}
                        disabled={!isValid || loading}
                    >
                        <Text style={styles.btnPrimaryText}>{loading ? "Création..." : "Créer l'objectif"}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginTop: 24,
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
        backgroundColor: "#fff",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#D5D5D5",
        paddingHorizontal: 16,
    },
    inputActive: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#16AA75",
        paddingHorizontal: 16,
    },
    amountInputRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: "#333",
        paddingVertical: 16,
    },
    euroSymbol: {
        fontSize: 16,
        color: "#666",
        fontWeight: "500",
    },
    presetsRow: {
        flexDirection: "row",
        gap: 10,
    },
    presetBtn: {
        backgroundColor: "#EAEAEA",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "transparent",
    },
    presetBtnSelected: {
        backgroundColor: "#E6E2FB",
        borderColor: "#846DED",
    },
    presetBtnText: {
        fontSize: 14,
        color: "#6E6E6E",
        fontWeight: "500",
    },
    presetBtnTextSelected: {
        color: "#2F2F2F",
        fontWeight: "700",
    },
    emojiGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    emojiBtn: {
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: "#F0F0F0",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "transparent",
    },
    emojiBtnSelected: {
        backgroundColor: "#E6E2FB",
        borderColor: "#846DED",
    },
    emojiText: {
        fontSize: 26,
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 16,
    },
    footerUpdate: {
        borderTopWidth: 1,
        borderColor: "#BFD0EA",
        backgroundColor: "#fff",
    },
    footerRow: {
        flexDirection: "row",
        gap: 10,
    },
    btnPrimary: {
        flex: 1,
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
    btnPrimaryText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    btnSecondary: {
        flex: 1,
        backgroundColor: "#D5D5D5",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#979797",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    btnSecondaryText: {
        color: "#6A6A6A",
        fontSize: 16,
        fontWeight: "600",
    },
    btnDisabled: {
        backgroundColor: "#ccc",
        shadowColor: "transparent",
    },
});
