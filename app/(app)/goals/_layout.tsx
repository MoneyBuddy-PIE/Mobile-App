import { Stack } from "expo-router";

export default function GoalsLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
			<Stack.Screen name="child" />
			<Stack.Screen name="create" />
			<Stack.Screen name="[id]" />
		</Stack>
	);
}
