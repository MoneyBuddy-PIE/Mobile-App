import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, SafeAreaView } from "react-native";
import { useFonts } from "expo-font";
import { DMSans_700Bold, DMSans_400Regular } from "@expo-google-fonts/dm-sans";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuthContext } from "@/contexts/AuthContext";

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

	const handleGoBack = () => {
		router.replace("/");
	};

	const handleForgotPassword = () => {
		Alert.alert("Mot de passe oublié", "Cette fonctionnalité sera bientôt disponible");
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

				{/* Critères de mot de passe */}
				<Text style={[styles.passwordCriteria, fontStylesRegular]}>8 caractères, 1 majuscule, 1 chiffre</Text>

				{/* Bouton Se connecter */}
				<TouchableOpacity
					style={[
						styles.loginButton,
						isFormValid && !loading ? styles.loginButtonActive : styles.loginButtonDisabled,
					]}
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
		marginBottom: 60,
		textAlign: "left",
	},
	inputContainer: {
		position: "relative",
		marginBottom: 20,
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
	passwordInput: {
		paddingRight: 50,
	},
	eyeButton: {
		position: "absolute",
		right: 16,
		top: 16,
		padding: 4,
	},
	passwordCriteria: {
		fontSize: 14,
		color: "#999",
		marginBottom: 40,
		marginTop: -10,
	},
	loginButton: {
		borderRadius: 12,
		paddingVertical: 16,
		paddingHorizontal: 32,
		alignItems: "center",
		marginBottom: 24,
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
	forgotPasswordLink: {
		fontSize: 16,
		color: "#6C5CE7",
		textAlign: "center",
		marginBottom: 40,
	},
	registerContainer: {
		alignItems: "center",
		paddingVertical: 12,
	},
	registerText: {
		fontSize: 16,
		color: "#333",
	},
});
