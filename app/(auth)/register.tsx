import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { router } from "expo-router";
import { authService } from "@/services/authService";
import { TokenStorage } from "@/utils/storage";

export default function Register() {
	const [step, setStep] = useState(1);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [name, setName] = useState("");
	const [pin, setPin] = useState("");
	const [loading, setLoading] = useState(false);

	const validatePassword = (password: string) => {
		const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
		return regex.test(password);
	};

	const handleNext = () => {
		if (!email || !password || !confirmPassword) {
			Alert.alert("Error", "Please fill in all fields");
			return;
		}

		if (!validatePassword(password)) {
			Alert.alert("Error", "Password must contain: 8+ chars, 1 uppercase, 1 lowercase, 1 number");
			return;
		}

		if (password !== confirmPassword) {
			Alert.alert("Error", "Passwords do not match");
			return;
		}

		setStep(2);
	};

	const handleRegister = async () => {
		if (pin.length !== 4) {
			Alert.alert("Error", "PIN must be 4 digits");
			return;
		}

		setLoading(true);
		try {
			const response = await authService.register({ email, password, confirmPassword, pin, name });
			await TokenStorage.setToken(response.token);
			Alert.alert("Success", "Registration successful!", [
				{ text: "OK", onPress: () => router.replace("/(app)/accounts") },
			]);
		} catch (error: any) {
			console.log("Registration error:", error);
			console.log("Error response:", error.response?.data || error.response?.data?.error);
			console.log("Error status:", error.response?.status);

			const errorMessage = error.response?.data?.message || error.response?.data?.error || "Registration failed";
			Alert.alert("Error", errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handlePinChange = (value: string) => {
		if (value.length <= 4 && /^\d*$/.test(value)) {
			setPin(value);
		}
	};

	if (step === 1) {
		return (
			<View style={styles.container}>
				<Text style={styles.title}>Create Account</Text>
				<Text style={styles.subtitle}>Step 1 of 2</Text>

				<TextInput
					style={styles.input}
					placeholder="Name"
					value={name}
					onChangeText={setName}
					autoCapitalize="words"
				/>

				<TextInput
					style={styles.input}
					placeholder="Email"
					value={email}
					onChangeText={setEmail}
					keyboardType="email-address"
					autoCapitalize="none"
				/>

				<TextInput
					style={styles.input}
					placeholder="Password"
					value={password}
					onChangeText={setPassword}
					secureTextEntry
				/>

				<TextInput
					style={styles.input}
					placeholder="Confirm Password"
					value={confirmPassword}
					onChangeText={setConfirmPassword}
					secureTextEntry
				/>

				<TouchableOpacity style={styles.button} onPress={handleNext}>
					<Text style={styles.buttonText}>Next</Text>
				</TouchableOpacity>

				<TouchableOpacity onPress={() => router.back()}>
					<Text style={styles.link}>Already have an account? Login</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Set Your PIN</Text>
			<Text style={styles.subtitle}>Step 2 of 2</Text>
			<Text style={styles.description}>Choose a 4-digit PIN to protect your profile</Text>

			<View style={styles.pinContainer}>
				<TextInput
					style={styles.pinInput}
					value={pin}
					onChangeText={handlePinChange}
					keyboardType="numeric"
					maxLength={4}
					secureTextEntry
					textAlign="center"
				/>
				<View style={styles.pinDots}>
					{[1, 2, 3, 4].map((i) => (
						<View key={i} style={[styles.pinDot, pin.length >= i && styles.pinDotFilled]} />
					))}
				</View>
			</View>

			<TouchableOpacity
				style={[styles.button, pin.length !== 4 && styles.buttonDisabled]}
				onPress={handleRegister}
				disabled={loading || pin.length !== 4}
			>
				<Text style={styles.buttonText}>{loading ? "Creating Account..." : "Complete Registration"}</Text>
			</TouchableOpacity>

			<TouchableOpacity onPress={() => setStep(1)}>
				<Text style={styles.link}>Back</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		justifyContent: "center",
		backgroundColor: "#fff",
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 30,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ddd",
		padding: 15,
		marginBottom: 15,
		borderRadius: 8,
		fontSize: 16,
	},
	button: {
		backgroundColor: "#007AFF",
		padding: 15,
		borderRadius: 8,
		marginTop: 10,
	},
	buttonText: {
		color: "white",
		textAlign: "center",
		fontSize: 16,
		fontWeight: "bold",
	},
	link: {
		color: "#007AFF",
		textAlign: "center",
		marginTop: 15,
	},
	description: {
		fontSize: 16,
		textAlign: "center",
		color: "#666",
		marginBottom: 30,
		paddingHorizontal: 20,
	},
	subtitle: {
		fontSize: 16,
		textAlign: "center",
		color: "#666",
		marginBottom: 30,
	},
	pinContainer: {
		alignItems: "center",
		marginBottom: 30,
	},
	pinInput: {
		borderWidth: 1,
		borderColor: "#ddd",
		padding: 15,
		borderRadius: 8,
		fontSize: 24,
		width: 120,
		textAlign: "center",
		letterSpacing: 8,
	},
	buttonDisabled: {
		backgroundColor: "#ccc",
	},
	pinDots: {
		flexDirection: "row",
		marginTop: 20,
		gap: 15,
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
});
