import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuthContext } from "@/contexts/AuthContext";

export default function Login() {
	const { login } = useAuthContext();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleLogin = async () => {
		if (!email || !password) {
			Alert.alert("Error", "Please fill in all fields");
			return;
		}

		setLoading(true);
		try {
			const result = await login(email, password);
			if (!result.success) {
				Alert.alert("Error", result.error || "Login failed");
			}
		} catch (error: any) {
			Alert.alert("Error", "An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Login</Text>

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

			<TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
				<Text style={styles.buttonText}>{loading ? "Logging in..." : "Login"}</Text>
			</TouchableOpacity>

			<TouchableOpacity onPress={() => router.push("/(auth)/register")}>
				<Text style={styles.link}>Don't have an account? Register</Text>
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
});
