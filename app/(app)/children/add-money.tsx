import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Animated, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { moneyService } from "@/services/moneyService";
import { useAuthContext } from "@/contexts/AuthContext";
import { colors, spacing, typography, shadows } from "@/styles";

const PREDEFINED_AMOUNTS = ["1", "5", "10", "20"];

export default function AddMoney() {
    const params = useLocalSearchParams();
    const childId = params.childId as string;
    const childName = params.childName as string;

    const { refreshUserData, user } = useAuthContext();
    const [step, setStep] = useState<"form" | "success">("form");
    const [selectedAmount, setSelectedAmount] = useState("");
    const [customAmount, setCustomAmount] = useState("");
    const [showCustomAmount, setShowCustomAmount] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [newBalance, setNewBalance] = useState("");

    const [scaleAnim] = useState(new Animated.Value(0));

    const handleAmountSelect = (amount: string) => {
        setSelectedAmount(amount);
        setShowCustomAmount(false);
        setCustomAmount("");
    };

    const handleCustomAmount = () => {
        setShowCustomAmount(true);
        setSelectedAmount("");
    };

    const getFinalAmount = () => {
        if (showCustomAmount) {
            return customAmount;
        }
        return selectedAmount;
    };

    const handleAddMoney = async () => {
        const finalAmount = getFinalAmount();

        if (!finalAmount || parseFloat(finalAmount) <= 0) {
            Alert.alert("Erreur", "Veuillez saisir un montant valide");
            return;
        }

        setLoading(true);
        try {
            // Récupérer le solde actuel de l'enfant
            const currentChild = user?.subAccounts?.find((account) => account.id === childId);
            const currentBalance = parseFloat(currentChild?.money || "0");

            const result = await moneyService.addMoney({
                subAccountId: childId,
                amount: parseFloat(finalAmount),
                description: message || `Versement de ${finalAmount}€`,
            });

            if (result.success) {
                // Calculer le nouveau solde
                const newBalanceAmount = currentBalance + parseFloat(finalAmount);
                setNewBalance(newBalanceAmount.toFixed(2));

                // Rafraîchir les données utilisateur pour obtenir le nouveau solde
                await refreshUserData();

                // Animation d'apparition de la tirelire
                setStep("success");
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 100,
                    useNativeDriver: true,
                }).start();
            } else {
                Alert.alert("Erreur", result.message || "Impossible d'ajouter l'argent");
            }
        } catch (error: any) {
            console.error("Error adding money:", error);
            Alert.alert("Erreur", "Une erreur inattendue s'est produite");
        } finally {
            setLoading(false);
        }
    };

    const handleFinish = () => {
        router.back();
    };

    if (step === "success") {
        return (
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.closeButton} onPress={handleFinish}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.successContent}>
                    <Text style={styles.successTitle}>
                        {getFinalAmount()}€ versés à {childName}
                    </Text>
                    <Text style={styles.successSubtitle}>Son solde est maintenant de {newBalance}€ !</Text>

                    {/* Animation tirelire */}
                    <Animated.View style={[styles.piggyBankContainer, { transform: [{ scale: scaleAnim }] }]}>
                        <View style={styles.piggyBankCircle}>
                            <Text style={styles.piggyBankEmoji}>🐷</Text>
                            <Text style={styles.coinEmoji}>🪙</Text>
                            <Text style={styles.starsEmoji}>✨</Text>
                        </View>
                    </Animated.View>

                    <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
                        <Text style={styles.finishButtonText}>Terminer</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Verser de l'argent</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Montant affiché */}
                <View style={styles.amountDisplay}>
                    <Text style={styles.amountText}>{getFinalAmount() ? `${parseFloat(getFinalAmount()).toFixed(2)}€` : "0.00€"}</Text>
                </View>

                {/* Sélection du montant */}
                <View style={styles.amountSelection}>
                    <View style={styles.amountContainer}>
                        {PREDEFINED_AMOUNTS.map((amount) => (
                            <TouchableOpacity
                                key={amount}
                                style={[styles.amountButton, selectedAmount === amount && styles.amountButtonSelected]}
                                onPress={() => handleAmountSelect(amount)}
                            >
                                <Text style={[styles.amountButtonText, selectedAmount === amount && styles.amountButtonTextSelected]}>{amount}€</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={[styles.amountButton, showCustomAmount && styles.amountButtonSelected]} onPress={handleCustomAmount}>
                            <Text style={[styles.amountButtonText, showCustomAmount && styles.amountButtonTextSelected]}>Autre</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Input montant personnalisé */}
                    {showCustomAmount && (
                        <View style={styles.customAmountContainer}>
                            <TextInput
                                style={styles.customAmountInput}
                                placeholder="Montant personnalisé"
                                value={customAmount}
                                onChangeText={setCustomAmount}
                                keyboardType="decimal-pad"
                                autoFocus
                            />
                            <Text style={styles.euroSymbol}>€</Text>
                        </View>
                    )}
                </View>

                {/* Message */}
                <View style={styles.messageSection}>
                    <Text style={styles.messageLabel}>Message</Text>
                    <TextInput
                        style={styles.messageInput}
                        placeholder="Écrire un message"
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        textAlignVertical="top"
                    />
                </View>
            </View>

            {/* Bouton de versement */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.transferButton, (!getFinalAmount() || loading) && styles.transferButtonDisabled]}
                    onPress={handleAddMoney}
                    disabled={!getFinalAmount() || loading}
                >
                    <Text style={styles.transferButtonText}>{loading ? "Versement..." : `Verser ${getFinalAmount() || "0"}€`}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.screenBackground,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xs,
        paddingBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        ...typography.lg,
        ...typography.semiBold,
        color: colors.carbon[100],
        flex: 1,
    },
    closeButton: {
        width: 32,
        height: 32,
        backgroundColor: colors.carbon[100],
        borderRadius: spacing.sm,
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
    amountDisplay: {
        backgroundColor: colors.primary[10],
        borderRadius: spacing.md,
        paddingVertical: spacing["2xl"],
        paddingHorizontal: spacing.lg,
        alignItems: "center",
        marginBottom: spacing["2xl"],
    },
    amountText: {
        fontSize: 48,
        ...typography.bold,
        color: colors.carbon[100],
    },
    amountSelection: {
        marginBottom: spacing["2xl"],
    },
    amountContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.md,
        justifyContent: "center",
    },
    amountButton: {
        backgroundColor: colors.carbon[10],
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: spacing.lg,
        borderWidth: 2,
        borderColor: "transparent",
        minWidth: 60,
        alignItems: "center",
    },
    amountButtonSelected: {
        backgroundColor: colors.primary[100],
        borderColor: colors.primary[80],
    },
    amountButtonText: {
        ...typography.md,
        ...typography.semiBold,
        color: colors.carbon[60],
    },
    amountButtonTextSelected: {
        color: colors.white,
    },
    customAmountContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: spacing.sm,
        borderWidth: 1,
        borderColor: colors.primary[100],
        paddingHorizontal: spacing.base,
        marginTop: spacing.base,
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
    messageSection: {
        marginBottom: spacing["2xl"],
    },
    messageLabel: {
        ...typography.md,
        ...typography.semiBold,
        color: colors.carbon[100],
        marginBottom: spacing.md,
    },
    messageInput: {
        backgroundColor: colors.white,
        borderRadius: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.base,
        ...typography.md,
        color: colors.carbon[100],
        height: 100,
    },
    footer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        paddingTop: spacing.base,
    },
    transferButton: {
        backgroundColor: colors.primary[100],
        paddingVertical: spacing.base,
        borderRadius: spacing.md,
        alignItems: "center",
        ...shadows.md,
    },
    transferButtonDisabled: {
        backgroundColor: colors.carbon[30],
        ...shadows.none,
    },
    transferButtonText: {
        color: colors.white,
        ...typography.button,
    },
    // Success screen styles
    successContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing["3xl"],
    },
    successTitle: {
        ...typography.heading,
        textAlign: "center",
        marginBottom: spacing.sm,
    },
    successSubtitle: {
        ...typography.subtitle,
        textAlign: "center",
        marginBottom: spacing["4xl"],
    },
    piggyBankContainer: {
        marginBottom: spacing["4xl"],
    },
    piggyBankCircle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: colors.aquamarine[60],
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    piggyBankEmoji: {
        fontSize: 80,
    },
    coinEmoji: {
        fontSize: 24,
        position: "absolute",
        top: 30,
        right: 40,
    },
    starsEmoji: {
        fontSize: 20,
        position: "absolute",
        bottom: 40,
        left: 30,
    },
    finishButton: {
        backgroundColor: colors.primary[100],
        paddingHorizontal: spacing["4xl"],
        paddingVertical: spacing.base,
        borderRadius: spacing.md,
        minWidth: 200,
        ...shadows.md,
    },
    finishButtonText: {
        color: colors.white,
        ...typography.button,
        textAlign: "center",
    },
});
