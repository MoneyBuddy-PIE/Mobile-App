// app/(app)/children/_layout.tsx
import { Stack } from "expo-router";

export default function ChildrenLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
			{/* Ici on pourra ajouter d'autres pages plus tard */}
		</Stack>
	);
}