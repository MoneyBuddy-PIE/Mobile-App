import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { DMSans_700Bold, DMSans_400Regular, DMSans_600SemiBold } from "@expo-google-fonts/dm-sans";
import { authService } from "@/services/authService";
import { typography } from "@/styles/typography";

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
		color: "#00D4AA",
	},
	{
		value: "PARENT",
		label: "Parent",
		description: "Superviser et enseigner la gestion financière",
		icon: "person-outline",
		color: "#4A90E2",
	},
];

export default function Create() {
	const [name, setName] = useState("");
	const [selectedRole, setSelectedRole] = useState<string>("");
	const [pin, setPin] = useState("");
	const [loading, setLoading] = useState(false);

	const [fontsLoaded] = useFonts({
		DMSans_700Bold,
		DMSans_400Regular,
		DMSans_600SemiBold,
	});

	const fontStylesTitle = fontsLoaded ? { fontFamily: "DMSans_700Bold" } : {};
	const fontStylesRegular = fontsLoaded ? { fontFamily: "DMSans_400Regular" } : {};
	const fontStylesSemiBold = fontsLoaded ? { fontFamily: "DMSans_600SemiBold" } : {};

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
				<TouchableOpacity style={styles.backButton} onPress={handleCancel}>
					<Ionicons name="arrow-back" size={20} color="#fff" />
				</TouchableOpacity>
				<Text style={[styles.headerTitle, fontStylesTitle]}>Nouveau compte</Text>
				<View style={styles.placeholder} />
			</View>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Description */}
				<View style={styles.descriptionContainer}>
					<Text style={[styles.subtitle, fontStylesRegular]}>
						Créez un nouveau profil pour votre enfant ou un autre parent
					</Text>
				</View>

				{/* Nom */}
				<View style={styles.section}>
					<Text style={[styles.sectionLabel, fontStylesSemiBold]}>Nom du profil</Text>
					<View style={styles.inputContainer}>
						<TextInput
							style={[styles.textInput, fontStylesRegular]}
							placeholder="Ex: Emma, Papa, Maman..."
							value={name}
							onChangeText={setName}
							autoCapitalize="words"
							maxLength={50}
						/>
					</View>
				</View>

				{/* Sélection du rôle */}
				<View style={styles.section}>
					<Text style={[styles.sectionLabel, fontStylesSemiBold]}>Type de compte</Text>
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
									<Text
										style={[
											styles.roleLabel,
											fontStylesSemiBold,
											selectedRole === option.value && styles.roleLabelSelected,
										]}
									>
										{option.label}
									</Text>
									<Text
										style={[
											styles.roleDescription,
											fontStylesRegular,
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
						<Text style={[styles.sectionLabel, fontStylesSemiBold]}>Code de sécurité</Text>
						<Text style={[styles.sectionDescription, fontStylesRegular]}>
							Choisissez un code à 4 chiffres pour protéger ce compte
						</Text>

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
						selectedRoleOption &&
							!loading &&
							isFormValid() && { backgroundColor: selectedRoleOption.color },
					]}
					onPress={handleSubmit}
					disabled={!isFormValid() || loading}
				>
					<Text style={[styles.createButtonText, fontStylesSemiBold]}>
						{loading ? "Création en cours..." : "Créer le compte"}
					</Text>
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
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},
	backButton: {
		width: 44,
		height: 44,
		backgroundColor: "#333",
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
	},
	placeholder: {
		width: 44,
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	descriptionContainer: {
		paddingVertical: 24,
		alignItems: "center",
	},
	subtitle: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		lineHeight: 22,
	},
	section: {
		marginBottom: 32,
	},
	sectionLabel: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		marginBottom: 8,
	},
	sectionDescription: {
		fontSize: 14,
		color: "#666",
		marginBottom: 16,
		lineHeight: 20,
	},
	inputContainer: {
		backgroundColor: "#fff",
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#e0e0e0",
		shadowColor: "#BFD0EA",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.6,
		shadowRadius: 0,
		elevation: 2,
	},
	textInput: {
		fontSize: 16,
		color: "#333",
		paddingHorizontal: 16,
		paddingVertical: 16,
	},
	roleContainer: {
		gap: 12,
	},
	roleCard: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 20,
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 2,
		borderColor: "#e0e0e0",
		shadowColor: "#BFD0EA",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.6,
		shadowRadius: 0,
		elevation: 2,
	},
	roleCardSelected: {
		borderColor: "#6C5CE7",
		backgroundColor: "#f8f9ff",
	},
	roleIconContainer: {
		width: 48,
		height: 48,
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 16,
	},
	roleInfo: {
		flex: 1,
	},
	roleLabel: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		marginBottom: 4,
	},
	roleLabelSelected: {
		color: "#6C5CE7",
	},
	roleDescription: {
		fontSize: 14,
		color: "#666",
		lineHeight: 18,
	},
	roleDescriptionSelected: {
		color: "#6C5CE7",
	},
	selectedIndicator: {
		marginLeft: 12,
	},
	pinContainer: {
		alignItems: "center",
		gap: 16,
	},
	pinInput: {
		backgroundColor: "#fff",
		borderWidth: 2,
		borderColor: "#e0e0e0",
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 16,
		fontSize: 24,
		width: 120,
		textAlign: "center",
		letterSpacing: 8,
		shadowColor: "#BFD0EA",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.6,
		shadowRadius: 0,
		elevation: 2,
	},
	pinIndicators: {
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
	bottomPadding: {
		height: 40,
	},
	footer: {
		paddingHorizontal: 20,
		paddingBottom: 20,
		paddingTop: 16,
		backgroundColor: "#fff",
		borderTopWidth: 1,
		borderTopColor: "#e0e0e0",
	},
	createButton: {
		backgroundColor: "#6C5CE7",
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
		shadowColor: "#4E31CF",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
	},
	createButtonDisabled: {
		backgroundColor: "#ccc",
		shadowOpacity: 0,
		elevation: 0,
	},
	createButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});
