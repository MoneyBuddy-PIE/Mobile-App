import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Dimensions,
    TouchableOpacity,
    Animated,
    PanResponder,
    StatusBar,
    Linking,
    Alert,
    Image,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CourseWithoutSectionsWithProgress } from "@/types/Chapter";
import { typography } from "@/styles/typography";
import { getImageUrl } from "@/utils/image";

const { height: screenHeight } = Dimensions.get("window");
const MODAL_HEIGHT = screenHeight * 0.88;
const CLOSE_THRESHOLD = 150;

interface CourseDetailModalProps {
    course: CourseWithoutSectionsWithProgress | null;
    visible: boolean;
    onClose: () => void;
    onStartCourse: (course: CourseWithoutSectionsWithProgress) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({ course, visible, onClose, onStartCourse }) => {
    const translateY = useRef(new Animated.Value(MODAL_HEIGHT)).current;
    const opacity = useRef(new Animated.Value(0)).current;

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

    const handleResourcePress = async (url: string) => {
        try {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            } else {
                Alert.alert("Erreur", "Impossible d'ouvrir ce lien");
            }
        } catch (error) {
            console.error("Error opening URL:", error);
            Alert.alert("Erreur", "Une erreur s'est produite lors de l'ouverture du lien");
        }
    };

    if (!course) return null;

    return (
        <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={closeModal}>
            <View style={styles.container}>
                {/* Backdrop */}
                <Animated.View style={[styles.backdrop, { opacity }]}>
                    <TouchableOpacity style={styles.backdropTouchable} onPress={handleBackdropPress} />
                </Animated.View>

                {/* Modal Content */}
                <Animated.View style={[styles.modalContainer, { transform: [{ translateY }] }]} {...panResponder.panHandlers}>
                    {/* Image */}
                    <View style={styles.imageContainer}>
                        {course.imageUrl ? (
                            <Image source={{ uri: getImageUrl(course.imageUrl) ?? undefined }} style={styles.modalImage} resizeMode="cover" />
                        ) : (
                            <View style={[styles.modalImage, styles.modalImagePlaceholder]} />
                        )}
                    </View>

                    {/* Handle */}
                    <View style={styles.handleContainer}>
                        <View style={styles.handle} />
                    </View>

                    {/* Close button */}
                    <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                        <Ionicons name="close" size={20} color="#fff" />
                    </TouchableOpacity>

                    {/* Scrollable content */}
                    <ScrollView
                        style={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContentContainer}
                    >
                        {/* Course Title */}
                        <Text style={styles.courseTitle}>{course.title}</Text>

                        {/* Read time */}
                        <View style={styles.courseInfo}>
                            <View style={styles.infoItem}>
                                <Ionicons name="book-outline" size={16} color="#2F2F2F" />
                                <Text style={styles.infoText}>Lecture - {course.readTime} min</Text>
                            </View>
                        </View>

                        {/* Sources Section */}
                        {course.ressource && course.ressource.length > 0 && (
                            <View style={styles.sourcesSection}>
                                <Text style={styles.sourcesTitle}>Sources</Text>
                                {course.ressource.map((resource, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.sourceItem}
                                        onPress={() => handleResourcePress(resource.url)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.sourceTitle}>{resource.title}</Text>
                                        <Text style={styles.sourceInfo}>La finance pour tous</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </ScrollView>

                    {/* Sticky bottom button */}
                    <View style={styles.bottomBar}>
                        <TouchableOpacity style={styles.startButton} onPress={() => onStartCourse(course)}>
                            <Text style={styles.startButtonText}>Commencer</Text>
                        </TouchableOpacity>
                    </View>
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
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: "hidden",
    },
    imageContainer: {
        height: 205,
        width: "100%",
    },
    modalImage: {
        width: "100%",
        height: "100%",
    },
    modalImagePlaceholder: {
        backgroundColor: "#D1DEF1",
    },
    handleContainer: {
        position: "absolute",
        top: 8,
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 2,
    },
    handle: {
        width: 109,
        height: 5,
        backgroundColor: "#2F2F2F",
        borderRadius: 24,
    },
    closeButton: {
        position: "absolute",
        top: 16,
        right: 16,
        width: 44,
        height: 44,
        backgroundColor: "#2F2F2F",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 3,
    },
    scrollContent: {
        flex: 1,
    },
    scrollContentContainer: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
        gap: 12,
    },
    courseTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#2F2F2F",
        lineHeight: 29,
        fontFamily: "DMSans_700Bold",
    },
    courseInfo: {
        flexDirection: "row",
    },
    infoItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    infoText: {
        fontSize: 14,
        color: "#2F2F2F",
        fontFamily: "DMSans_400Regular",
    },
    sourcesSection: {
        gap: 8,
    },
    sourcesTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#2F2F2F",
        fontFamily: "DMSans_700Bold",
    },
    sourceItem: {
        backgroundColor: "#D1DEF1",
        padding: 8,
        borderRadius: 8,
        gap: 8,
    },
    sourceTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#2F2F2F",
        fontFamily: "DMSans_700Bold",
    },
    sourceInfo: {
        fontSize: 12,
        color: "#2F2F2F",
        fontFamily: "DMSans_400Regular",
    },
    bottomBar: {
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#BFD0EA",
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
    },
    startButton: {
        backgroundColor: "#846DED",
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: "center",
        shadowColor: "#4E31CF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    startButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        fontFamily: "DMSans_700Bold",
    },
});
