import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { tasksService } from "@/services/tasksService";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, shadows } from "@/styles";
import Cross from "@/components/Icons/Cross";

const PREDEFINED_AMOUNTS = ["0.50", "1", "1.50"];

export default function CreateTask() {
    const params = useLocalSearchParams();
    const childId = params.childId as string;

    const [taskName, setTaskName] = useState("");
    const [selectedAmount, setSelectedAmount] = useState("");
    const [customAmount, setCustomAmount] = useState("");
    const [showCustomAmount, setShowCustomAmount] = useState(false);
    const [taskType, setTaskType] = useState<"REGULAR" | "PUNCTUAL">("PUNCTUAL");
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [validationMode, setValidationMode] = useState<"BOTH" | "PARENTS_ONLY">("BOTH");

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

    const handleCreateTask = async () => {
        const finalAmount = getFinalAmount();

        if (!taskName.trim()) {
            Alert.alert("Erreur", "Veuillez saisir un nom de tâche");
            return;
        }

        if (!finalAmount) {
            Alert.alert("Erreur", "Veuillez sélectionner un montant");
            return;
        }

        setLoading(true);
        try {
            await tasksService.createTask({
                description: taskName.trim(),
                category: taskType === "REGULAR" ? "REGULAR" : "PUNCTUAL",
                subAccountId: childId,
                reward: finalAmount,
                dateLimit: new Date().toISOString(),
                prevalidation: validationMode === "BOTH" ? false : true,
            });

            Alert.alert("Succès", "Tâche créée avec succès", [{ text: "OK", onPress: () => router.back() }]);
        } catch (error: any) {
            console.error("Error creating task:", error);
            const errorMessage = error.response?.data?.message || "Impossible de créer la tâche";
            Alert.alert("Erreur", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <SafeAreaView style={styles.modalSafeArea}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Qui pourra confirmer la finalisation de cette tâche ?</Text>
                            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                <Cross width={24} height={24} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalContent}>
                            <TouchableOpacity
                                style={[styles.radioButton, validationMode === "BOTH" && styles.radioButtonSelected]}
                                onPress={() => setValidationMode("BOTH")}
                            >
                                <View style={[styles.radioCircle, validationMode === "BOTH" && styles.radioCircleValid]}>
                                    {validationMode === "BOTH" && <View style={styles.radioCircleInner} />}
                                </View>
                                <Text style={styles.radioButtonText}>Les parents et les enfants peuvent valider les tâches</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.radioButton, validationMode === "PARENTS_ONLY" && styles.radioButtonSelected]}
                                onPress={() => setValidationMode("PARENTS_ONLY")}
                            >
                                <View style={[styles.radioCircle, validationMode === "PARENTS_ONLY" && styles.radioCircleValid]}>
                                    {validationMode === "PARENTS_ONLY" && <View style={styles.radioCircleInner} />}
                                </View>
                                <Text style={styles.radioButtonText}>Seuls les parents peuvent valider les tâches</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={() => {
                                    setModalVisible(false);
                                    handleCreateTask();
                                }}
                            >
                                <Text style={styles.confirmButtonText}>Confirmer</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Ajouter une tâche</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                    <Cross width={24} height={24} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Nom de la tâche */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>C’est quoi la tâche ?</Text>
                    <View style={[styles.inputContainer, taskName.trim() ? { borderColor: colors.jadegreen[100] } : { borderColor: colors.border }]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ex: Sortir les poubelles"
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
                            <Text style={[styles.amountButtonText, showCustomAmount && styles.amountButtonTextSelected]}>Définir</Text>
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

                {/* Type de tâche */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Type de tâche</Text>
                    <View style={styles.taskTypeContainer}>
                        <TouchableOpacity
                            style={[styles.taskTypeButton, taskType === "REGULAR" && styles.taskTypeButtonSelected]}
                            onPress={() => setTaskType("REGULAR")}
                        >
                            <Text style={[styles.taskTypeButtonText, taskType === "REGULAR" && styles.taskTypeButtonTextSelected]}>Régulière</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.taskTypeButton, taskType === "PUNCTUAL" && styles.taskTypeButtonSelected]}
                            onPress={() => setTaskType("PUNCTUAL")}
                        >
                            <Text style={[styles.taskTypeButtonText, taskType === "PUNCTUAL" && styles.taskTypeButtonTextSelected]}>Ponctuelle</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Bouton de création */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.createButton, (!taskName.trim() || !getFinalAmount() || loading) && styles.createButtonDisabled]}
                    onPress={() => setModalVisible(true)}
                    disabled={!taskName.trim() || !getFinalAmount() || loading}
                >
                    <Text style={styles.createButtonText}>{loading ? "Création..." : "Créer la tâche"}</Text>
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
    modalContainer: {
        flex: 1,
        backgroundColor: colors.screenBackground,
    },
    modalSafeArea: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        ...typography.lg,
        ...typography.semiBold,
        color: colors.carbon[100],
    },
    closeButton: {
        width: 48,
        height: 48,
        backgroundColor: colors.carbon[100],
        borderRadius: spacing.sm,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.xl,
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
        borderRadius: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.base,
    },
    textInput: {
        flex: 1,
        ...typography.md,
        color: colors.carbon[100],
        paddingVertical: spacing.base,
        borderRadius: spacing.sm,
    },
    amountContainer: {
        flexDirection: "row",
        gap: spacing.md,
        flexWrap: "wrap",
    },
    amountButton: {
        backgroundColor: colors.carbon[10],
        padding: spacing.sm,
        borderRadius: spacing.sm,
        borderWidth: 1.5,
        borderColor: colors.carbon[20],
    },
    amountButtonSelected: {
        backgroundColor: colors.primary[20],
        borderColor: colors.primary[100],
    },
    amountButtonText: {
        ...typography.sm,
        color: colors.carbon[70],
    },
    amountButtonTextSelected: {
        color: colors.carbon[100],
    },
    customAmountContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: spacing.sm,
        borderWidth: 1,
        borderColor: colors.primary[100],
        paddingHorizontal: spacing.base,
        marginTop: spacing.md,
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
    taskTypeContainer: {
        flexDirection: "row",
        gap: spacing.md,
    },
    taskTypeButton: {
        backgroundColor: colors.carbon[10],
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: spacing.sm,
        borderWidth: 2,
        borderColor: "transparent",
    },
    taskTypeButtonSelected: {
        backgroundColor: colors.primary[20],
        borderColor: colors.primary[100],
    },
    taskTypeButtonText: {
        ...typography.sm,
        color: colors.carbon[70],
    },
    taskTypeButtonTextSelected: {
        color: colors.carbon[100],
    },
    bottomPadding: {
        height: 100,
    },
    footer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        paddingTop: spacing.base,
    },
    createButton: {
        backgroundColor: colors.primary[100],
        paddingVertical: spacing.base,
        borderRadius: spacing.md,
        alignItems: "center",
        ...shadows.md,
    },
    createButtonDisabled: {
        backgroundColor: colors.carbon[30],
        ...shadows.none,
    },
    createButtonText: {
        color: colors.white,
        ...typography.button,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xs,
        paddingBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalTitle: {
        flex: 1,
        ...typography.xl,
        ...typography.bold,
        color: colors.carbon[100],
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
    },
    radioButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: spacing.md,
        borderWidth: 2,
        borderColor: colors.border,
        padding: spacing.base,
        marginBottom: spacing.base,
    },
    radioButtonSelected: {
        backgroundColor: colors.primary[20],
        borderColor: colors.primary[100],
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.carbon[70],
        marginRight: spacing.md,
        justifyContent: "center",
        alignItems: "center",
    },
    radioCircleValid: {
        borderColor: colors.primary[100],
    },
    radioCircleInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary[100],
    },
    radioButtonText: {
        flex: 1,
        ...typography.subtitle,
    },
    modalFooter: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        paddingTop: spacing.base,
    },
    confirmButton: {
        backgroundColor: colors.primary[100],
        paddingVertical: spacing.base,
        borderRadius: spacing.md,
        alignItems: "center",
        ...shadows.md,
    },
    confirmButtonText: {
        color: colors.white,
        ...typography.button,
    },
});
