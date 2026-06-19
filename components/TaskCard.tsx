import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { Task, TaskStatus, TaskType } from "@/types/Task";
import { SubAccount } from "@/types/Account";
import { useState } from "react";
import { router } from "expo-router";
import TaskDelete from "./forms/TaskDelete";

const guessTaskType = (type: TaskType) => {
    switch (type) {
        case TaskType.MONTHLY:
            return "Mensuelle";
        case TaskType.WEEKLY:
            return "Hébdomadaire";
        default:
            return "Ponctuelle";
    }
};

type IProps = {
    task: Task;
    child?: SubAccount;
};

const TaskCard = ({ task, child }: IProps) => {
    const url = `https://api.dicebear.com/9.x/${child?.iconStyle}/png?seed=${child?.iconName}`;
    const isCompleted = task.status === TaskStatus.COMPLETED;
    const isPending = task.status === TaskStatus.PENDING;

    const handleValidateTask = (taskId: string) => {
        console.log("Validate task:", taskId);
    };

    const renderRightActions = (task: Task) => {
        return (
            <View style={styles.swipeActionsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.refuseButton]}
                    onPress={() => {
                        router.push({
                            pathname: "/(app)/children/create-task",
                            params: {
                                childId: task.subaccountIdChild,
                                type: task.type,
                                task: JSON.stringify(task),
                            },
                        });
                    }}
                >
                    <Ionicons name="create-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <TaskDelete taskId={task.id} shadow={false} />
            </View>
        );
    };

    return (
        <>
            <Swipeable renderRightActions={() => renderRightActions(task)} overshootRight={true} containerStyle={styles.swipeableContainer}>
                <View style={[styles.taskCard, isCompleted ? { backgroundColor: "#D1DEF1" } : { backgroundColor: "#FFFFFF" }]}>
                    <View style={styles.taskContent}>
                        <View style={styles.badgesRow}>
                            <View style={[styles.taskBadge, styles.typeBadge]}>
                                <Text style={styles.taskBadgeText}>{guessTaskType(task.type)}</Text>
                            </View>

                            {task.coinReward && (
                                <View style={[styles.taskBadge, styles.rewardBadge]}>
                                    <Text style={styles.taskBadgeText}>+{task.coinReward?.toString()}</Text>
                                    <Ionicons name="ellipse" size={12} color="#2F2F2F" />
                                </View>
                            )}

                            {task.moneyReward && (
                                <View style={[styles.taskBadge, styles.rewardBadge]}>
                                    <Text style={styles.taskBadgeText}>+{task.moneyReward?.toString()}</Text>
                                    <Ionicons name="logo-euro" size={12} color="#2F2F2F" />
                                </View>
                            )}
                        </View>

                        <Text style={[styles.taskDescription, { textDecorationLine: isCompleted ? "line-through" : "none" }]}>
                            {task.description}
                        </Text>

                        {child?.id && (
                            <View style={[styles.taskBadge, { backgroundColor: "#EBF2FB" }]}>
                                <Image source={{ uri: url }} style={styles.imageContainer} />
                                <Text style={styles.taskBadgeText}>{child.name}</Text>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[styles.actionButton, isPending ? { backgroundColor: "#CEC5F8" } : { backgroundColor: "#846DED" }]}
                        onPress={() => handleValidateTask(task.id)}
                    >
                        {task.status === TaskStatus.PRE_VALIDATE && <Ionicons name="remove-outline" size={24} color="#fff" />}
                        {isCompleted && <Ionicons name="checkmark-outline" size={24} color="#fff" />}
                    </TouchableOpacity>
                </View>
            </Swipeable>
        </>
    );
};

const styles = StyleSheet.create({
    swipeableContainer: {
        marginBottom: 16,
    },
    taskCard: {
        borderRadius: 8,
        padding: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    taskContent: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 8,
    },
    badgesRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
    },
    taskBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    typeBadge: {
        backgroundColor: "#E1FFF6",
    },
    rewardBadge: {
        backgroundColor: "#F3F0FD",
    },
    taskBadgeText: {
        fontWeight: "700",
        fontSize: 12,
        color: "#2F2F2F",
    },
    taskDescription: {
        fontWeight: "400",
        fontSize: 14,
        color: "#2F2F2F",
        lineHeight: 20,
    },
    childInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    childEmoji: {
        fontSize: 16,
    },
    childName: {
        fontSize: 14,
        fontWeight: "400",
        color: "#6A6A6A",
    },
    swipeActionsContainer: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
        paddingLeft: 8,
    },
    actionButton: {
        width: 44,
        height: 44,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 12,
    },
    refuseButton: {
        backgroundColor: "#52A5FF",
    },
    deleteButton: {
        backgroundColor: "#FF5C7C",
    },
    imageContainer: {
        width: 15,
        height: 15,
    },
});

export default TaskCard;
