import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Task } from "@/types/Task";
import { typography, colors, spacing } from "@/styles";
import Check from "@/components/Icons/Check";

interface TaskTileProps {
    task: Task;
    onPress?: () => void;
}

export default function TaskTile({ task, onPress }: TaskTileProps) {
    const Container = onPress ? TouchableOpacity : View;
    const containerProps = onPress ? { onPress, activeOpacity: 0.7 } : {};

    return (
        <Container
            style={[
                styles.taskItem,
                task.status === "COMPLETED" && styles.taskItemCompleted,
                task.status === "PRE_VALIDATE" && styles.taskItemPreValidate,
            ]}
            {...containerProps}
        >
            <View style={styles.taskInfo}>
                <View style={styles.taskHeader}>
                    <Text
                        style={[
                            styles.taskCategorySmall,
                            typography.bold,
                            typography["xs"],
                            task.category === "REGULAR" ? styles.taskCategorySmallRegular : styles.taskCategorySmallPunctual,
                        ]}
                    >
                        {task.category}
                    </Text>
                    <Text style={[styles.taskReward, typography.bold, typography["xs"]]}>+ {task.reward}€</Text>
                    {task.status === "PRE_VALIDATE" && <Text style={[styles.preValidateBadge, typography.bold, typography["xs"]]}>En attente</Text>}
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
                {task.status === "PRE_VALIDATE" && <Text style={styles.preValidateIcon}>⏳</Text>}
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    taskItem: {
        backgroundColor: colors.white,
        padding: spacing.md,
        marginVertical: spacing.xs,
        borderRadius: spacing.sm,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    taskItemCompleted: {
        backgroundColor: colors.primary[20],
    },
    taskItemPreValidate: {
        backgroundColor: colors.secondary[20],
        borderWidth: 1,
        borderColor: colors.secondary[100],
    },
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
        backgroundColor: colors.secondary[100],
    },
    preValidateIcon: {
        fontSize: 20,
    },
});
