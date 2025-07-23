import { Stack } from "expo-router";

export default function HomeLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="parent" />
			<Stack.Screen name="child" />
		</Stack>
	);
}