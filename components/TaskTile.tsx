import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Task } from "@/types/Task";
import { typography } from "@/styles/typography";
import Check from "@/components/Icons/Check";

interface TaskTileProps {
    task: Task;
    onPress?: () => void;
}

export default function TaskTile({ task, onPress }: TaskTileProps) {
    const Container = onPress ? TouchableOpacity : View;
    const containerProps = onPress ? { onPress, activeOpacity: 0.7 } : {};

    return (
        <Container style={[styles.taskItem, task.status === "COMPLETED" && styles.taskItemCompleted]} {...containerProps}>
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
                </View>
                <Text style={[styles.taskDescription, task.status === "COMPLETED" && styles.taskDescriptionCompleted, typography["sm"]]}>
                    {task.description}
                </Text>
            </View>
            <View style={[styles.taskStatus, task.status === "COMPLETED" && styles.taskStatusCompleted]}>
                {task.status === "COMPLETED" && <Check />}
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    taskItem: {
        backgroundColor: "#fff",
        padding: 12,
        marginVertical: 4,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    taskItemCompleted: {
        backgroundColor: "#D1DEF1",
    },
    taskInfo: {
        flex: 1,
    },
    taskHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    taskCategorySmall: {
        paddingHorizontal: 5,
        paddingVertical: 3,
        borderRadius: 4,
    },
    taskCategorySmallRegular: {
        backgroundColor: "#E1FFF6",
    },
    taskCategorySmallPunctual: {
        backgroundColor: "#FEA0BA66",
    },
    taskDescription: {
        color: "#333",
    },
    taskDescriptionCompleted: {
        textDecorationLine: "line-through",
    },
    taskReward: {
        backgroundColor: "#F3F0FD",
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
        backgroundColor: "#CEC5F8",
    },
    taskStatusCompleted: {
        backgroundColor: "#6C5CE7",
        borderColor: "#6C5CE7",
    },
});
