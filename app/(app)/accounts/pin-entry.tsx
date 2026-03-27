import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { DMSans_700Bold, DMSans_400Regular, DMSans_600SemiBold } from "@expo-google-fonts/dm-sans";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { TokenStorage, UserStorage } from "@/utils/storage";
import { logger } from "@/utils/logger";
import { useAuthContext } from "@/contexts/AuthContext";
import { DEVICE_PLATFORM } from "@/types/api";
import { colors, spacing, typography, shadows } from "@/styles";

export default function PinEntry() {
    const params = useLocalSearchParams();
    const accountId = params.accountId as string;
    const accountName = params.accountName as string;
    const { user } = useAuthContext();

    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef<TextInput>(null);

    const [fontsLoaded] = useFonts({
        DMSans_700Bold,
        DMSans_400Regular,
        DMSans_600SemiBold,
    });

    const fontStylesTitle = fontsLoaded ? { fontFamily: "DMSans_700Bold" } : {};
    const fontStylesRegular = fontsLoaded ? { fontFamily: "DMSans_400Regular" } : {};
    const fontStylesSemiBold = fontsLoaded ? { fontFamily: "DMSans_600SemiBold" } : {};

    useEffect(() => {
        // Focus on input when page loads
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    }, []);

    const handlePinChange = (value: string) => {
        // Only allow digits and max 4 characters
        if (/^\d*$/.test(value) && value.length <= 4) {
            setPin(value);
            setError("");

            // Auto-submit when 4 digits are entered
            if (value.length === 4) {
                setTimeout(() => {
                    handleSubmit(value);
                }, 200);
            }
        }
    };

    const handleSubmit = async (pinValue: string = pin) => {
        if (pinValue.length !== 4) {
            setError("Veuillez saisir un code à 4 chiffres");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Login to sub-account with PIN
            const response = await authService.subAccountLogin(accountId, pinValue);
            await TokenStorage.setSubAccountToken(response.token);

            // Get sub-account details
            const accountDetails = await userService.getSubAccount();
            await UserStorage.setSubAccount(accountDetails);
            await UserStorage.setSubAccountId(accountId);

            if (user?.id) {
                const devicePlatform = (Platform.OS === "ios" ? "IOS" : "ANDROID") as DEVICE_PLATFORM;
                authService.deviceLogin({ userId: user.id, token: response.token, devicePlatform }).catch(() => {});
            }

            // Navigate to home based on role
            const role = accountDetails.role?.toUpperCase();
            if (role === "CHILD") {
                router.replace("/(app)/home/child");
            } else {
                await TokenStorage.saveParentSubAccountToken(response.token);
                router.replace("/(app)/home/parent");
            }
        } catch (error: any) {
            logger.error("PIN verification failed:", error);
            setError("Oups, ce code ne semble pas fonctionner !");
            setPin("");
            // Refocus input after error
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const getPinBoxStyle = (index: number) => {
        const hasValue = pin.length > index;

        if (error) {
            return [styles.pinBox, styles.pinBoxError];
        } else if (hasValue || pin.length === index) {
            return [styles.pinBox, styles.pinBoxActive];
        } else {
            return [styles.pinBox];
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header avec bouton fermer */}
            <View style={styles.header}>
                <View style={styles.headerSpacer} />
                <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                    <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Titre et sous-titre */}
                <View style={styles.titleContainer}>
                    <Text style={[styles.title, fontStylesTitle]}>Entrez votre code PIN</Text>
                    <Text style={[styles.subtitle, fontStylesRegular]}>Saisissez votre code pour accéder à votre espace personnel.</Text>
                </View>

                {/* Hidden input */}
                <TextInput
                    ref={inputRef}
                    style={styles.hiddenInput}
                    value={pin}
                    onChangeText={handlePinChange}
                    keyboardType="number-pad"
                    maxLength={4}
                    autoFocus
                    secureTextEntry
                />

                {/* PIN Display */}
                <TouchableOpacity style={styles.pinContainer} onPress={() => inputRef.current?.focus()} activeOpacity={1}>
                    <View style={styles.pinDisplay}>
                        {[0, 1, 2, 3].map((index) => (
                            <View key={index} style={getPinBoxStyle(index)}>
                                {pin.length > index && <Text style={styles.pinStar}>*</Text>}
                            </View>
                        ))}
                    </View>
                </TouchableOpacity>

                {/* Message d'erreur */}
                {error && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="information-circle" size={20} color={colors.tertiary[100]} />
                        <Text style={[styles.errorText, fontStylesRegular]}>{error}</Text>
                    </View>
                )}

                {/* Espace flexible pour pousser le bouton en bas */}
                <View style={styles.spacer} />

                {/* Bouton d'accès */}
                <TouchableOpacity
                    style={[styles.accessButton, pin.length === 4 && !loading ? styles.accessButtonActive : styles.accessButtonDisabled]}
                    onPress={() => handleSubmit()}
                    disabled={pin.length !== 4 || loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text
                            style={[
                                styles.accessButtonText,
                                fontStylesSemiBold,
                                pin.length === 4 ? styles.accessButtonTextActive : styles.accessButtonTextDisabled,
                            ]}
                        >
                            Accéder à mon profil
                        </Text>
                    )}
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
    },
    headerSpacer: {
        width: 44,
    },
    closeButton: {
        width: 44,
        height: 44,
        backgroundColor: colors.carbon[100],
        borderRadius: spacing.md,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing["2xl"],
        paddingTop: spacing["2xl"],
    },
    titleContainer: {
        alignItems: "center",
        marginBottom: spacing["5xl"],
    },
    title: {
        ...typography.heading,
        marginBottom: spacing.base,
        textAlign: "center",
    },
    subtitle: {
        ...typography.subtitle,
        textAlign: "center",
        paddingHorizontal: spacing.lg,
    },
    hiddenInput: {
        position: "absolute",
        left: -9999,
        opacity: 0,
    },
    pinContainer: {
        alignItems: "center",
        marginBottom: spacing["3xl"],
    },
    pinDisplay: {
        flexDirection: "row",
        gap: spacing.base,
    },
    pinBox: {
        width: 64,
        height: 64,
        borderRadius: spacing.md,
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: "center",
        alignItems: "center",
    },
    pinBoxActive: {
        borderColor: colors.primary[100],
    },
    pinBoxError: {
        borderColor: colors.tertiary[100],
    },
    pinStar: {
        ...typography.xl,
        color: colors.carbon[100],
        fontWeight: "bold",
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.tertiary[20],
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
        borderRadius: spacing.md,
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    errorText: {
        ...typography.sm,
        color: colors.tertiary[100],
        flex: 1,
    },
    spacer: {
        flex: 1,
    },
    accessButton: {
        ...shadows.none,
        borderRadius: spacing.md,
        paddingVertical: spacing.base,
        paddingHorizontal: spacing["2xl"],
        alignItems: "center",
        marginBottom: spacing["3xl"],
    },
    accessButtonDisabled: {
        backgroundColor: colors.carbon[20],
    },
    accessButtonActive: {
        backgroundColor: colors.primary[100],
    },
    accessButtonText: {
        ...typography.button,
    },
    accessButtonTextDisabled: {
        color: colors.carbon[50],
    },
    accessButtonTextActive: {
        color: colors.white,
    },
});
