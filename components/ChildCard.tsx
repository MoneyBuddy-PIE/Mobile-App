import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Touchable } from "react-native";
import { typography, colors, spacing, shadows } from "@/styles";
import { ChildSummary } from "@/app/(app)/home/parent";
import MoneyBill2 from "./Icons/MoneyBill2";
import Chevron from "./Icons/Chevron";
import MoneyBill from "./Icons/MoneyBill";
import ListCheck from "./Icons/ListCheck";
import MoneyFly from "./Icons/MoneyFly";

interface ChildCardProps {
    childSummary: ChildSummary;
}

export default function ChildCard({ childSummary }: ChildCardProps) {
    const { child, tasksCount, completedTasksCount } = childSummary;

    return (
        <View style={styles.cardContainer}>
            <View style={styles.header}>
                <View style={styles.icon}>
                    <Text style={typography["2xl"]}>👦🏼</Text>
                </View>
                <View style={{ flex: 1, flexDirection: "column", gap: spacing.xs }}>
                    <Text style={[typography.md, typography.bold]}>{child.name}</Text>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: spacing.xs,
                            paddingVertical: spacing.xs,
                            paddingHorizontal: spacing.sm,
                            backgroundColor: "#97C9FF66",
                            borderRadius: 4,
                            alignSelf: "flex-start",
                        }}
                    >
                        <MoneyBill2 width={16} height={16} />
                        <Text>{child.money}€</Text>
                    </View>
                </View>
                <TouchableOpacity>
                    <Chevron width={24} height={24} />
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
                <TouchableOpacity style={styles.cardButton}>
                    <MoneyBill color={colors.carbon[80]} width={20} height={20} />
                    <Text style={{ color: colors.carbon[80] }}>Verser</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cardButton}>
                    <MoneyFly color={colors.carbon[80]} width={20} height={20} />
                    <Text style={{ color: colors.carbon[80] }}>Dépensé</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cardButton}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                        <ListCheck color={colors.carbon[80]} width={20} height={20} />
                        <Text style={{ color: colors.carbon[80], ...typography.bold, ...typography.md }}>
                            {completedTasksCount}/{tasksCount}
                        </Text>
                    </View>
                    <Text style={{ color: colors.carbon[80] }}>Tâches faites</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: colors.white,
        borderRadius: 4,
        padding: spacing.base,
        ...shadows.md,
        flexDirection: "column",
        gap: spacing.base,
        flex: 1,
    },
    header: {
        flexDirection: "row",
        gap: spacing.md,
        alignItems: "center",
    },
    icon: {
        width: 48,
        height: 48,
        borderRadius: 4,
        backgroundColor: colors.blue[100],
        justifyContent: "center",
        alignItems: "center",
    },
    cardButton: {
        borderRadius: 4,
        padding: spacing.sm,
        backgroundColor: colors.screenBackground,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: spacing.xs,
    },
});
