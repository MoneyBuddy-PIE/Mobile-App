import { Stack, usePathname } from "expo-router";
import { View, StyleSheet } from "react-native";
import { AuthGuard } from "@/components/AuthGuard";
import { BottomNavigation } from "@/components/BottomNavigation";

export default function AppLayout() {
	const pathname = usePathname();
	console.log("Current pathname:", pathname);

	const hideBottomNav = pathname.startsWith("/accounts");

	return (
		<AuthGuard>
			<View style={styles.container}>
				<Stack screenOptions={{ headerShown: false }}>
					<Stack.Screen name="accounts" />
					<Stack.Screen name="profile" />
				</Stack>
				{!hideBottomNav && <BottomNavigation />}
			</View>
		</AuthGuard>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f9fa",
	},
});
