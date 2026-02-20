import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Task } from "@/types/Task";
import { typography, colors, spacing } from "@/styles";
import Check from "@/components/Icons/Check";
import Minus from "./Icons/Minus";

interface TaskTileProps {
    task: Task;
    showName?: boolean;
    childName?: string;
    onPress?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
    PONCTUAL: "Ponctuel",
    WEEKLY: "Hebdo",
    MONTHLY: "Mensuel",
};

export default function TaskTile({ task, showName, childName, onPress }: TaskTileProps) {
    const Container = onPress ? TouchableOpacity : View;
    const containerProps = onPress ? { onPress, activeOpacity: 0.7 } : {};

    const getRewardDisplay = () => {
        if (task.moneyReward > 0) {
            return `+ ${task.moneyReward}€`;
        }
        if (task.coinReward > 0) {
            return `+ ${task.coinReward} pts`;
        }
        return null;
    };

    const rewardDisplay = getRewardDisplay();

    return (
        <Container
            style={[
                styles.taskItem,
                task.status === "COMPLETED" && styles.taskItemCompleted,
                task.status === "PRE_VALIDATE" && styles.taskItemPreValidate,
            ]}
            {...containerProps}
        >
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, flex: 1 }}>
                <View style={styles.taskInfo}>
                    <View style={styles.taskHeader}>
                        <Text
                            style={[
                                styles.taskCategorySmall,
                                typography.bold,
                                typography["xs"],
                                task.type === "PONCTUAL" ? styles.taskCategorySmallPunctual : styles.taskCategorySmallRegular,
                            ]}
                        >
                            {TYPE_LABELS[task.type] || task.type}
                        </Text>
                        {rewardDisplay && <Text style={[styles.taskReward, typography.bold, typography["xs"]]}>{rewardDisplay}</Text>}
                    </View>
                    <Text style={[styles.taskDescription, task.status === "COMPLETED" && styles.taskDescriptionCompleted, typography["sm"]]}>
                        {task.description}
                    </Text>
                </View>
                <View
                    style={[
                        styles.taskStatus,
                        task.status === "COMPLETED" && styles.taskStatusCompleted,
                        task.status === "PRE_VALIDATE" && styles.taskStatusPreValidate,
                    ]}
                >
                    {task.status === "COMPLETED" && <Check />}
                    {task.status === "PRE_VALIDATE" && <Minus />}
                </View>
            </View>
            {showName && childName && <Text style={[styles.childNameBadge, typography.bold, typography["xs"]]}>{childName}</Text>}
        </Container>
    );
}

const styles = StyleSheet.create({
    taskItem: {
        backgroundColor: colors.white,
        padding: spacing.md,
        marginVertical: spacing.xs,
        borderRadius: spacing.sm,
    },
    taskItemCompleted: {
        backgroundColor: "#D1DEF1",
    },
    taskItemPreValidate: {},
    taskInfo: {
        flex: 1,
    },
    taskHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    taskCategorySmall: {
        paddingHorizontal: 5,
        paddingVertical: 3,
        borderRadius: 4,
    },
    taskCategorySmallRegular: {
        backgroundColor: colors.aquamarine[60],
    },
    taskCategorySmallPunctual: {
        backgroundColor: colors.pink[40],
    },
    taskDescription: {
        color: colors.carbon[100],
    },
    taskDescriptionCompleted: {
        textDecorationLine: "line-through",
    },
    taskReward: {
        backgroundColor: colors.primary[10],
        paddingHorizontal: 5,
        paddingVertical: 3,
        borderRadius: 4,
    },
    preValidateBadge: {
        backgroundColor: colors.secondary[100],
        color: colors.white,
        paddingHorizontal: 5,
        paddingVertical: 3,
        borderRadius: 4,
    },
    childNameBadge: {
        backgroundColor: colors.screenBackground,
        color: colors.carbon[100],
        paddingHorizontal: 5,
        paddingVertical: 3,
        borderRadius: 4,
        marginTop: spacing.sm,
        alignSelf: "flex-start",
    },
    taskStatus: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.primary[40],
    },
    taskStatusCompleted: {
        backgroundColor: colors.primary[100],
        borderColor: colors.primary[100],
    },
    taskStatusPreValidate: {
        backgroundColor: colors.primary[100],
    },
    preValidateIcon: {
        fontSize: 20,
    },
});
