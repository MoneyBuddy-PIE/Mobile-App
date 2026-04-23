import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, SafeAreaView, Button } from "react-native";
import { useFonts } from "expo-font";
import { DMSans_700Bold, DMSans_400Regular } from "@expo-google-fonts/dm-sans";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { authService } from "@/services/authService";
import { TokenStorage } from "@/utils/storage";
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithGoogle } from '../../services/authService';

export default function Register() {
	const [step, setStep] = useState(1);
	const [firstName, setFirstName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [pin, setPin] = useState("");
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

	const isStep1Valid =
		firstName.trim() &&
		email.trim() &&
		password &&
		confirmPassword &&
		validatePassword(password) &&
		password === confirmPassword;

	const handleNext = () => {
		if (!firstName.trim()) {
			Alert.alert("Erreur", "Veuillez saisir votre prénom");
			return;
		}

		if (!email.trim()) {
			Alert.alert("Erreur", "Veuillez saisir votre email");
			return;
		}

		if (!validatePassword(password)) {
			Alert.alert("Erreur", "Le mot de passe doit contenir 8 caractères, 1 majuscule et 1 chiffre");
			return;
		}

		if (password !== confirmPassword) {
			Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
			return;
		}

		setStep(2);
	};

	const handleRegister = async () => {
		if (pin.length !== 4) {
			Alert.alert("Erreur", "Le PIN doit contenir 4 chiffres");
			return;
		}

		setLoading(true);
		try {
			const response = await authService.register({
				name: firstName,
				email,
				password,
				confirmPassword,
				pin,
			});
			await TokenStorage.setToken(response.token);
			Alert.alert("Succès", "Inscription réussie !", [
				{ text: "OK", onPress: () => router.replace("/(app)/accounts") },
			]);
		} catch (error: any) {
			console.log("Registration error:", error);
			const errorMessage = error.response?.data?.message || error.response?.data?.error || "Inscription échouée";
			Alert.alert("Erreur", errorMessage);
		} finally {
			setLoading(false);
		}
	};

  const handleGoogleSSO = async () => {
    try {
      const data = await signInWithGoogle();

      await AsyncStorage.setItem(
  'google_signup_data',
  JSON.stringify({
    firstName: data.user?.givenName || data.user?.name || '',
    email: data.user?.email || '',
  })
);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
  const loadData = async () => {
    const data = await AsyncStorage.getItem('google_signup_data');

    if (data) {
      const parsed = JSON.parse(data);
      setFirstName(parsed.firstName || '');
      setEmail(parsed.email || '');
    }
  };

  loadData();
}, []);

	const handlePinChange = (value: string) => {
		if (value.length <= 4 && /^\d*$/.test(value)) {
			setPin(value);
		}
	};

	const handleGoBack = () => {
		if (step === 2) {
			setStep(1);
		} else {
			router.back();
		}
	};

	if (step === 1) {
		return (
			<SafeAreaView style={styles.container}>
				{/* Header avec bouton retour */}
				<View style={styles.header}>
					<TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
						<Ionicons name="arrow-back" size={20} color="#fff" />
					</TouchableOpacity>
				</View>

				<View style={styles.content}>
					{/* Titre et sous-titre */}
					<View style={styles.titleContainer}>
						<Text style={[styles.title, fontStylesTitle]}>Créez votre compte</Text>
						<Text style={[styles.subtitle, fontStylesRegular]}>
							Vous serez le guide de votre enfant dans son aventure financière.
						</Text>
					</View>

					{/* Bouton Google */}
					<GoogleSigninButton
        				size={GoogleSigninButton.Size.Wide}
        				color={GoogleSigninButton.Color.Dark}
        				onPress={handleGoogleSSO}
						style={{ width: '100%', height: 48, marginTop: 20 }}
      				/>

					{/* Champ Prénom */}
					<View style={styles.inputContainer}>
						<TextInput
							style={[styles.input, fontStylesRegular]}
							placeholder="Prénom*"
							placeholderTextColor="#999"
							value={firstName}
							onChangeText={setFirstName}
							autoCapitalize="words"
						/>
					</View>

					{/* Champ Email */}
					<View style={styles.inputContainer}>
						<TextInput
							style={[styles.input, fontStylesRegular]}
							placeholder="Email*"
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
						/>
						<TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
							<Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#999" />
						</TouchableOpacity>
					</View>

					{/* Critères de mot de passe */}
					<Text style={[styles.passwordCriteria, fontStylesRegular]}>
						8 caractères, 1 majuscule, 1 chiffre
					</Text>

					{/* Champ Confirmation mot de passe */}
					<View style={styles.inputContainer}>
						<TextInput
							style={[styles.input, styles.passwordInput, fontStylesRegular]}
							placeholder="Confirmez votre mot de passe*"
							placeholderTextColor="#999"
							value={confirmPassword}
							onChangeText={setConfirmPassword}
							secureTextEntry={!showConfirmPassword}
						/>
						<TouchableOpacity
							style={styles.eyeButton}
							onPress={() => setShowConfirmPassword(!showConfirmPassword)}
						>
							<Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#999" />
						</TouchableOpacity>
					</View>

					{/* Bouton Je m'inscris */}
					<TouchableOpacity
						style={[
							styles.registerButton,
							isStep1Valid ? styles.registerButtonActive : styles.registerButtonDisabled,
						]}
						onPress={handleNext}
						disabled={!isStep1Valid}
					>
						<Text
							style={[
								styles.registerButtonText,
								fontStylesRegular,
								isStep1Valid ? styles.registerButtonTextActive : styles.registerButtonTextDisabled,
							]}
						>
							Je m'inscris
						</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	// Étape 2 - Configuration du PIN
	return (
		<SafeAreaView style={styles.container}>
			{/* Header avec bouton retour */}
			<View style={styles.header}>
				<TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
					<Ionicons name="arrow-back" size={20} color="#fff" />
				</TouchableOpacity>
			</View>

			<View style={styles.content}>
				{/* Titre et sous-titre pour le PIN */}
				<View style={styles.titleContainer}>
					<Text style={[styles.title, fontStylesTitle]}>Créez votre PIN</Text>
					<Text style={[styles.subtitle, fontStylesRegular]}>
						Choisissez un code à 4 chiffres pour sécuriser votre compte principal.
					</Text>
				</View>

				{/* Icône de sécurité */}
				<View style={styles.pinIconContainer}>
					<Text style={styles.pinIcon}>🔒</Text>
				</View>

				{/* Input PIN */}
				<View style={styles.pinContainer}>
					<TextInput
						style={[styles.pinInput, fontStylesRegular]}
						value={pin}
						onChangeText={handlePinChange}
						keyboardType="numeric"
						maxLength={4}
						secureTextEntry
						textAlign="center"
						placeholder="••••"
						placeholderTextColor="#999"
					/>

					{/* Indicateurs de PIN */}
					<View style={styles.pinDots}>
						{[1, 2, 3, 4].map((i) => (
							<View key={i} style={[styles.pinDot, pin.length >= i && styles.pinDotFilled]} />
						))}
					</View>
				</View>

				{/* Bouton Terminer */}
				<TouchableOpacity
					style={[
						styles.registerButton,
						pin.length === 4 && !loading ? styles.registerButtonActive : styles.registerButtonDisabled,
					]}
					onPress={handleRegister}
					disabled={pin.length !== 4 || loading}
				>
					<Text
						style={[
							styles.registerButtonText,
							fontStylesRegular,
							pin.length === 4 && !loading
								? styles.registerButtonTextActive
								: styles.registerButtonTextDisabled,
						]}
					>
						{loading ? "Création..." : "Terminer l'inscription"}
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
		paddingTop: 20,
	},
	titleContainer: {
		marginBottom: 60,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 16,
		textAlign: "left",
	},
	subtitle: {
		fontSize: 16,
		color: "#666",
		lineHeight: 24,
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
		marginBottom: 20,
		marginTop: -10,
	},
	registerButton: {
		borderRadius: 12,
		paddingVertical: 16,
		paddingHorizontal: 32,
		alignItems: "center",
		marginTop: 20,
	},
	registerButtonDisabled: {
		backgroundColor: "#e0e0e0",
	},
	registerButtonActive: {
		backgroundColor: "#6C5CE7",
	},
	registerButtonText: {
		fontSize: 16,
		fontWeight: "600",
	},
	registerButtonTextDisabled: {
		color: "#999",
	},
	registerButtonTextActive: {
		color: "#fff",
	},

	// Styles pour l'étape PIN
	pinIconContainer: {
		alignItems: "center",
		marginBottom: 40,
	},
	pinIcon: {
		fontSize: 60,
	},
	pinContainer: {
		alignItems: "center",
		marginBottom: 40,
	},
	pinInput: {
		borderWidth: 1,
		borderColor: "#e0e0e0",
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 16,
		fontSize: 24,
		width: 120,
		textAlign: "center",
		letterSpacing: 8,
		marginBottom: 20,
		backgroundColor: "#fff",
	},
	pinDots: {
		flexDirection: "row",
		gap: 12,
	},
	pinDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
		backgroundColor: "#e0e0e0",
	},
	pinDotFilled: {
		backgroundColor: "#6C5CE7",
	},
});
