import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SvgUri } from "react-native-svg";
import { authService } from "@/services/authService";
import { colors, spacing, typography, shadows } from "@/styles";
import Cross from "@/components/Icons/Cross";

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

const AVATAR_STYLES = [
    { key: "bottts-neutral", label: "Robot" },
    { key: "thumbs", label: "Pouces" },
    { key: "dylan", label: "Dylan" },
] as const;

type AvatarStyle = (typeof AVATAR_STYLES)[number]["key"];

const AVATAR_SEEDS = [
    "Felix",
    "Aneka",
    "Lily",
    "Max",
    "Zoe",
    "Leo",
    "Mia",
    "Noah",
    "Emma",
    "Liam",
    "Sofia",
    "Ethan",
    "Chloe",
    "Lucas",
    "Nora",
    "Oscar",
];

const getDicebearUrl = (style: AvatarStyle, seed: string) => `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;

export default function Create() {
    const [name, setName] = useState("");
    const [selectedRole, setSelectedRole] = useState<string>("");
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedAvatarStyle, setSelectedAvatarStyle] = useState<AvatarStyle>("bottts-neutral");
    const [selectedAvatarSeed, setSelectedAvatarSeed] = useState<string>(AVATAR_SEEDS[0]);
    const pinInputRef = useRef<TextInput>(null);

    const handlePinChange = (value: string) => {
        if (value.length <= 4 && /^\d*$/.test(value)) {
            setPin(value);
        }
    };

    const isFormValid = () => {
        if (!name.trim() || !selectedRole) return false;
        if (selectedRole === "PARENT") return pin.length === 4;
        return true;
    };

    const handleSubmit = async () => {
        if (!isFormValid()) return;

        setLoading(true);
        try {
            await authService.subAccountRegister({
                name: name.trim(),
                role: selectedRole,
                pin: selectedRole === "PARENT" ? pin : undefined,
                iconStyle: selectedAvatarStyle,
                iconName: selectedAvatarSeed,
            });
            Alert.alert("Succès", "Compte créé avec succès", [{ text: "OK", onPress: () => router.back() }]);
        } catch (error: any) {
            console.error("Error creating sub-account:", error);
            Alert.alert("Erreur", error.response?.data?.message || "Impossible de créer le compte");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Nouveau compte</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                    <Cross width={24} height={24} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Nom */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Nom du profil</Text>
                    <View style={[styles.inputContainer, name.trim() ? styles.inputContainerValid : null]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ex: Emma, Papa, Maman..."
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            maxLength={50}
                        />
                        {name.trim() && <Ionicons name="checkmark-outline" size={18} color={colors.jadegreen[100]} />}
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
                                    setPin("");
                                }}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.roleIconContainer, { backgroundColor: `${option.color}20` }]}>
                                    <Ionicons name={option.icon as any} size={22} color={option.color} />
                                </View>
                                <View style={styles.roleInfo}>
                                    <Text style={[styles.roleLabel, selectedRole === option.value && styles.roleLabelSelected]}>{option.label}</Text>
                                    <Text style={styles.roleDescription}>{option.description}</Text>
                                </View>
                                <View style={[styles.radioCircle, selectedRole === option.value && styles.radioCircleSelected]}>
                                    {selectedRole === option.value && <View style={styles.radioCircleInner} />}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Avatar */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Avatar</Text>

                    {/* Aperçu */}
                    <View style={styles.avatarPreviewContainer}>
                        <View style={styles.avatarPreview}>
                            <SvgUri uri={getDicebearUrl(selectedAvatarStyle, selectedAvatarSeed)} width={80} height={80} />
                        </View>
                        <Text style={styles.avatarPreviewLabel}>{selectedAvatarSeed}</Text>
                    </View>

                    {/* Sélection du style */}
                    <View style={styles.styleTabsContainer}>
                        {AVATAR_STYLES.map((style) => (
                            <TouchableOpacity
                                key={style.key}
                                style={[styles.styleTab, selectedAvatarStyle === style.key && styles.styleTabSelected]}
                                onPress={() => setSelectedAvatarStyle(style.key)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.styleTabText, selectedAvatarStyle === style.key && styles.styleTabTextSelected]}>
                                    {style.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Grille des seeds */}
                    <FlatList
                        data={AVATAR_SEEDS}
                        keyExtractor={(item) => item}
                        numColumns={4}
                        scrollEnabled={false}
                        renderItem={({ item: seed }) => (
                            <TouchableOpacity
                                style={[styles.avatarOption, selectedAvatarSeed === seed && styles.avatarOptionSelected]}
                                onPress={() => setSelectedAvatarSeed(seed)}
                                activeOpacity={0.7}
                            >
                                <SvgUri uri={getDicebearUrl(selectedAvatarStyle, seed)} width={56} height={56} />
                            </TouchableOpacity>
                        )}
                    />
                </View>

                {/* Code PIN - Affiché seulement pour les parents */}
                {selectedRole === "PARENT" && (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Code de sécurité</Text>
                        <Text style={styles.sectionDescription}>Choisissez un code à 4 chiffres pour protéger ce compte</Text>

                        <TouchableOpacity style={styles.pinContainer} onPress={() => pinInputRef.current?.focus()} activeOpacity={1}>
                            <View style={styles.pinDisplay}>
                                {[0, 1, 2, 3].map((index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.pinBox,
                                            pin.length > index && styles.pinBoxFilled,
                                            pin.length === index && styles.pinBoxActive,
                                        ]}
                                    >
                                        {pin.length > index && <Text style={styles.pinStar}>*</Text>}
                                    </View>
                                ))}
                            </View>
                            <TextInput
                                ref={pinInputRef}
                                style={styles.hiddenPinInput}
                                value={pin}
                                onChangeText={handlePinChange}
                                keyboardType="number-pad"
                                maxLength={4}
                                secureTextEntry
                                autoFocus
                            />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Bouton de création */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.createButton, (!isFormValid() || loading) && styles.createButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={!isFormValid() || loading}
                >
                    <Text style={styles.createButtonText}>{loading ? "Création..." : "Créer le compte"}</Text>
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
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
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
    sectionDescription: {
        ...typography.sm,
        color: colors.carbon[60],
        marginBottom: spacing.md,
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: spacing.sm,
        borderWidth: 2,
        borderColor: colors.carbon[20],
        paddingHorizontal: spacing.base,
        height: 53,
    },
    inputContainerValid: {
        borderColor: colors.jadegreen[100],
        borderWidth: 1,
    },
    textInput: {
        flex: 1,
        ...typography.md,
        color: colors.carbon[100],
    },
    roleContainer: {
        gap: spacing.md,
    },
    roleCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: spacing.sm,
        borderWidth: 2,
        borderColor: colors.carbon[20],
        paddingLeft: spacing.lg,
        paddingRight: spacing.md,
        paddingVertical: spacing.md,
    },
    roleCardSelected: {
        backgroundColor: colors.primary[10],
        borderColor: colors.primary[100],
    },
    roleIconContainer: {
        width: 44,
        height: 44,
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
        color: colors.carbon[100],
        marginBottom: 2,
    },
    roleLabelSelected: {
        ...typography.bold,
    },
    roleDescription: {
        ...typography.sm,
        color: colors.carbon[60],
        lineHeight: 18,
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.carbon[20],
        justifyContent: "center",
        alignItems: "center",
    },
    radioCircleSelected: {
        borderColor: colors.primary[100],
    },
    radioCircleInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary[100],
    },
    // Avatar
    avatarPreviewContainer: {
        alignItems: "center",
        marginBottom: spacing.lg,
    },
    avatarPreview: {
        width: 100,
        height: 100,
        borderRadius: spacing.sm,
        backgroundColor: colors.primary[10],
        borderWidth: 2,
        borderColor: colors.primary[100],
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    avatarPreviewLabel: {
        ...typography.sm,
        color: colors.carbon[60],
        marginTop: spacing.sm,
    },
    styleTabsContainer: {
        flexDirection: "row",
        gap: spacing.sm,
        marginBottom: spacing.base,
    },
    styleTab: {
        flex: 1,
        paddingVertical: spacing.sm,
        borderRadius: spacing.sm,
        backgroundColor: colors.carbon[10],
        borderWidth: 1.5,
        borderColor: colors.carbon[20],
        alignItems: "center",
    },
    styleTabSelected: {
        backgroundColor: colors.primary[20],
        borderColor: colors.primary[100],
    },
    styleTabText: {
        ...typography.sm,
        color: colors.carbon[60],
    },
    styleTabTextSelected: {
        ...typography.bold,
        color: colors.carbon[100],
    },
    avatarOption: {
        flex: 1,
        aspectRatio: 1,
        margin: spacing.xs,
        borderRadius: spacing.sm,
        backgroundColor: colors.carbon[10],
        borderWidth: 1.5,
        borderColor: colors.carbon[20],
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    avatarOptionSelected: {
        borderColor: colors.primary[100],
        backgroundColor: colors.primary[20],
    },
    // PIN
    pinContainer: {
        alignItems: "center",
        gap: spacing.base,
    },
    pinDisplay: {
        flexDirection: "row",
        gap: spacing.base,
    },
    pinBox: {
        width: 64,
        height: 64,
        borderRadius: spacing.sm,
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.carbon[20],
        justifyContent: "center",
        alignItems: "center",
    },
    pinBoxActive: {
        borderColor: colors.primary[100],
    },
    pinBoxFilled: {
        borderColor: colors.primary[100],
    },
    pinStar: {
        ...typography.xl,
        color: colors.carbon[100],
        fontWeight: "bold",
    },
    hiddenPinInput: {
        position: "absolute",
        left: -9999,
        opacity: 0,
    },
    bottomPadding: {
        height: 100,
    },
    footer: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.lg,
        paddingTop: spacing.base,
    },
    createButton: {
        backgroundColor: colors.primary[100],
        paddingVertical: spacing.md,
        borderRadius: spacing.sm,
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
