import React, { useRef } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Ionicons } from "@expo/vector-icons";
import { Task } from "@/types/Task";
import { colors, spacing } from "@/styles";
import TaskTile from "./TaskTile";
import ReturnArrow from "./Icons/ReturnArrow";
import TrashIcon from "./Icons/Trash";

interface SwipeableTaskTileProps {
    task: Task;
    showName?: boolean;
    childName?: string;
    horizontalPadding?: number;
    onValidate?: (task: Task) => void;
    onReject?: (task: Task) => void;
    onDelete?: (task: Task) => void;
    onEdit?: (task: Task) => void;
}

export default function SwipeableTaskTile({
    task,
    showName,
    childName,
    horizontalPadding = 24,
    onValidate,
    onReject,
    onDelete,
    onEdit,
}: SwipeableTaskTileProps) {
    const swipeableRef = useRef<Swipeable>(null);

    const close = () => swipeableRef.current?.close();

    const renderRightActions = () => (
        <View style={[styles.actions, { paddingRight: horizontalPadding }]}>
            {onReject && (
                <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => {
                        close();
                        onReject(task);
                    }}
                >
                    <ReturnArrow fill="#fff" />
                </TouchableOpacity>
            )}
            {onEdit && (
                <TouchableOpacity
                    style={[styles.actionBtn, styles.editBtn]}
                    onPress={() => {
                        close();
                        onEdit(task);
                    }}
                >
                    <Ionicons name="create-outline" size={24} color="#fff" />
                </TouchableOpacity>
            )}
            {onDelete && (
                <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => {
                        close();
                        onDelete(task);
                    }}
                >
                    <TrashIcon />
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} friction={2} rightThreshold={40} overshootRight={false}>
            <View style={{ paddingHorizontal: horizontalPadding }}>
                <TaskTile task={task} showName={showName} childName={childName} onPress={onValidate ? () => onValidate(task) : undefined} />
            </View>
        </Swipeable>
    );
}

const styles = StyleSheet.create({
    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        marginVertical: spacing.xs,
    },
    actionBtn: {
        width: 48,
        height: 48,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    rejectBtn: {
        backgroundColor: colors.carbon[60],
    },
    editBtn: {
        backgroundColor: colors.blue[100],
    },
    deleteBtn: {
        backgroundColor: colors.pink[100],
    },
});
