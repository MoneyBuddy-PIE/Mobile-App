import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import GoalForm from "@/components/forms/GoalForm";
import { useState } from "react";
import SuccessComponent from "@/components/SuccessComponent";

export default function CreateGoalScreen() {
    const { childId, childName } = useLocalSearchParams<{ childId: string; childName: string }>();

    const [step, setStep] = useState<"FORM" | "SUCCESS">("FORM");

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    {step === "FORM" && (
                        <>
                            <Text style={styles.headerTitle}>Créer un objectif</Text>
                            {childName && <Text style={styles.headerSubtitle}>pour {childName}</Text>}
                        </>
                    )}
                </View>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="close" size={18} color="#fff" />
                </TouchableOpacity>
            </View>

            {step === "FORM" && <GoalForm childId={childId ?? ""} onChange={() => setStep("SUCCESS")} />}
            {step === "SUCCESS" && (
                <SuccessComponent
                    title="Ton objectif est lancé 🚀"
                    subTitle="Ajoute de l’argent pour le faire grandir !"
                    onClose={() => router.back()}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 20,
        backgroundColor: "#fff",
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
        fontSize: 20,
        color: "#2F2F2F",
    },
    headerSubtitle: {
        fontFamily: "DMSans_700Bold",
        fontSize: 14,
        color: "#828282",
        marginTop: 2,
    },
});
