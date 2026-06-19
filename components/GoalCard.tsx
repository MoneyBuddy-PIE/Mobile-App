import React from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity } from "react-native";
import CircularProgress from "./CircualProgress";
import { Goal } from "@/types/Goal";
import getRandomItemFromList from "@/utils/fn/getRandomItemFromList";
import colorList from "@/styles/colors";
import emojis from "@/styles/emojis";

type IProps = {
    goal: Goal;
    backgroundIconColor?: string;
    onPress?: () => void;
};

export default function GoalCard({ goal, backgroundIconColor = getRandomItemFromList(colorList), onPress }: IProps) {
    const { amount, emoji, name, progression } = goal;
    const formattedAmount = amount.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const CardWrapper = onPress ? TouchableOpacity : View;

    return (
        <CardWrapper style={styles.card} onPress={onPress} activeOpacity={0.75}>
            <View style={styles.left}>
                <View style={[styles.iconWrapper, { backgroundColor: backgroundIconColor }]}>
                    <Text style={styles.iconEmoji}>{emoji ?? getRandomItemFromList(emojis)}</Text>
                </View>

                <View style={styles.textBlock}>
                    <Text style={styles.title} numberOfLines={2}>
                        {name}
                    </Text>
                    <Text style={styles.amount}>{formattedAmount}€</Text>
                </View>
            </View>

            <CircularProgress progress={progression} color={"#F06C8A"} size={88} strokeWidth={12} />
        </CardWrapper>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        borderRadius: 4,
        padding: 12,
        shadowColor: "#BFD0EA",
        shadowOffset: { width: 0, height: 3.89 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    left: {
        flexDirection: "column",
        alignItems: "flex-start",
        flex: 1,
        marginRight: 16,
        gap: 8,
    },
    iconWrapper: {
        width: 52,
        height: 52,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    iconEmoji: {
        fontSize: 26,
    },
    textBlock: {
        flexShrink: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        color: "#2F2F2F",
        marginBottom: 2,
    },
    amount: {
        fontSize: 24,
        fontWeight: "800",
        color: "#2F2F2F",
        letterSpacing: -0.5,
    },
});
