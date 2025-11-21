import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "@/services/authService";
import { colors, spacing, typography, shadows } from "@/styles";

interface RoleOption {
    value: string;
    label: string;
    description: string;
    icon: string;
    color: string;
}

const roleOptions: RoleOption[] = [
    {
        value: "CHILD",
        label: "Enfant",
        description: "Apprendre et gérer son argent de poche",
        icon: "school-outline",
        color: colors.aquamarine[100],
    },
    {
        value: "PARENT",
        label: "Parent",
        description: "Superviser et enseigner la gestion financière",
        icon: "person-outline",
        color: colors.blue[100],
    },
];

export default function Create() {
    const [name, setName] = useState("");
    const [selectedRole, setSelectedRole] = useState<string>("");
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);

    const handlePinChange = (value: string) => {
        if (value.length <= 4 && /^\d*$/.test(value)) {
            setPin(value);
        }
    };

    const validateForm = () => {
        if (!name.trim()) {
            Alert.alert("Erreur", "Veuillez saisir un nom");
            return false;
        }
        if (!selectedRole) {
            Alert.alert("Erreur", "Veuillez sélectionner un rôle");
            return false;
        }
        // PIN requis seulement pour les parents
        if (selectedRole === "PARENT" && pin.length !== 4) {
            Alert.alert("Erreur", "Le code PIN doit contenir exactement 4 chiffres");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await authService.subAccountRegister({
                name: name.trim(),
                role: selectedRole,
                pin: selectedRole === "PARENT" ? pin : "", // PIN vide pour les enfants
            });
            Alert.alert("Succès", "Compte créé avec succès", [{ text: "OK", onPress: () => router.back() }]);
        } catch (error: any) {
            console.error("Error creating sub-account:", error);
            Alert.alert("Erreur", error.response?.data?.message || "Impossible de créer le compte");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const selectedRoleOption = roleOptions.find((option) => option.value === selectedRole);

    // Vérifier si le formulaire est valide
    const isFormValid = () => {
        if (!name.trim() || !selectedRole) return false;
        if (selectedRole === "PARENT") {
            return pin.length === 4;
        }
        return true; // Pour les enfants, pas besoin de PIN
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Nouveau compte</Text>
                <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Description */}
                <View style={styles.descriptionContainer}>
                    <Text style={styles.subtitle}>Créez un nouveau profil pour votre enfant ou un autre parent</Text>
                </View>

                {/* Nom */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Nom du profil</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ex: Emma, Papa, Maman..."
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            maxLength={50}
                        />
                        {name.trim() && <Ionicons name="checkmark-outline" size={18} color="#16AA75" />}
                    </View>
                </View>

                {/* Sélection du rôle */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Type de compte</Text>
                    <View style={styles.roleContainer}>
                        {roleOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[styles.roleCard, selectedRole === option.value && styles.roleCardSelected]}
                                onPress={() => {
                                    setSelectedRole(option.value);
                                    // Reset du PIN quand on change de rôle
                                    setPin("");
                                }}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.roleIconContainer, { backgroundColor: `${option.color}20` }]}>
                                    <Ionicons name={option.icon as any} size={24} color={option.color} />
                                </View>
                                <View style={styles.roleInfo}>
                                    <Text style={[styles.roleLabel, selectedRole === option.value && styles.roleLabelSelected]}>
                                        {option.label}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.roleDescription,
                                            selectedRole === option.value && styles.roleDescriptionSelected,
                                        ]}
                                    >
                                        {option.description}
                                    </Text>
                                </View>
                                {selectedRole === option.value && (
                                    <View style={styles.selectedIndicator}>
                                        <Ionicons name="checkmark-circle" size={24} color={option.color} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Code PIN - Affiché seulement pour les parents */}
                {selectedRole === "PARENT" && (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Code de sécurité</Text>
                        <Text style={styles.sectionDescription}>Choisissez un code à 4 chiffres pour protéger ce compte</Text>

                        <View style={styles.pinContainer}>
                            <TextInput
                                style={styles.pinInput}
                                value={pin}
                                onChangeText={handlePinChange}
                                keyboardType="numeric"
                                maxLength={4}
                                secureTextEntry
                                textAlign="center"
                                placeholder="••••"
                                placeholderTextColor="#ccc"
                            />

                            {/* Indicateurs de PIN */}
                            <View style={styles.pinIndicators}>
                                {[1, 2, 3, 4].map((i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.pinDot,
                                            pin.length >= i && styles.pinDotFilled,
                                            selectedRoleOption && {
                                                backgroundColor: pin.length >= i ? selectedRoleOption.color : "#e0e0e0",
                                            },
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>
                    </View>
                )}

                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Bouton de création */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.createButton,
                        (!isFormValid() || loading) && styles.createButtonDisabled,
                        selectedRoleOption && !loading && isFormValid() && { backgroundColor: selectedRoleOption.color },
                    ]}
                    onPress={handleSubmit}
                    disabled={!isFormValid() || loading}
                >
                    <Text style={styles.createButtonText}>{loading ? "Création en cours..." : "Créer le compte"}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white
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
        backgroundColor: colors.white,
    },
    title: {
        ...typography.lg,
        ...typography.semiBold,
        color: colors.carbon[100],
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
        backgroundColor: colors.screenBackground,
    },
    descriptionContainer: {
        paddingVertical: spacing.xl,
        alignItems: "center",
    },
    subtitle: {
        ...typography.subtitle,
        textAlign: "center",
        lineHeight: 22,
    },
    section: {
        marginBottom: spacing["2xl"],
    },
    sectionLabel: {
        ...typography.md,
        ...typography.semiBold,
        color: colors.carbon[100],
        marginBottom: spacing.md,
    },
    sectionDescription: {
        ...typography.sm,
        color: colors.carbon[70],
        marginBottom: spacing.base,
        lineHeight: 20,
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
    },
    roleContainer: {
        gap: spacing.md,
    },
    roleCard: {
        backgroundColor: colors.white,
        borderRadius: spacing.md,
        padding: spacing.base,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderColor: colors.border,
    },
    roleCardSelected: {
        backgroundColor: colors.primary[20],
        borderColor: colors.primary[100],
    },
    roleIconContainer: {
        width: 48,
        height: 48,
        borderRadius: spacing.sm,
        justifyContent: "center",
        alignItems: "center",
        marginRight: spacing.base,
    },
    roleInfo: {
        flex: 1,
    },
    roleLabel: {
        ...typography.md,
        ...typography.semiBold,
        color: colors.carbon[100],
        marginBottom: 4,
    },
    roleLabelSelected: {
        color: colors.carbon[100],
    },
    roleDescription: {
        ...typography.sm,
        color: colors.carbon[70],
        lineHeight: 18,
    },
    roleDescriptionSelected: {
        color: colors.carbon[100],
    },
    selectedIndicator: {
        marginLeft: spacing.md,
    },
    pinContainer: {
        alignItems: "center",
        gap: spacing.base,
    },
    pinInput: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: spacing.sm,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.base,
        fontSize: 24,
        width: 120,
        textAlign: "center",
        letterSpacing: 8,
        color: colors.carbon[100],
    },
    pinIndicators: {
        flexDirection: "row",
        gap: spacing.md,
    },
    pinDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.carbon[30],
    },
    pinDotFilled: {
        backgroundColor: colors.primary[100],
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
});
