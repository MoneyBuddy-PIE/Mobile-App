import { Stack, usePathname } from "expo-router";
import { View, StyleSheet } from "react-native";
import { AuthGuard } from "@/components/AuthGuard";
import { BottomNavigation } from "@/components/BottomNavigation";

export default function AppLayout() {
	const pathname = usePathname();
	console.log("Current pathname:", pathname);

	const hideBottomNav = pathname.startsWith("/accounts");
	const showNavBar = !hideBottomNav;

	return (
		<AuthGuard>
			<View style={styles.container}>
				<Stack screenOptions={{ headerShown: false }}>
					<Stack.Screen name="accounts" />
					<Stack.Screen name="home" />
					<Stack.Screen name="profile" />
				</Stack>
				{showNavBar && <BottomNavigation />}
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
