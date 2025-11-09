import React, { useState } from "react";
import { router } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { DMSans_700Bold, DMSans_400Regular } from "@expo-google-fonts/dm-sans";
import { authService } from "@/services/authService";

export default function ForgotPassword() {
    const [fontsLoaded] = useFonts({
        DMSans_700Bold,
        DMSans_400Regular,
    });
    const fontStylesTitle = fontsLoaded ? { fontFamily: "DMSans_700Bold" } : {};
    const fontStylesRegular = fontsLoaded ? { fontFamily: "DMSans_400Regular" } : {};

    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");

    const isFormValid = email.trim().length > 0;

    const handleLogin = async () => {
        if (!email) {
            Alert.alert("Erreur", "Veuillez entrer votre adresse email");
            return;
        }

        setLoading(true);
        try {
            // Here you would typically call your API to handle password reset
            await authService.forgotPassword(email).then(() => {
                Alert.alert("Succès", "Un email de réinitialisation a été envoyé si l'adresse est valide.");
            });
        } catch (error: any) {
            Alert.alert("Erreur", "Une erreur inattendue s'est produite");
        } finally {
            setLoading(false);
        }
    };

    const handleGoBack = () => {
        router.replace("/(auth)/login");
    };
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                    <Ionicons name="arrow-back" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
            <View style={styles.content}>
                <Text style={[styles.title, fontStylesTitle]}>Mot de passe oublié</Text>
                <Text style={[styles.subtitle, fontStylesRegular]}>Veuillez entrer votre adresse email pour réinitialiser votre mot de passe.</Text>
                <View style={{ marginTop: 24 }}>
                    <TextInput
                        style={[styles.input, fontStylesRegular]}
                        placeholder="Email"
                        placeholderTextColor="#999"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
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
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        backgroundColor: "#333",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
        textAlign: "left",
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginTop: 4,
        textAlign: "left",
    },
    input: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: "#333",
        backgroundColor: "#fff",
    },
    loginButton: {
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 32,
        alignItems: "center",
        marginTop: 24,
    },
    loginButtonDisabled: {
        backgroundColor: "#e0e0e0",
    },
    loginButtonActive: {
        backgroundColor: "#6C5CE7",
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    loginButtonTextDisabled: {
        color: "#999",
    },
    loginButtonTextActive: {
        color: "#fff",
    },
});
