import { Goal } from "@/types/Goal";
import { goalsService } from "@/services/goalService";
import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import getRandomItemFromList from "@/utils/fn/getRandomItemFromList";
import emojis from "@/styles/emojis";
import ModalComponent from "../Modal";
import colorList from "@/styles/colors";

const PREDEFINED_AMOUNTS = ["10", "20", "50", "100"];

type IProps = {
    childId: string;
    goal?: Goal | null;
    onChange?: () => void;
};

export default function GoalForm({ childId, goal, onChange }: IProps) {
    const isUpdate = Boolean(goal?.id);

    const [name, setName] = useState(goal?.name ?? "");
    const [selectedEmoji, setSelectedEmoji] = useState(goal?.emoji ?? getRandomItemFromList(emojis));
    const [emojiColor] = useState(() => getRandomItemFromList(colorList));
    const [amount, setAmount] = useState(goal?.amount?.toString() ?? "");

    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    async function handleSubmit() {
        setLoading(true);
        try {
            if (isUpdate && goal?.id) {
                await goalsService.updateGoal(goal.id, {
                    name: name.trim(),
                    amount: parseFloat(amount),
                    emoji: selectedEmoji,
                });
                Alert.alert("Succès", "Objectif modifié avec succès", [{ text: "OK", onPress: () => router.back() }]);
            } else {
                await goalsService.createGoal({
                    name: name.trim(),
                    amount: parseFloat(amount),
                    emoji: selectedEmoji,
                });
            }
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Une erreur est survenue";
            Alert.alert("Erreur", msg);
        } finally {
            setLoading(false);
            onChange && onChange();
        }
    }

    return (
        <>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Emoji */}
                <View style={[styles.section, { alignItems: "center" }]}>
                    <TouchableOpacity style={[styles.imageContainer, { backgroundColor: emojiColor }]} onPress={() => setShowModal(true)}>
                        <Text style={styles.emojiText}>{selectedEmoji}</Text>
                        <View style={styles.editIcon}>
                            <Ionicons name="pencil" size={12} color="#fff" />
                        </View>
                    </TouchableOpacity>
                </View>

                {showModal && <ModalEmoji visible={showModal} onClose={() => setShowModal(false)} changeEmoji={(emoji) => setSelectedEmoji(emoji)} />}

                {/* Nom */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Nom de l’objectif</Text>
                    <View style={[name.trim() && name?.length > 2 ? styles.inputActive : styles.inputContainer]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ex: Acheter une console"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="sentences"
                        />
                        {name.trim() && name?.length > 2 && <Ionicons name="checkmark-outline" size={18} color="#16AA75" />}
                    </View>
                </View>

                {/* Montant */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Combien souhaites tu économiser ?</Text>
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
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, isUpdate && styles.footerUpdate]}>
                {isUpdate ? (
                    <View style={styles.footerRow}>
                        <TouchableOpacity style={[styles.btnSecondary, { flex: 1 }]} onPress={() => router.back()}>
                            <Text style={styles.btnSecondaryText}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btnPrimary, { flex: 1 }]}
                            onPress={handleSubmit}
                            disabled={!Boolean(name?.trim()?.length > 2 && Number(amount) > 0) || loading}
                        >
                            <Text style={styles.btnPrimaryText}>{loading ? "Modification..." : "Enregistrer"}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[Boolean(name?.trim()?.length > 2 && Number(amount) > 0) ? styles.btnPrimary : styles.btnPrimaryDisabled]}
                        onPress={handleSubmit}
                        disabled={!Boolean(name?.trim()?.length > 2 && Number(amount) > 0) || loading}
                    >
                        <Text
                            style={[Boolean(name?.trim()?.length > 2 && Number(amount) > 0) ? styles.btnPrimaryText : styles.btnPrimaryTextDisabled]}
                        >
                            {loading ? "Création..." : "Créer l'objectif"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </>
    );
}

const ModalEmoji = ({ visible, onClose, changeEmoji }: { visible: boolean; onClose: () => void; changeEmoji: (emoji: string) => void }) => {
    const handleEmoji = (emoji: string) => {
        changeEmoji(emoji);
        onClose();
    };

    return (
        <ModalComponent visible={visible} onClose={onClose}>
            <FlatList
                data={emojis}
                keyExtractor={(item) => item}
                numColumns={4}
                columnWrapperStyle={emojiGridStyles.row}
                contentContainerStyle={emojiGridStyles.list}
                renderItem={({ item: emoji, index }) => (
                    <TouchableOpacity
                        style={[emojiGridStyles.tile, { backgroundColor: colorList[index % colorList.length] }]}
                        onPress={() => handleEmoji(emoji)}
                    >
                        <Text style={emojiGridStyles.emoji}>{emoji}</Text>
                    </TouchableOpacity>
                )}
            />
        </ModalComponent>
    );
};

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    section: {
        marginTop: 32,
    },
    sectionLabel: {
        fontFamily: "DMSans_400Regular",
        fontSize: 14,
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
        paddingHorizontal: 14,
        height: 53,
    },
    inputActive: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#16AA75",
        paddingHorizontal: 14,
        height: 53,
    },
    textInput: {
        flex: 1,
        fontFamily: "DMSans_400Regular",
        fontSize: 16,
        color: "#2F2F2F",
    },
    // Content - Emoji
    imageContainer: {
        width: 80,
        height: 80,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        borderRadius: 4,
    },
    editIcon: {
        position: "absolute",
        bottom: -6,
        right: -6,
        backgroundColor: "#846DED",
        borderRadius: 4,
        padding: 8,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#4E31CF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    emojiText: {
        fontSize: 44,
    },
    // Content - Amount Input
    customAmountContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#EBF2FB",
        borderRadius: 4,
        paddingVertical: 12,
    },
    customAmountInputNonSelected: {
        fontSize: 40,
        fontFamily: "DMSans_700Bold",
        color: "#979797",
    },
    customAmountInputSelected: {
        fontSize: 40,
        fontFamily: "DMSans_700Bold",
        color: "#2F2F2F",
    },
    // Footer
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        paddingTop: 16,
        backgroundColor: "#FFFFFF",
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
        backgroundColor: "#16AA75",
        paddingVertical: 20,
        borderRadius: 8,
        alignItems: "center",
        shadowColor: "#005C49",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    btnPrimaryDisabled: {
        backgroundColor: "#D5D5D5",
        paddingVertical: 20,
        borderRadius: 8,
        alignItems: "center",
    },
    btnPrimaryText: {
        fontFamily: "DMSans_700Bold",
        color: "#FFFFFF",
        fontSize: 20,
    },
    btnPrimaryTextDisabled: {
        fontFamily: "DMSans_700Bold",
        color: "#828282",
        fontSize: 20,
    },
    btnSecondary: {
        backgroundColor: "#D5D5D5",
        paddingVertical: 20,
        borderRadius: 8,
        alignItems: "center",
        shadowColor: "#979797",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    btnSecondaryText: {
        fontFamily: "DMSans_700Bold",
        color: "#6A6A6A",
        fontSize: 20,
    },
});

const emojiGridStyles = StyleSheet.create({
    list: {
        paddingHorizontal: 16,
        paddingBottom: 24,
        gap: 12,
    },
    row: {
        gap: 12,
        justifyContent: "space-between",
    },
    tile: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    emoji: {
        fontSize: 32,
    },
});
