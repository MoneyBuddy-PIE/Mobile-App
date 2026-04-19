import { StyleSheet, Modal, TouchableOpacity, View, Text, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, useCallback } from "react";
import { GestureHandlerRootView, ScrollView, Swipeable } from "react-native-gesture-handler";

import { Task, TaskStatus, TaskType } from "@/types/Task";
import { SubAccount } from "@/types/Account";
import { UserStorage } from "@/utils/storage";
import { tasksService } from "@/services/tasksService";
import TaskCard from "./TaskCard";

type IProps = {
    visible: boolean;
    onClose: () => void;
}

const ManageTasksModal = ({visible, onClose}: IProps) => {
	const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
		try {
			const accountData = await UserStorage.getSubAccount();
			setSubAccount(accountData);

			if (accountData) {
				const childTasks = await tasksService.getAllTasks({});
                console.log({childTasks})
				setTasks(childTasks);
			}
		} catch (error) {
			console.error("Error loading tasks:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadData();
	}, [loadData]);

    return (
        <Modal transparent visible={visible} animationType="slide" >
            <GestureHandlerRootView style={{ flex: 1 }}>
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={onClose}
                >
                    <TouchableOpacity
                        style={styles.contentSetup}
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity style={styles.backButton} onPress={onClose}>
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <Text style={styles.title}>À vous de jouer : validez ses tâches complétées !</Text>
                            <FlatList
                                data={tasks}
                                style={styles.taskList}
                                showsVerticalScrollIndicator={false}
                                keyExtractor={(item) => item.id}
                                scrollEnabled={true}
                                renderItem={({ item: task }) => (
                                        <TaskCard key={task.id} task={task} />
                                )}
                            />
                    </TouchableOpacity>
                </TouchableOpacity>
            </GestureHandlerRootView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    contentSetup: {
        height: "75%",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: "#EBF2FB",
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        backgroundColor: "#333",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#2F2F2F",
        marginBottom: 20,
    },
    taskList: {
        flex: 1,
    },
    swipeableContainer: {
        marginBottom: 16,
    },
    taskCard: {
        backgroundColor: "#FFFFFF",
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
    },
    validateButton: {
        backgroundColor: "#846DED",
        marginLeft: 12,
    },
    refuseButton: {
        backgroundColor: "#6A6A6A",
    },
    deleteButton: {
        backgroundColor: "#FF5C7C",
    },
});

export default ManageTasksModal;