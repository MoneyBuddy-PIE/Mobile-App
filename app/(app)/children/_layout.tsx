import { Stack } from "expo-router";

export default function ChildrenLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
			<Stack.Screen name="create-task" />
			<Stack.Screen name="add-money" />
		</Stack>
	);
}
