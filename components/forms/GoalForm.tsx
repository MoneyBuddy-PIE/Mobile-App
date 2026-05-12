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
    FlatList,
} from "react-native";
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
    onChange?: () => void
};

export default function GoalForm({ childId, goal, onChange }: IProps) {
    const isUpdate = Boolean(goal?.id);

    const [name, setName] = useState(goal?.name ?? "");
    const [selectedEmoji, setSelectedEmoji] = useState(goal?.emoji ?? getRandomItemFromList(emojis));
    const [amount, setAmount] = useState(goal?.amount?.toString() ?? "");

    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false)

    async function handleSubmit() {
        setLoading(true);
        try {
            if (isUpdate && goal?.id) {
                await goalsService.updateGoal(goal.id, {
                    name: name.trim(),
                    amount: parseFloat(amount),
                    emoji: selectedEmoji,
                });
                Alert.alert("Succès", "Objectif modifié avec succès", [
                    { text: "OK", onPress: () => router.back() },
                ]);
            } else {
                await goalsService.createGoal({
                    name: name.trim(),
                    amount: parseFloat(amount),
                    emoji: selectedEmoji,
                    subaccountIdChild: childId,
                });
            }
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Une erreur est survenue";
            Alert.alert("Erreur", msg);
        } finally {
            setLoading(false);
            onChange && onChange()
        }
    }

    return (
        <>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Emoji */}
                <View style={[styles.section, {display: "flex", alignItems: "center"}]}>
                    <TouchableOpacity style={[styles.imageContainer, {backgroundColor: getRandomItemFromList(colorList)}]} onPress={() => setShowModal(true)}>
						<Text style={styles.emojiText}>{selectedEmoji}</Text>
                        <View style={styles.editIcon}>
                            <Ionicons name="pencil" size={12} color="#fff" />
                        </View>
					</TouchableOpacity>
                </View>

                {showModal && 
                    <ModalEmoji
                        visible={showModal} 
                        onClose={() => setShowModal(false)} 
                        changeEmoji={(emoji) => setSelectedEmoji(emoji)} 
                    />
            }
                
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
                        <TouchableOpacity style={[styles.btnSecondary]} onPress={() => router.back()}>
                            <Text style={styles.btnSecondaryText}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btnPrimary]}
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
                        <Text style={[Boolean(name?.trim()?.length > 2 && Number(amount) > 0) ? styles.btnPrimaryText : styles.btnPrimaryTextDisabled]}>
                            {loading ? "Création..." : "Créer l'objectif"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </>
    );
}

const ModalEmoji = ({ visible, onClose, changeEmoji }: { visible: boolean; onClose: () => void,  changeEmoji: (emoji: string) => void; }) => {

    const handleEmoji = (emoji: string) => {
        changeEmoji(emoji)
        onClose()
    }

    return (
        <ModalComponent
            visible={visible}
            onClose={onClose}
        >
            <ScrollView> 
                <View style={{display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 12}}>
                    {emojis.map((emoji) => (
                        <TouchableOpacity 
                            key={emoji}
                            style={[styles.imageContainer, {backgroundColor: getRandomItemFromList(colorList), width: "22%"}]} 
                            onPress={() => handleEmoji(emoji)}
                        >
                            <Text style={styles.emojiText}>{emoji}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </ModalComponent>
    )
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
    textInput: {
        flex: 1,
        fontSize: 16,
        color: "#333",
        paddingVertical: 16,
    },
    // Content - Emoji
    imageContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        borderRadius: 4,
    },
    editIcon: {
        position: "absolute",
        bottom: -5,
        right: -5,
        backgroundColor: "#846DED",
        borderRadius: 4,
        padding: 8,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#4E31CF",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
    },
    emojiText: {
        fontSize: 48,
        fontWeight: 700,
        paddingHorizontal: 6,
        paddingVertical: 3,
    },
    // Content - Amount Input
	customAmountContainer: {
        display: "flex",
		flexDirection: "row",
        justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#EBF2FB",
		borderRadius: 4,
        paddingVertical: 12,        
		marginTop: 16,
	},
	customAmountInputNonSelected: {
		fontSize: 40,
		color: "#979797",
        fontWeight: 800
	},
	customAmountInputSelected: {
		fontSize: 40,
		color: "#2F2F2F",
		fontWeight: 800,
	},
    // Footer
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 16,
        backgroundColor: "#FFFFFF"
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
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#005C49",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    btnPrimaryDisabled: {
        backgroundColor: "#D5D5D5",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    btnPrimaryText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    btnPrimaryTextDisabled: {
        color: "#828282",
        fontSize: 16,
        fontWeight: "600",
    },
    btnSecondary: {
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
});
