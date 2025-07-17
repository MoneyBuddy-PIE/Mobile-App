import React, { use, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ScrollView } from "react-native";
import { router } from "expo-router";

import { authService } from "@/services/authService";

interface RoleOption {
	value: string;
	label: string;
}

const roleOptions: RoleOption[] = [
	{ value: "CHILD", label: "Child" },
	{ value: "PARENT", label: "Parent" },
];

export default function Create() {
	const [name, setName] = useState("");
	const [selectedRole, setSelectedRole] = useState<string>("");
	const [pin, setPin] = useState("");
	const [loading, setLoading] = useState(false);

	const handlePinChange = (value: string) => {
		// Only allow 4 digits
		if (value.length <= 4 && /^\d*$/.test(value)) {
			setPin(value);
		}
	};

	const validateForm = () => {
		if (!name.trim()) {
			Alert.alert("Error", "Please enter a name");
			return false;
		}
		if (!selectedRole) {
			Alert.alert("Error", "Please select a role");
			return false;
		}
		if (pin.length !== 4) {
			Alert.alert("Error", "PIN must be exactly 4 digits");
			return false;
		}
		return true;
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;

		setLoading(true);
		try {
			const t = await authService.subAccountRegister({
				name: name.trim(),
				role: selectedRole,
				pin: pin,
			});
			Alert.alert("Success", "Sub-account created successfully");
			router.back();
		} catch (error: any) {
			console.error("Error creating sub-account:", error);
			Alert.alert("Error", error.response?.data?.message || "Failed to create sub-account");
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		router.back();
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView style={styles.content}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity onPress={handleCancel}>
						<Text style={styles.cancelButton}>Cancel</Text>
					</TouchableOpacity>
					<Text style={styles.title}>Create Sub-Account</Text>
					<View style={styles.placeholder} />
				</View>

				<View style={styles.form}>
					{/* Name Input */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Name</Text>
						<TextInput
							style={styles.textInput}
							placeholder="Enter account name"
							value={name}
							onChangeText={setName}
							autoCapitalize="words"
							maxLength={50}
						/>
					</View>

					{/* Role Selection */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Role</Text>
						<View style={styles.roleContainer}>
							{roleOptions.map((option) => (
								<TouchableOpacity
									key={option.value}
									style={[
										styles.roleOption,
										selectedRole === option.value && styles.roleOptionSelected,
									]}
									onPress={() => setSelectedRole(option.value)}
								>
									<Text
										style={[
											styles.roleText,
											selectedRole === option.value && styles.roleTextSelected,
										]}
									>
										{option.label}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>

					{/* PIN Input */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Security PIN</Text>
						<Text style={styles.description}>Choose a 4-digit PIN to protect this account</Text>

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
							/>

							{/* PIN Dots */}
							<View style={styles.pinDots}>
								{[1, 2, 3, 4].map((i) => (
									<View key={i} style={[styles.pinDot, pin.length >= i && styles.pinDotFilled]} />
								))}
							</View>
						</View>
					</View>

					{/* Submit Button */}
					<TouchableOpacity
						style={[
							styles.submitButton,
							(!name.trim() || !selectedRole || pin.length !== 4 || loading) &&
								styles.submitButtonDisabled,
						]}
						onPress={handleSubmit}
						disabled={!name.trim() || !selectedRole || pin.length !== 4 || loading}
					>
						<Text style={styles.submitButtonText}>{loading ? "Creating..." : "Create Sub-Account"}</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f9fa",
	},
	content: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 30,
	},
	cancelButton: {
		fontSize: 16,
		color: "#007AFF",
		fontWeight: "600",
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#333",
	},
	placeholder: {
		width: 60, // Same width as cancel button for centering
	},
	form: {
		paddingHorizontal: 20,
	},
	inputGroup: {
		marginBottom: 24,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		marginBottom: 8,
	},
	description: {
		fontSize: 14,
		color: "#666",
		marginBottom: 12,
	},
	textInput: {
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 12,
		padding: 16,
		fontSize: 16,
		color: "#333",
	},
	roleContainer: {
		flexDirection: "row",
		gap: 12,
	},
	roleOption: {
		flex: 1,
		backgroundColor: "#fff",
		borderWidth: 2,
		borderColor: "#ddd",
		borderRadius: 12,
		padding: 16,
		alignItems: "center",
	},
	roleOptionSelected: {
		borderColor: "#007AFF",
		backgroundColor: "#f0f8ff",
	},
	roleText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#666",
	},
	roleTextSelected: {
		color: "#007AFF",
	},
	pinContainer: {
		alignItems: "center",
	},
	pinInput: {
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 12,
		padding: 16,
		fontSize: 24,
		width: 120,
		textAlign: "center",
		letterSpacing: 8,
		marginBottom: 16,
	},
	pinDots: {
		flexDirection: "row",
		gap: 12,
	},
	pinDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
		backgroundColor: "#ddd",
	},
	pinDotFilled: {
		backgroundColor: "#007AFF",
	},
	submitButton: {
		backgroundColor: "#007AFF",
		borderRadius: 12,
		padding: 16,
		alignItems: "center",
		marginTop: 20,
		marginBottom: 40,
	},
	submitButtonDisabled: {
		backgroundColor: "#ccc",
	},
	submitButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
});
