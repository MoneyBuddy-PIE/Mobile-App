import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Modal, Dimensions, TouchableOpacity, Animated, PanResponder, StatusBar, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "@/styles/typography";
import { Task } from "@/types/Task";
import { SubAccount } from "@/types/Account";
import TaskTile from "../TaskTile";
import { colors } from "@/styles";

const { height: screenHeight } = Dimensions.get("window");
const MODAL_HEIGHT = screenHeight * 0.75;
const CLOSE_THRESHOLD = 150;

interface ValidateTasksModalProps {
    tasks: Task[];
    children: SubAccount[];
    visible: boolean;
    onClose: () => void;
    onValidateTasks: (tasks: Task[]) => void;
}

export const ValidateTasksModal: React.FC<ValidateTasksModalProps> = ({ tasks, children, visible, onClose, onValidateTasks }) => {
    const translateY = useRef(new Animated.Value(MODAL_HEIGHT)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    const getChildName = (subaccountIdChild: string): string => {
        const child = children.find((c) => c.id === subaccountIdChild);
        return child?.name || "Enfant";
    };

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dy) > 5 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    translateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > CLOSE_THRESHOLD || gestureState.vy > 0.5) {
                    closeModal();
                } else {
                    // Snap back to open position
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 100,
                        friction: 8,
                    }).start();
                }
            },
        }),
    ).current;

    useEffect(() => {
        if (visible) {
            StatusBar.setBarStyle("light-content");
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 8,
                }),
            ]).start();
        } else {
            closeModal();
        }
    }, [visible]);

    const closeModal = () => {
        StatusBar.setBarStyle("dark-content");
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: MODAL_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose();
        });
    };

    const handleBackdropPress = () => {
        closeModal();
    };

    return (
        <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={closeModal}>
            <View style={styles.container}>
                {/* Backdrop */}
                <Animated.View style={[styles.backdrop, { opacity }]}>
                    <TouchableOpacity style={styles.backdropTouchable} onPress={handleBackdropPress} />
                </Animated.View>

                {/* Modal Content */}
                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            transform: [{ translateY }],
                        },
                    ]}
                    {...panResponder.panHandlers}
                >
                    {/* Close button */}
                    <View style={{ alignItems: "flex-end", padding: 20 }}>
                        <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView style={styles.content}>
                        {tasks.length === 0 ? (
                            <Text style={typography.body}>Aucune tâche en attente de validation.</Text>
                        ) : (
                            <>
                                <Text style={[typography.xl, typography.bold, { marginBottom: 16, color: colors.carbon[100] }]}>
                                    À vous de jouer : validez ses tâches complétées ! ✅
                                </Text>
                                {tasks.map((task) => (
                                    <TaskTile key={task.id} task={task} showName childName={getChildName(task.subaccountIdChild)} />
                                ))}
                            </>
                        )}
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    backdropTouchable: {
        flex: 1,
    },
    modalContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: MODAL_HEIGHT,
        backgroundColor: "#EBF2FB",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    closeButton: {
        width: 48,
        height: 48,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        // paddingTop: 32,
        paddingBottom: 24,
    },
});
