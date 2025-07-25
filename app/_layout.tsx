import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { DMSans_700Bold, DMSans_400Regular, DMSans_600SemiBold } from "@expo-google-fonts/dm-sans";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { AuthProvider } from "@/contexts/AuthContext";

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		DMSans_700Bold,
		DMSans_400Regular,
		DMSans_600SemiBold,
	});

	if (!fontsLoaded) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#6C5CE7" />
			</View>
		);
	}

	return (
		<AuthProvider>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="index" />
				<Stack.Screen name="(auth)" options={{ headerShown: false }} />
				<Stack.Screen name="(app)" options={{ headerShown: false }} />
			</Stack>
		</AuthProvider>
	);
}

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#f8f9fa",
	},
});
