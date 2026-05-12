import { Stack } from "expo-router";

export default function CoursesLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
			<Stack.Screen name="child" />
			<Stack.Screen name="[id]" />
		</Stack>
	);
}
