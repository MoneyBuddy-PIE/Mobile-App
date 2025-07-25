import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	SafeAreaView,
	ActivityIndicator,
	TouchableOpacity,
	Alert,
	Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { chapterService } from "@/services/chapterService";
import { Chapter, Course } from "@/types/Chapter";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "@/styles/typography";

const COURSE_IMAGES = [
	require("@/assets/images/cours/course-1.png"),
	require("@/assets/images/cours/course-2.png"),
	require("@/assets/images/cours/course-3.png"),
	require("@/assets/images/cours/course-4.png"),
	require("@/assets/images/cours/course-5.png"),
	require("@/assets/images/cours/course-6.png"),
];

export default function ChapterDetail() {
	const params = useLocalSearchParams();
	const chapterId = params.id as string;
	const imgIndex = parseInt(params.imgIndex as string) || 0;
	const courseImage = COURSE_IMAGES[imgIndex % COURSE_IMAGES.length];

	console.log("chapter", imgIndex, courseImage);

	const [chapter, setChapter] = useState<Chapter | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadChapter();
	}, [chapterId]);

	const loadChapter = async () => {
		try {
			const chapterData = await chapterService.getChapterById(chapterId);
			setChapter(chapterData);
		} catch (error) {
			console.error("Error loading chapter:", error);
			Alert.alert("Erreur", "Impossible de charger le chapitre", [
				{ text: "Retour", onPress: () => router.back() },
			]);
		} finally {
			setLoading(false);
		}
	};

	const handleCoursePress = (course: Course, index: number) => {
		if (course.locked) {
			Alert.alert("Cours verrouillé", "Complétez les cours précédents pour débloquer celui-ci.");
			return;
		}
		// TODO: Navigation vers le détail du cours
		console.log(`Navigate to course ${index} of chapter ${chapterId}`);
	};

	const renderCourse = (course: Course, index: number) => {
		const isCompleted = false;
		const isLocked = course.locked;

		return (
			<TouchableOpacity
				key={index}
				style={[styles.courseCard, isLocked && styles.courseCardLocked]}
				onPress={() => handleCoursePress(course, index)}
				disabled={isLocked}
			>
				{/* Progression indicator */}
				<View style={styles.progressIndicator}>
					<View style={[styles.progressDot, isCompleted && styles.progressDotCompleted]}>
						{isCompleted && <Ionicons name="checkmark" size={12} color="#fff" />}
					</View>
					{index < (chapter?.courses.length || 0) - 1 && (
						<View style={[styles.progressLine, isCompleted && styles.progressLineCompleted]} />
					)}
				</View>

				{/* Course content */}
				<View style={styles.courseContent}>
					<View style={styles.courseHeader}>
						<View style={styles.courseInfo}>
							<Text style={[styles.courseTitle, typography.bold, typography["sm"], isLocked && styles.courseTextLocked]}>
								{course.title}
							</Text>
							<View style={styles.courseMeta}>
								<Ionicons name="book-outline" size={14} color={isLocked ? "#ccc" : "#666"} />
								<Text style={[styles.courseMetaText, isLocked && styles.courseTextLocked]}>
									Lecture - {course.readTime} min
								</Text>
							</View>
						</View>

						{/* Course illustration placeholder */}
						<View style={[styles.courseImage, isLocked && styles.courseImageLocked]}>
							<Text style={styles.courseImageEmoji}>
								{index % 4 === 0 ? "💰" : index % 4 === 1 ? "📊" : index % 4 === 2 ? "🎯" : "👥"}
							</Text>
						</View>
					</View>

					{isLocked && (
						<View style={styles.lockOverlay}>
							<Ionicons name="lock-closed" size={16} color="#ccc" />
						</View>
					)}
				</View>
			</TouchableOpacity>
		);
	};

	if (loading) {
		return (
			<View style={[styles.container, styles.center]}>
				<ActivityIndicator size="large" color="#6C5CE7" />
				<Text style={styles.loadingText}>Chargement du chapitre...</Text>
			</View>
		);
	}

	if (!chapter) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={[styles.container, styles.center]}>
					<Text style={styles.errorText}>Chapitre non trouvé</Text>
					<TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
						<Text style={styles.backButtonText}>Retour</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			{/* Header avec illustration */}
			<View style={styles.headerContainer}>
				<View style={styles.headerBackground}>
					{/* Image de fond */}
					<Image source={courseImage} style={styles.headerImage} resizeMode="cover" />
				</View>

				{/* Bouton retour */}
				<TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
					<Ionicons name="arrow-back" size={20} color="#fff" />
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
				{/* Titre et description du chapitre */}
				<View style={styles.chapterHeader}>
					<Text style={[styles.chapterTitle, typography.heading]}>{chapter.title}</Text>
					<Text style={styles.chapterDescription}>{chapter.description}</Text>
				</View>

				{/* Liste des cours */}
				<View style={styles.coursesContainer}>
					{chapter.courses.map((course, index) => renderCourse(course, index))}
				</View>

				<View style={styles.bottomPadding} />
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#EBF2FB",
	},
	center: {
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 12,
		fontSize: 16,
		color: "#666",
	},
	errorText: {
		fontSize: 18,
		color: "#f44336",
		marginBottom: 20,
	},
	backButton: {
		backgroundColor: "#6C5CE7",
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	backButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	headerContainer: {
		height: 200,
		position: "relative",
	},
	headerImage: {
		width: "100%",
		height: "100%",
		opacity: 0.8,
	},
	headerBackground: {
		flex: 1,
		backgroundColor: "#E5F3FF",
		position: "relative",
		overflow: "hidden",
	},
	backIcon: {
		position: "absolute",
		top: 20,
		left: 20,
		width: 48,
		height: 48,
		backgroundColor: "#2F2F2F",
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	chapterHeader: {
		paddingVertical: 24,
	},
	chapterTitle: {
		marginBottom: 16,
		lineHeight: 30,
	},
	chapterDescription: {
		fontSize: 16,
		color: "#666",
		lineHeight: 24,
	},
	coursesContainer: {
		paddingBottom: 20,
	},
	courseCard: {
		flexDirection: "row",
		marginBottom: 16,
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 8,
		shadowColor: "#BFD0EA",
		shadowOffset: {
			width: 0,
			height: 3.89,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
	},
	courseCardLocked: {
		opacity: 0.6,
	},
	progressIndicator: {
		alignItems: "center",
		marginRight: 16,
		paddingTop: 4,
	},
	progressDot: {
		width: 24,
		height: 24,
		borderRadius: 8,
		backgroundColor: "#e0e0e0",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 8,
	},
	progressDotCompleted: {
		backgroundColor: "#6C5CE7",
	},
	progressLine: {
		width: 2,
		flex: 1,
		backgroundColor: "#e0e0e0",
		minHeight: 40,
	},
	progressLineCompleted: {
		backgroundColor: "#6C5CE7",
	},
	courseContent: {
		flex: 1,
		position: "relative",
	},
	courseHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},
	courseInfo: {
		flex: 1,
		marginRight: 12,
	},
	courseTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		marginBottom: 8,
		lineHeight: 22,
	},
	courseMeta: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	courseMetaText: {
		fontSize: 14,
		color: "#666",
	},
	courseTextLocked: {
		color: "#ccc",
	},
	courseImage: {
		width: 120,
		height: 120,
		backgroundColor: "#f0f8ff",
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
	},
	courseImageLocked: {
		backgroundColor: "#f5f5f5",
	},
	courseImageEmoji: {
		fontSize: 24,
	},
	lockOverlay: {
		position: "absolute",
		top: 0,
		right: 0,
		padding: 4,
	},
	bottomPadding: {
		height: 20,
	},
});
