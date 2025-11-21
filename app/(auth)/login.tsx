import React, { useState } from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import { SafeAreaView } from "react-native-safe-area-context";
import { DMSans_700Bold, DMSans_400Regular } from "@expo-google-fonts/dm-sans";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuthContext } from "@/contexts/AuthContext";
import { logger } from "@/utils/logger";
import { colors, spacing, typography, commonStyles } from "@/styles";

export default function Login() {
    const { login } = useAuthContext();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [fontsLoaded] = useFonts({
        DMSans_700Bold,
        DMSans_400Regular,
    });

    const fontStylesTitle = fontsLoaded ? { fontFamily: "DMSans_700Bold" } : {};
    const fontStylesRegular = fontsLoaded ? { fontFamily: "DMSans_400Regular" } : {};

    const validatePassword = (password: string) => {
        const hasMinLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        return hasMinLength && hasUpperCase && hasNumber;
    };

    const isFormValid = email.trim() && password && validatePassword(password);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs");
            return;
        }

        if (!validatePassword(password)) {
            Alert.alert("Erreur", "Le mot de passe doit contenir 8 caractères, 1 majuscule et 1 chiffre");
            return;
        }

        setLoading(true);
        try {
            const result = await login(email, password);
            if (!result.success) {
                Alert.alert("Erreur", result.error || "Connexion échouée");
            } else {
                router.replace("/(app)/accounts");
            }
        } catch (error: any) {
            Alert.alert("Erreur", "Une erreur inattendue s'est produite");
        } finally {
            setLoading(false);
        }
    };

    const handleAppleSignIn = async () => {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
            });
            logger.log("Apple Sign-In Credential:", credential);
            // signed in
        } catch (e: any) {
            if (e.code === "ERR_REQUEST_CANCELED") {
                // handle that the user canceled the sign-in flow
            } else {
                // handle other errors
            }
        }
    };

    const handleGoBack = () => {
        router.replace("/");
    };

    const handleForgotPassword = () => {
        router.push("/(auth)/forgot-password");
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header avec bouton retour */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                    <Ionicons name="arrow-back" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Titre */}
                <Text style={[styles.title, fontStylesTitle]}>Ravis de vous revoir !</Text>

                {/* Champ Email */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, fontStylesRegular]}
                        placeholder="Email"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                    />
                </View>

                {/* Champ Mot de passe */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, styles.passwordInput, fontStylesRegular]}
                        placeholder="Mot de passe*"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoComplete="password"
                    />
                    <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#999" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.forgotPasswordLink} onPress={handleForgotPassword}>
                    Mot de passe oublié ?
                </Text>

                {/* Bouton Se connecter */}
                <TouchableOpacity
                    style={[styles.loginButton, isFormValid && !loading ? styles.loginButtonActive : styles.loginButtonDisabled]}
                    onPress={handleLogin}
                    disabled={!isFormValid || loading}
                >
                    <Text
                        style={[
                            styles.loginButtonText,
                            fontStylesRegular,
                            isFormValid && !loading ? styles.loginButtonTextActive : styles.loginButtonTextDisabled,
                        ]}
                    >
                        {loading ? "Connexion..." : "Se connecter"}
                    </Text>
                </TouchableOpacity>
                <View style={styles.divider}></View>
                <View style={{ flex: 1, justifyContent: "flex-end", paddingBottom: 30 }}>
                    <AppleAuthentication.AppleAuthenticationButton
                        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                        cornerRadius={12}
                        style={styles.button}
                        onPress={handleAppleSignIn}
                    />
                </View>
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
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xs,
        paddingBottom: spacing.lg,
    },
    backButton: {
        width: 44,
        height: 44,
        backgroundColor: colors.carbon[100],
        borderRadius: spacing.md,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing["3xl"],
    },
    title: {
        ...typography.heading,
        marginBottom: spacing["5xl"],
        textAlign: "left",
    },
    inputContainer: {
        position: "relative",
        marginBottom: spacing.lg,
    },
    input: {
        ...commonStyles.input,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.base,
    },
    passwordInput: {
        paddingRight: 50,
    },
    eyeButton: {
        position: "absolute",
        right: spacing.base,
        top: spacing.base,
        padding: spacing.xs,
    },
    passwordCriteria: {
        ...typography.sm,
        color: colors.carbon[50],
        marginBottom: spacing["3xl"],
        marginTop: -spacing.xs,
    },
    loginButton: {
        ...commonStyles.button,
        marginBottom: spacing.xl,
    },
    loginButtonDisabled: {
        ...commonStyles.buttonDisabled,
    },
    loginButtonActive: {
        backgroundColor: colors.primary[100],
    },
    loginButtonText: {
        ...typography.button,
    },
    loginButtonTextDisabled: {
        color: colors.carbon[50],
    },
    loginButtonTextActive: {
        color: colors.white,
    },
    forgotPasswordLink: {
        ...typography.sm,
        color: colors.primary[100],
        textAlign: "right",
        marginBottom: spacing["3xl"],
    },
    registerContainer: {
        alignItems: "center",
        paddingVertical: spacing.md,
    },
    registerText: {
        ...typography.md,
        color: colors.carbon[100],
    },
    button: {
        borderRadius: spacing.md,
        paddingVertical: spacing.base,
        paddingHorizontal: spacing["2xl"],
        ...typography.md,
        height: 50,
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginVertical: spacing.lg,
    },
});
