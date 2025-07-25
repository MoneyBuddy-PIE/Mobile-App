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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Course } from "@/types/Chapter";
import { typography } from "@/styles/typography";

const { height: screenHeight } = Dimensions.get("window");
const MODAL_HEIGHT = screenHeight * 0.75;
const CLOSE_THRESHOLD = 150;

interface CourseDetailModalProps {
	course: Course | null;
	visible: boolean;
	onClose: () => void;
	onStartCourse: (course: Course) => void;
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
		})
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
				<Animated.View
					style={[
						styles.modalContainer,
						{
							transform: [{ translateY }],
						},
					]}
					{...panResponder.panHandlers}
				>
					{/* Handle */}
					<View style={styles.handle} />

					{/* Close button */}
					<TouchableOpacity style={styles.closeButton} onPress={closeModal}>
						<Ionicons name="close" size={24} color="#fff" />
					</TouchableOpacity>

					{/* Content */}
					<View style={styles.content}>
						{/* Course Title */}
						<Text style={[styles.courseTitle, typography.heading]}>{course.title}</Text>

						{/* Course Info */}
						<View style={styles.courseInfo}>
							<View style={styles.infoItem}>
								<Ionicons name="book-outline" size={16} color="#666" />
								<Text style={styles.infoText}>Lecture - {course.readTime} min</Text>
							</View>
							<View style={styles.infoItem}>
								<Ionicons name="library-outline" size={16} color="#666" />
								<Text style={styles.infoText}>{course.sections.length} sections</Text>
							</View>
						</View>

						{/* Sources Section */}
						{course.resources && course.resources.length > 0 && (
							<View style={styles.sourcesSection}>
								<Text style={[styles.sourcesTitle, typography.subheading]}>Sources</Text>
								{course.resources.map((resource, index) => (
									<TouchableOpacity
										key={index}
										style={styles.sourceItem}
										onPress={() => handleResourcePress(resource.url)}
										activeOpacity={0.7}
									>
										<View style={styles.sourceContent}>
											<Text style={[styles.sourceTitle, typography.semiBold]}>
												{resource.title}
											</Text>
											<Text style={styles.sourceInfo}>2025, La finance pour tous</Text>
										</View>
										<Ionicons name="open-outline" size={16} color="#6C5CE7" />
									</TouchableOpacity>
								))}
							</View>
						)}

						{/* Start Button */}
						<TouchableOpacity style={styles.startButton} onPress={() => onStartCourse(course)}>
							<Text style={[styles.startButtonText, typography.button]}>Commencer</Text>
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
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
	},
	handle: {
		width: 40,
		height: 4,
		backgroundColor: "#D1D5DB",
		borderRadius: 2,
		alignSelf: "center",
		marginTop: 12,
		marginBottom: 8,
	},
	closeButton: {
		position: "absolute",
		top: 16,
		right: 16,
		width: 36,
		height: 36,
		backgroundColor: "rgba(0, 0, 0, 0.8)",
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 1,
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
		paddingTop: 32,
		paddingBottom: 24,
	},
	courseTitle: {
		marginBottom: 16,
		lineHeight: 30,
	},
	courseInfo: {
		flexDirection: "row",
		gap: 24,
		marginBottom: 32,
	},
	infoItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	infoText: {
		fontSize: 14,
		color: "#666",
		fontFamily: "DMSans_400Regular",
	},
	startButton: {
		backgroundColor: "#846DED",
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
		marginBottom: 32,
		shadowColor: "#4E31CF",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 8,
	},
	startButtonText: {
		color: "#fff",
		fontSize: 16,
	},
	sourcesSection: {
		flex: 1,
	},
	sourcesTitle: {
		marginBottom: 16,
		color: "#333",
	},
	sourceItem: {
		backgroundColor: "rgba(191, 208, 234, 0.6)",
		padding: 16,
		borderRadius: 8,
		marginBottom: 12,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	sourceContent: {
		flex: 1,
	},
	sourceTitle: {
		fontSize: 14,
		color: "#333",
		marginBottom: 4,
	},
	sourceInfo: {
		fontSize: 12,
		color: "#666",
		fontFamily: "DMSans_400Regular",
	},
});
