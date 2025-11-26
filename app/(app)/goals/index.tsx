import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, commonStyles, spacing, typography } from "@/styles";
import { goalsService } from "@/services/goalsService";
import { Goal } from "@/types/Goal";

export default function Goals() {
    const [goals, setGoals] = useState<Array<Goal>>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        setLoading(true);
        try {
            const fetchedGoals = await goalsService.getGoals();
            console.log("Fetched goals:", fetchedGoals);
            setGoals(fetchedGoals);
        } catch (error) {
            console.error("Error fetching goals:", error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = () => {
        fetchGoals();
    };

    if (loading) {
        return (
            <SafeAreaView style={[commonStyles.container, commonStyles.center]}>
                <ActivityIndicator size="large" color={colors.primary[100]} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[commonStyles.container, { padding: spacing.md }]}>
            <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}>
                <Text style={typography.heading}>Goals</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({});
