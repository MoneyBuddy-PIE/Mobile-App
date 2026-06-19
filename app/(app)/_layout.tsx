import { Stack, usePathname } from "expo-router";
import { View, StyleSheet } from "react-native";
import { AuthGuard } from "@/components/AuthGuard";
import { BottomNavigation } from "@/components/BottomNavigation";

export default function AppLayout() {
    const pathname = usePathname();

    const hideBottomNav =
        pathname.startsWith("/accounts") ||
        (pathname.startsWith("/chapters/") && pathname !== "/chapters" && pathname !== "/chapters/child-categories") ||
        pathname === "/goals/transfer" ||
        pathname === "/allowance" ||
        pathname === "/children/add-money";

    return (
        <AuthGuard>
            <View style={styles.container}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="accounts" />
                    <Stack.Screen name="children" />
                    <Stack.Screen name="chapters" />
                    <Stack.Screen name="revenus" />
                    <Stack.Screen name="tasks" />
                    <Stack.Screen name="profile" />
                    <Stack.Screen name="home" />
                    <Stack.Screen name="goals" />
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
