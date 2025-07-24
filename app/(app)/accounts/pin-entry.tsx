import React, { useState, useRef, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
	SafeAreaView,
} from "react-native";
import { useFonts } from "expo-font";
import { DMSans_700Bold, DMSans_400Regular, DMSans_600SemiBold } from "@expo-google-fonts/dm-sans";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { TokenStorage, UserStorage } from "@/utils/storage";
import { logger } from "@/utils/logger";

export default function PinEntry() {
	const params = useLocalSearchParams();
	const accountId = params.accountId as string;
	const accountName = params.accountName as string;

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
			logger.log("Sub-account login successful:", response);
			await TokenStorage.setSubAccountToken(response.token);

			// Get sub-account details
			const accountDetails = await userService.getSubAccount();
			await UserStorage.setSubAccount(accountDetails);
			await UserStorage.setSubAccountId(accountId);

			// Navigate to home
			router.replace("/(app)/home/parent");
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
					<Text style={[styles.subtitle, fontStylesRegular]}>
						Saisissez votre code pour accéder à votre espace personnel.
					</Text>
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
				<TouchableOpacity
					style={styles.pinContainer}
					onPress={() => inputRef.current?.focus()}
					activeOpacity={1}
				>
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
						<Ionicons name="information-circle" size={20} color="#FF6B6B" />
						<Text style={[styles.errorText, fontStylesRegular]}>{error}</Text>
					</View>
				)}

				{/* Espace flexible pour pousser le bouton en bas */}
				<View style={styles.spacer} />

				{/* Bouton d'accès */}
				<TouchableOpacity
					style={[
						styles.accessButton,
						pin.length === 4 && !loading ? styles.accessButtonActive : styles.accessButtonDisabled,
					]}
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
		backgroundColor: "#f8f9fa",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingTop: 10,
		paddingBottom: 20,
	},
	headerSpacer: {
		width: 44,
	},
	closeButton: {
		width: 44,
		height: 44,
		backgroundColor: "#333",
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
	},
	content: {
		flex: 1,
		paddingHorizontal: 40,
		paddingTop: 40,
	},
	titleContainer: {
		alignItems: "center",
		marginBottom: 60,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 16,
		textAlign: "center",
	},
	subtitle: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		lineHeight: 22,
		paddingHorizontal: 20,
	},
	hiddenInput: {
		position: "absolute",
		left: -9999,
		opacity: 0,
	},
	pinContainer: {
		alignItems: "center",
		marginBottom: 30,
	},
	pinDisplay: {
		flexDirection: "row",
		gap: 16,
	},
	pinBox: {
		width: 64,
		height: 64,
		borderRadius: 12,
		backgroundColor: "#fff",
		borderWidth: 2,
		borderColor: "#e0e0e0",
		justifyContent: "center",
		alignItems: "center",
	},
	pinBoxActive: {
		borderColor: "#6C5CE7",
	},
	pinBoxError: {
		borderColor: "#FF6B6B",
	},
	pinStar: {
		fontSize: 24,
		color: "#333",
		fontWeight: "bold",
	},
	errorContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FFE5E5",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 12,
		gap: 8,
		marginBottom: 20,
	},
	errorText: {
		color: "#FF6B6B",
		fontSize: 14,
		flex: 1,
	},
	spacer: {
		flex: 1,
	},
	accessButton: {
		borderRadius: 12,
		paddingVertical: 16,
		paddingHorizontal: 32,
		alignItems: "center",
		marginBottom: 40,
	},
	accessButtonDisabled: {
		backgroundColor: "#e0e0e0",
	},
	accessButtonActive: {
		backgroundColor: "#6C5CE7",
	},
	accessButtonText: {
		fontSize: 16,
		fontWeight: "600",
	},
	accessButtonTextDisabled: {
		color: "#999",
	},
	accessButtonTextActive: {
		color: "#fff",
	},
});
