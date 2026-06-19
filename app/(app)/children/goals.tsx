import React, { useState, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { goalsService } from "@/services/goalService";
import { Goal } from "@/types/Goal";

import { typography, colors, spacing, shadows, commonStyles } from "@/styles";
import { formatMoney } from "@/utils/money";

import BackArrow from "@/components/Icons/BackArrow";
import EmptyGoals from "@/components/Icons/EmptyGoals";
import PieChart from "@/components/PieChart";

const colorPairs = [
    { bg: "rgba(253, 97, 140, 0.2)", progress: colors.pink[100] },
    { bg: "#BADBFF", progress: colors.blue[100] },
    { bg: "#FFE5CC", progress: "#FF8C33" },
    { bg: "#D5F5E3", progress: colors.jadegreen[100] },
    { bg: "#E8D5FF", progress: colors.primary[100] },
    { bg: "#FFFACC", progress: "#E6B800" },
    { bg: "#CCF5F0", progress: colors.aquamarine[100] },
    { bg: "#FFD5EC", progress: colors.pink[100] },
];

export default function Goals() {
    const { childId, childName } = useLocalSearchParams<{ childId: string; childName: string }>();
    const [goals, setGoals] = useState<Goal[]>([]);

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

    const renderGoal = (goal: Goal, index: number) => {
        const { bg, progress } = colorPairs[index % colorPairs.length];
        const percentage = (goal.progression / goal.amount) * 100;

        return (
            <View key={goal.id} style={styles.goalCard}>
                <View style={{ flex: 1, flexDirection: "column", gap: spacing.sm }}>
                    <View style={[styles.emojiIcon, { backgroundColor: bg }]}>
                        <Text style={typography["2xl"]}>{goal.emoji}</Text>
                    </View>
                    <View>
                        <Text style={[typography.md, typography.bold]}>{goal.name}</Text>
                        <Text style={[typography["2xl"], typography.bold]}>{formatMoney(goal.amount)}€</Text>
                    </View>
                </View>
                <PieChart percentage={percentage} progressColor={progress} />
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
            <View style={styles.titleSection}>
                <Text style={[typography.bold, typography.xl]}>Épargne de {childName}</Text>
                <Text style={[typography.xxxxl, typography.bold]}>{formatMoney(moneySaved)}€</Text>
            </View>
            <View style={styles.subtitleSection}>
                <Text style={[typography.sm, typography.regular]}>
                    {goals.length === 0 ? "Aucune épargne en cours…" : `${childName} a économisé ${formatMoney(moneySaved)}€ ce mois-ci ! 🥳`}
                </Text>
            </View>
            <View style={{ backgroundColor: colors.screenBackground, flex: 1 }}>
                {goals.length === 0 ? (
                    <View style={styles.emptyState}>
                        <EmptyGoals />
                        <Text style={styles.emptyStateText}>Aidez-le à comprendre comment son argent grandit en créant un objectif.</Text>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.goalsList} showsVerticalScrollIndicator={false}>
                        {goals.map((goal, index) => renderGoal(goal, index))}
                    </ScrollView>
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
    titleSection: {
        flexDirection: "column",
        gap: spacing.sm,
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.lg,
        borderBottomColor: colors.shadow,
        borderBottomWidth: 1,
        backgroundColor: colors.white,
    },
    subtitleSection: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderBottomColor: colors.shadow,
        borderBottomWidth: 1,
        backgroundColor: colors.white,
    },
    goalsList: {
        padding: spacing.lg,
        gap: spacing.md,
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
    emojiIcon: {
        width: 48,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: spacing.xs,
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyStateText: {
        marginTop: spacing.lg,
        color: colors.carbon[100],
        width: 218,
        textAlign: "center",
        fontSize: 16,
        fontFamily: "DMSans_400Regular",
    },
});
