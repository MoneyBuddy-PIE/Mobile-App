import React, { useState, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { goalsService } from "@/services/goalsService";
import { Goal } from "@/types/Goal";

import { typography, colors, spacing, shadows, commonStyles } from "@/styles";

import BackArrow from "@/components/Icons/BackArrow";
import EmptyGoals from "@/components/Icons/EmptyGoals";
import PieChart from "@/components/PieChart";

const backgroundColors = [
    "#FFE5E5", // Rose pastel
    "#E5F3FF", // Bleu pastel
    "#FFF5E5", // Orange pastel
    "#E5FFE5", // Vert pastel
    "#F5E5FF", // Violet pastel
    "#FFFFE5", // Jaune pastel
    "#E5FFFF", // Cyan pastel
    "#FFE5F5", // Rose fuchsia pastel
];

export default function Goals() {
    const { childId, childName } = useLocalSearchParams<{ childId: string; childName: string }>();
    const [goals, setGoals] = useState<Goal[]>([]);

    const getRandomColor = () => {
        return backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
    };

    useEffect(() => {
        const fetchGoals = async () => {
            if (!childId) return;

            try {
                const data = await goalsService.getGoals(childId);
                setGoals(data);
            } catch (error) {
                console.error("Error fetching goals:", error);
            }
        };

        fetchGoals();
    }, [childId]);

    const moneySaved = goals.reduce((total, goal) => total + goal.progression, 0);

    const renderGoal = (goal: Goal, backgroundColor: string) => {
        const percentage = (goal.progression / goal.amount) * 100;

        return (
            <View key={goal.id} style={styles.goalCard}>
                <View style={{ flex: 1, flexDirection: "column", gap: spacing.sm }}>
                    <View
                        style={{
                            width: 48,
                            height: 48,
                            backgroundColor: backgroundColor,
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: spacing.xs,
                        }}
                    >
                        <Text style={[typography["2xl"]]}>{goal.emoji}</Text>
                    </View>
                    <View>
                        <Text style={[typography.md, typography.bold]}>{goal.name}</Text>
                        <Text style={[typography["2xl"], typography.bold]}>{goal.amount.toFixed(2)} €</Text>
                    </View>
                </View>
                <PieChart percentage={percentage} progressColor={backgroundColor} />
            </View>
        );
    };

    return (
        <SafeAreaView style={[commonStyles.container, { backgroundColor: colors.white }]}>
            <View style={styles.header}>
                <View style={styles.backIcon} onTouchEnd={() => router.back()}>
                    <BackArrow width={24} height={24} />
                </View>
            </View>
            <View
                style={{
                    flexDirection: "column",
                    gap: spacing.sm,
                    paddingHorizontal: spacing.xl,
                    paddingBottom: spacing.lg,
                    borderBottomColor: colors.shadow,
                    borderBottomWidth: 1,
                }}
            >
                <Text style={[typography.bold, typography.xl]}>Epargne de {childName}</Text>
                <Text style={[typography.xxxxl, typography.bold]}>{moneySaved === 0 ? "-" : moneySaved + " €"}</Text>
            </View>
            <View
                style={
                    (typography.sm,
                    { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, borderBottomColor: colors.shadow, borderBottomWidth: 1 })
                }
            >
                <Text style={[]}>{goals.length === 0 ? "Aucune épargne en cours…" : `${childName} a économisé ${moneySaved}€ ce mois-ci ! 🥳`}</Text>
            </View>
            <View style={{ backgroundColor: colors.screenBackground, flex: 1 }}>
                {goals.length === 0 ? (
                    <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
                        <EmptyGoals />
                        <Text style={[typography.md, { marginTop: spacing.lg, color: colors.carbon[100], width: 200, textAlign: "center" }]}>
                            Aidez-le à comprendre comment son argent grandit en créant un objectif.
                        </Text>
                    </View>
                ) : (
                    <View style={{ marginVertical: spacing.xl, marginHorizontal: spacing.xl }}>
                        {goals.map((goal) => renderGoal(goal, getRandomColor()))}
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        backgroundColor: colors.white,
    },
    backIcon: {
        width: spacing["4xl"],
        height: spacing["4xl"],
        borderRadius: spacing.sm,
        backgroundColor: colors.carbon[100],
        justifyContent: "center",
        alignItems: "center",
    },
    goalCard: {
        backgroundColor: colors.white,
        padding: spacing.md,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        borderRadius: spacing.xs,
        ...shadows.md,
    },
});
