import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import GoalForm from "@/components/forms/GoalForm";

export default function CreateGoalScreen() {
    const { childId, childName } = useLocalSearchParams<{ childId: string; childName: string }>();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={18} color="#fff" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Nouvel objectif</Text>
                    {childName && (
                        <Text style={styles.headerSubtitle}>Pour {childName}</Text>
                    )}
                </View>
            </View>

            <GoalForm childId={childId ?? ""} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    backButton: {
        backgroundColor: "#2F2F2F",
        borderRadius: 8,
        padding: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontFamily: "DMSans_700Bold",
        fontSize: 18,
        color: "#2F2F2F",
    },
    headerSubtitle: {
        fontFamily: "DMSans_400Regular",
        fontSize: 13,
        color: "#828282",
        marginTop: 2,
    },
});
