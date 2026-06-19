import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { moneyService } from "@/services/moneyService";
import { useAuthContext } from "@/contexts/AuthContext";
import { colors, spacing, typography } from "@/styles";
import SuccessComponent from "@/components/SuccessComponent";

export default function AddMoney() {
    const params = useLocalSearchParams();
    const childId = params.childId as string;
    const childName = params.childName as string;

    const { refreshUserData, user } = useAuthContext();
    const [step, setStep] = useState<"form" | "success">("form");
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [newBalance, setNewBalance] = useState("");

    const handleAddMoney = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert("Erreur", "Veuillez saisir un montant valide");
            return;
        }

        setLoading(true);
        try {
            const currentChild = user?.subAccounts?.find((account) => account.id === childId);
            const currentBalance = currentChild?.money ?? 0;

            const result = await moneyService.addMoney({
                subAccountId: childId,
                amount: parseFloat(amount),
                description: message || `Versement de ${amount}€`,
                emoji: "💰",
            });

            if (result.success) {
                const newBalanceAmount = currentBalance + parseFloat(amount);
                setNewBalance(newBalanceAmount.toFixed(2));
                await refreshUserData();
                setStep("success");
            } else {
                Alert.alert("Erreur", result.message || "Impossible d'ajouter l'argent");
            }
        } catch {
            Alert.alert("Erreur", "Une erreur inattendue s'est produite");
        } finally {
            setLoading(false);
        }
    };

    if (step === "success") {
        return (
            <SafeAreaView style={styles.container}>
                <SuccessComponent
                    title={`${amount}€ versés à ${childName}`}
                    subTitle={`Son solde est maintenant de ${newBalance}€ !`}
                    onClose={() => router.back()}
                    showHeader
                    buttonColor={colors.primary[100]}
                    buttonShadowColor="#4E31CF"
                />
            </SafeAreaView>
        );
    }

    const buttonLabel = loading ? "Versement..." : `Verser ${amount || "0"}€`;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Verser de l'argent</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.amountBox}>
                    <TextInput
                        style={styles.amountInput}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="decimal-pad"
                        placeholder="0.00€"
                        placeholderTextColor={colors.carbon[60]}
                        textAlign="center"
                        autoFocus
                    />
                </View>

                <View style={styles.messageSection}>
                    <Text style={styles.messageLabel}>Message</Text>
                    <TextInput
                        style={styles.messageInput}
                        placeholder="Écrire un message"
                        placeholderTextColor={colors.carbon[60]}
                        value={message}
                        onChangeText={setMessage}
                    />
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.transferButton, (!amount || loading) && styles.transferButtonDisabled]}
                    onPress={handleAddMoney}
                    disabled={!amount || loading}
                    activeOpacity={0.85}
                >
                    <Text style={styles.transferButtonText}>{buttonLabel}</Text>
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
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#BFD0EA",
        backgroundColor: colors.white,
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
    closeButtonText: {
        color: colors.white,
        ...typography.md,
        ...typography.bold,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },
    amountBox: {
        backgroundColor: colors.screenBackground,
        borderRadius: 4,
        paddingVertical: 12,
        alignItems: "center",
        marginBottom: spacing["2xl"],
    },
    amountInput: {
        fontSize: 40,
        ...typography.bold,
        color: colors.carbon[100],
        width: "100%",
        textAlign: "center",
        paddingVertical: 0,
    },
    messageSection: {
        gap: spacing.sm,
    },
    messageLabel: {
        ...typography.sm,
        color: colors.carbon[100],
    },
    messageInput: {
        backgroundColor: colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.carbon[20],
        paddingHorizontal: 14,
        paddingVertical: 12,
        ...typography.md,
        color: colors.carbon[100],
        height: 53,
    },
    footer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        paddingTop: spacing.base,
    },
    transferButton: {
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
    transferButtonDisabled: {
        backgroundColor: colors.carbon[30],
        shadowColor: "transparent",
        elevation: 0,
    },
    transferButtonText: {
        color: colors.white,
        ...typography.button,
    },
});
