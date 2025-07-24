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
				handleSubmit(value);
			}
		}
	};

	const handleSubmit = async (pinValue: string = pin) => {
		if (pinValue.length !== 4) {
			setError("Please enter a 4-digit PIN");
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
			setError("Incorrect PIN");
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

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
					<Text style={styles.cancelText}>Cancel</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.content}>
				<View style={styles.iconContainer}>
					<Text style={styles.icon}>🔒</Text>
				</View>

				<Text style={styles.title}>Enter PIN</Text>
				<Text style={styles.subtitle}>{accountName || "Account"} is protected by a PIN</Text>

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
					activeOpacity={0.8}
				>
					<View style={styles.pinDisplay}>
						{[0, 1, 2, 3].map((index) => (
							<View
								key={index}
								style={[
									styles.pinBox,
									pin.length === index && styles.pinBoxActive,
									error && styles.pinBoxError,
								]}
							>
								<View style={[styles.pinDot, pin.length > index && styles.pinDotFilled]} />
							</View>
						))}
					</View>
				</TouchableOpacity>

				{error ? <Text style={styles.errorText}>{error}</Text> : <View style={styles.errorPlaceholder} />}

				{/* Loading indicator */}
				{loading && <ActivityIndicator size="small" color="#007AFF" style={styles.loading} />}
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
		paddingHorizontal: 20,
		paddingTop: 10,
		paddingBottom: 20,
	},
	cancelButton: {
		alignSelf: "flex-start",
		padding: 5,
	},
	cancelText: {
		fontSize: 16,
		color: "#007AFF",
		fontWeight: "600",
	},
	content: {
		flex: 1,
		paddingHorizontal: 40,
		alignItems: "center",
		paddingTop: 60,
	},
	iconContainer: {
		marginBottom: 30,
	},
	icon: {
		fontSize: 60,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		marginBottom: 40,
		paddingHorizontal: 20,
	},
	hiddenInput: {
		position: "absolute",
		left: -9999,
		opacity: 0,
	},
	pinContainer: {
		marginBottom: 20,
	},
	pinDisplay: {
		flexDirection: "row",
		gap: 12,
	},
	pinBox: {
		width: 50,
		height: 60,
		borderRadius: 12,
		backgroundColor: "#fff",
		borderWidth: 2,
		borderColor: "#ddd",
		justifyContent: "center",
		alignItems: "center",
	},
	pinBoxActive: {
		borderColor: "#007AFF",
	},
	pinBoxError: {
		borderColor: "#f44336",
	},
	pinDot: {
		width: 8,
		height: 8,
		borderRadius: 8,
		backgroundColor: "#ddd",
	},
	pinDotFilled: {
		backgroundColor: "#007AFF",
	},
	errorText: {
		color: "#f44336",
		fontSize: 14,
		textAlign: "center",
		height: 20,
	},
	errorPlaceholder: {
		height: 20,
	},
	loading: {
		marginTop: 20,
	},
});
