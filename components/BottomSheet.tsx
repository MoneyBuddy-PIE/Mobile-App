import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    Modal,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Dimensions,
    PanResponder,
    TouchableWithoutFeedback,
    ScrollView,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    height?: number | string;
    snapPoint?: number;
    enableSwipeDown?: boolean;
    variant?: "modal" | "persistent";
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
    visible,
    onClose,
    children,
    title,
    height = "50%",
    snapPoint = 50,
    enableSwipeDown = true,
    variant = "modal",
}) => {
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const panY = useRef(0);

    const getSheetHeight = () => {
        if (typeof height === "number") return height;
        if (typeof height === "string" && height.includes("%")) {
            const percent = parseInt(height);
            return (SCREEN_HEIGHT * percent) / 100;
        }
        return SCREEN_HEIGHT * 0.35;
    };

    const sheetHeight = getSheetHeight();

    useEffect(() => {
        if (visible) {
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 8,
            }).start();
        } else {
            Animated.timing(translateY, {
                toValue: SCREEN_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => enableSwipeDown,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return enableSwipeDown && gestureState.dy > 5;
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    panY.current = gestureState.dy;
                    translateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                const threshold = sheetHeight * 0.3;

                if (gestureState.dy > threshold || gestureState.vy > 0.5) {
                    Animated.timing(translateY, {
                        toValue: SCREEN_HEIGHT,
                        duration: 200,
                        useNativeDriver: true,
                    }).start(() => {
                        onClose();
                    });
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 50,
                        friction: 8,
                    }).start();
                }
                panY.current = 0;
            },
        }),
    ).current;

    const handleBackdropPress = () => {
        onClose();
    };

    if (variant === "persistent") {
        return (
            <View
                style={[
                    styles.bottomSheet,
                    styles.persistentSheet,
                    {
                        height: sheetHeight,
                    },
                ]}
            >
                {/* Handle */}
                <View style={styles.handleContainer} {...panResponder.panHandlers}>
                    <View style={styles.handle} />
                </View>

                {/* Titre optionnel */}
                {title && (
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                    </View>
                )}

                {/* Contenu */}
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
                    {children}
                </ScrollView>
            </View>
        );
    }

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <View style={styles.overlay}>
                {/* Backdrop */}
                <TouchableWithoutFeedback onPress={handleBackdropPress}>
                    <Animated.View
                        style={[
                            styles.backdrop,
                            {
                                opacity: translateY.interpolate({
                                    inputRange: [0, SCREEN_HEIGHT],
                                    outputRange: [1, 0],
                                }),
                            },
                        ]}
                    />
                </TouchableWithoutFeedback>

                {/* Bottom Sheet */}
                <Animated.View
                    style={[
                        styles.bottomSheet,
                        {
                            height: sheetHeight,
                            transform: [{ translateY }],
                        },
                    ]}
                >
                    {/* Handle */}
                    <View style={styles.handleContainer} {...panResponder.panHandlers}>
                        <View style={styles.handle} />
                    </View>

                    {/* Titre optionnel */}
                    {title && (
                        <View style={styles.header}>
                            <Text style={styles.title}>{title}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Contenu */}
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
                        {children}
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    bottomSheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 10,
        paddingHorizontal: 24,
    },
    persistentSheet: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    handleContainer: {
        alignItems: "center",
        paddingVertical: 12,
    },
    handle: {
        width: 110,
        height: 5,
        backgroundColor: "#2F2F2F",
        borderRadius: 24,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#333",
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
    },
    closeButtonText: {
        fontSize: 20,
        color: "#666",
        fontWeight: "600",
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
    },
});
