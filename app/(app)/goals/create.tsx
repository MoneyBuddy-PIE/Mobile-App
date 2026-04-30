import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import GoalForm from "@/components/forms/GoalForm";
import { useState } from "react";
import SuccessComponent from "@/components/SuccessComponent";

export default function CreateGoalScreen() {
    const { childId, childName } = useLocalSearchParams<{ childId: string; childName: string }>();

    const [step, setStep] = useState<"FORM" | "SUCCESS">("FORM")

    return (
        <SafeAreaView style={styles.container}>

            {/* Header */}
            <View style={[styles.header, step === "FORM" && {backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#BFD0EA",}]}>
                <View>
                    {step === "FORM" &&
                    <>
                        <Text style={styles.headerTitle}>Créer un objectif</Text>
                        {childName && (
                            <Text style={styles.headerSubtitle}>pour {childName}</Text>
                        )}
                    </>
                    }
                </View>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="close" size={18} color="#fff" />
                </TouchableOpacity>
            </View>

            {step === "FORM" && <GoalForm childId={childId ?? ""} onChange={() => (setStep("SUCCESS"))}/>}
            {step === "SUCCESS" && 
                <SuccessComponent 
                    title="Ton objectif est lancé 🚀" 
                    subTitle="Ajoute de l’argent pour le faire grandir !"
                    onClose={() => router.back()}
                />
            }
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF"
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 14,
        paddingHorizontal: 20,
        paddingVertical: 16,
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
        fontWeight: 700,
        fontSize: 20,
        color: "#2F2F2F",
        marginTop: 2,
    },
});
