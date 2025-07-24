import { Stack } from "expo-router";

export default function RevenusLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
			<Stack.Screen name="add-expense" />
		</Stack>
	);
}
