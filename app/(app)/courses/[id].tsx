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
	Animated,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { courseService } from "@/services/courseService";
import { Course, Question } from "@/types/Course";

type ViewMode = "overview" | "quiz" | "completed";

export default function CourseDetail() {
	const params = useLocalSearchParams();
	const courseId = params.id as string;

	const [course, setCourse] = useState<Course | null>(null);
	const [loading, setLoading] = useState(true);
	const [viewMode, setViewMode] = useState<ViewMode>("overview");
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
	const [correctAnswers, setCorrectAnswers] = useState(0);
	const [showResult, setShowResult] = useState(false);
	const [quizCompleting, setQuizCompleting] = useState(false);

	// Animation
	const [progressAnimation] = useState(new Animated.Value(0));
	const [scaleAnimation] = useState(new Animated.Value(0));

	useEffect(() => {
		loadCourse();
	}, [courseId]);

	useEffect(() => {
		if (viewMode === "quiz") {
			// Animer la barre de progression
			const progress = (currentQuestionIndex + 1) / (course?.questions.length || 1);
			Animated.timing(progressAnimation, {
				toValue: progress,
				duration: 300,
				useNativeDriver: false,
			}).start();
		}
	}, [currentQuestionIndex, viewMode, course]);

	const loadCourse = async () => {
		try {
			const courseData = await courseService.getCourseById(courseId);
			setCourse(courseData);
		} catch (error) {
			console.error("Error loading course:", error);
			Alert.alert("Erreur", "Impossible de charger le cours", [{ text: "Retour", onPress: () => router.back() }]);
		} finally {
			setLoading(false);
		}
	};

	const startQuiz = () => {
		setViewMode("quiz");
		setCurrentQuestionIndex(0);
		setSelectedAnswers([]);
		setCorrectAnswers(0);
		setShowResult(false);
	};

	const selectAnswer = (answerIndex: number) => {
		const newSelectedAnswers = [...selectedAnswers];
		newSelectedAnswers[currentQuestionIndex] = answerIndex;
		setSelectedAnswers(newSelectedAnswers);
	};

	const nextQuestion = () => {
		if (!course) return;

		// Vérifier si la réponse est correcte
		const currentQuestion = course.questions[currentQuestionIndex];
		const selectedAnswerIndex = selectedAnswers[currentQuestionIndex];
		const isCorrect = currentQuestion.answers[selectedAnswerIndex]?.correct;

		if (isCorrect) {
			setCorrectAnswers((prev) => prev + 1);
		}

		// Afficher le résultat de la question
		setShowResult(true);

		// Passer à la question suivante après un délai
		setTimeout(() => {
			if (currentQuestionIndex + 1 < course.questions.length) {
				setCurrentQuestionIndex((prev) => prev + 1);
				setShowResult(false);
			} else {
				// Quiz terminé
				completeQuiz();
			}
		}, 1500);
	};

	const completeQuiz = async () => {
		if (!course) return;

		setQuizCompleting(true);
		try {
			await courseService.completeCourse(course.id, {
				questionAnswered: correctAnswers,
			});

			// Animation de succès
			Animated.spring(scaleAnimation, {
				toValue: 1,
				friction: 8,
				tension: 100,
				useNativeDriver: true,
			}).start();

			setViewMode("completed");
		} catch (error) {
			console.error("Error completing course:", error);
			Alert.alert("Erreur", "Impossible de terminer le cours");
		} finally {
			setQuizCompleting(false);
		}
	};

	const getScoreMessage = () => {
		if (!course) return "";
		const percentage = (correctAnswers / course.questions.length) * 100;

		if (percentage >= 80) return "Excellent ! 🎉";
		if (percentage >= 60) return "Bien joué ! 👍";
		if (percentage >= 40) return "Pas mal ! 👌";
		return "Continue tes efforts ! 💪";
	};

	const getScoreColor = () => {
		if (!course) return "#666";
		const percentage = (correctAnswers / course.questions.length) * 100;

		if (percentage >= 80) return "#4CAF50";
		if (percentage >= 60) return "#FF9800";
		return "#f44336";
	};

	if (loading) {
		return (
			<View style={[styles.container, styles.center]}>
				<ActivityIndicator size="large" color="#6C5CE7" />
				<Text style={styles.loadingText}>Chargement du cours...</Text>
			</View>
		);
	}

	if (!course) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={[styles.container, styles.center]}>
					<Text style={styles.errorText}>Cours non trouvé</Text>
					<TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
						<Text style={styles.backButtonText}>Retour</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	// Vue d'aperçu du cours
	if (viewMode === "overview") {
		return (
			<SafeAreaView style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
						<Text style={styles.backIcon}>←</Text>
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Cours</Text>
					<View style={styles.placeholder} />
				</View>

				<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
					{/* Course Info */}
					<View style={styles.courseHeader}>
						<View style={styles.courseIcon}>
							<Text style={styles.courseEmoji}>📚</Text>
						</View>
						<Text style={styles.courseTitle}>{course.title}</Text>
						<Text style={styles.courseDescription}>{course.description}</Text>

						<View style={styles.courseMetrics}>
							<View style={styles.metric}>
								<Text style={styles.metricIcon}>⏱️</Text>
								<Text style={styles.metricText}>{course.readTime} min</Text>
							</View>
							<View style={styles.metric}>
								<Text style={styles.metricIcon}>❓</Text>
								<Text style={styles.metricText}>{course.questions.length} questions</Text>
							</View>
						</View>
					</View>

					{/* Course Content Preview */}
					<View style={styles.contentPreview}>
						<Text style={styles.sectionTitle}>Ce que vous allez apprendre</Text>
						{course.questions.slice(0, 3).map((question, index) => (
							<View key={index} style={styles.topicItem}>
								<Text style={styles.topicIcon}>✓</Text>
								<Text style={styles.topicText}>Sujet {index + 1}</Text>
							</View>
						))}
						{course.questions.length > 3 && (
							<Text style={styles.moreTopics}>Et {course.questions.length - 3} autres sujets...</Text>
						)}
					</View>
				</ScrollView>

				{/* Start Button */}
				<View style={styles.footer}>
					<TouchableOpacity style={styles.startButton} onPress={startQuiz}>
						<Text style={styles.startButtonText}>Commencer le cours</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	// Vue du quiz
	if (viewMode === "quiz") {
		const currentQuestion = course.questions[currentQuestionIndex];
		const selectedAnswerIndex = selectedAnswers[currentQuestionIndex];
		const hasSelectedAnswer = selectedAnswerIndex !== undefined;

		return (
			<SafeAreaView style={styles.container}>
				{/* Header with progress */}
				<View style={styles.quizHeader}>
					<TouchableOpacity onPress={() => setViewMode("overview")}>
						<Text style={styles.backIcon}>←</Text>
					</TouchableOpacity>
					<View style={styles.progressContainer}>
						<View style={styles.progressTrack}>
							<Animated.View
								style={[
									styles.progressFill,
									{
										width: progressAnimation.interpolate({
											inputRange: [0, 1],
											outputRange: ["0%", "100%"],
										}),
									},
								]}
							/>
						</View>
						<Text style={styles.progressText}>
							{currentQuestionIndex + 1}/{course.questions.length}
						</Text>
					</View>
				</View>

				<ScrollView style={styles.quizContent} showsVerticalScrollIndicator={false}>
					{/* Question */}
					<View style={styles.questionContainer}>
						<Text style={styles.questionText}>{currentQuestion.question}</Text>
					</View>

					{/* Answers */}
					<View style={styles.answersContainer}>
						{currentQuestion.answers.map((answer, index) => {
							const isSelected = selectedAnswerIndex === index;
							const isCorrect = answer.correct;

							let answerStyle: any[] = [styles.answerOption];
							if (showResult) {
								if (isCorrect) {
									answerStyle.push(styles.correctAnswer);
								} else if (isSelected && !isCorrect) {
									answerStyle.push(styles.wrongAnswer);
								}
							} else if (isSelected) {
								answerStyle.push(styles.selectedAnswer);
							}

							return (
								<TouchableOpacity
									key={index}
									style={answerStyle}
									onPress={() => !showResult && selectAnswer(index)}
									disabled={showResult}
								>
									<Text
										style={[
											styles.answerText,
											isSelected && !showResult && styles.selectedAnswerText,
											showResult && isCorrect && styles.correctAnswerText,
											showResult && isSelected && !isCorrect && styles.wrongAnswerText,
										]}
									>
										{answer.answer}
									</Text>
									{showResult && isCorrect && <Text style={styles.resultIcon}>✓</Text>}
									{showResult && isSelected && !isCorrect && <Text style={styles.resultIcon}>✗</Text>}
								</TouchableOpacity>
							);
						})}
					</View>
				</ScrollView>

				{/* Next Button */}
				{!showResult && (
					<View style={styles.footer}>
						<TouchableOpacity
							style={[styles.nextButton, !hasSelectedAnswer && styles.nextButtonDisabled]}
							onPress={nextQuestion}
							disabled={!hasSelectedAnswer}
						>
							<Text style={styles.nextButtonText}>
								{currentQuestionIndex + 1 === course.questions.length ? "Terminer" : "Suivant"}
							</Text>
						</TouchableOpacity>
					</View>
				)}

				{/* Loading overlay for completion */}
				{quizCompleting && (
					<View style={styles.loadingOverlay}>
						<ActivityIndicator size="large" color="#fff" />
						<Text style={styles.loadingOverlayText}>Finalisation...</Text>
					</View>
				)}
			</SafeAreaView>
		);
	}

	// Vue de complétion
	if (viewMode === "completed") {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.completedContainer}>
					<Animated.View style={[styles.successIcon, { transform: [{ scale: scaleAnimation }] }]}>
						<Text style={styles.successEmoji}>🎉</Text>
					</Animated.View>

					<Text style={styles.completedTitle}>Cours terminé !</Text>
					<Text style={styles.completedMessage}>{getScoreMessage()}</Text>

					<View style={styles.scoreContainer}>
						<Text style={styles.scoreLabel}>Votre score</Text>
						<Text style={[styles.scoreValue, { color: getScoreColor() }]}>
							{correctAnswers}/{course.questions.length}
						</Text>
						<Text style={styles.scorePercentage}>
							{Math.round((correctAnswers / course.questions.length) * 100)}%
						</Text>
					</View>

					<TouchableOpacity style={styles.finishButton} onPress={() => router.back()}>
						<Text style={styles.finishButtonText}>Retour aux cours</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	return null;
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f9fa",
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
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingTop: 10,
		paddingBottom: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},
	backButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#f0f0f0",
		justifyContent: "center",
		alignItems: "center",
	},
	backIcon: {
		fontSize: 18,
		color: "#333",
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
	},
	placeholder: {
		width: 40,
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	courseHeader: {
		alignItems: "center",
		paddingVertical: 32,
	},
	courseIcon: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: "#E5F3FF",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 20,
	},
	courseEmoji: {
		fontSize: 40,
	},
	courseTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#333",
		textAlign: "center",
		marginBottom: 12,
	},
	courseDescription: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		lineHeight: 22,
		marginBottom: 24,
		paddingHorizontal: 20,
	},
	courseMetrics: {
		flexDirection: "row",
		gap: 32,
	},
	metric: {
		alignItems: "center",
		gap: 8,
	},
	metricIcon: {
		fontSize: 24,
	},
	metricText: {
		fontSize: 14,
		color: "#666",
		fontWeight: "500",
	},
	contentPreview: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 20,
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 16,
	},
	topicItem: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
	},
	topicIcon: {
		fontSize: 16,
		color: "#4CAF50",
		marginRight: 12,
		width: 20,
	},
	topicText: {
		fontSize: 16,
		color: "#333",
	},
	moreTopics: {
		fontSize: 14,
		color: "#666",
		fontStyle: "italic",
		marginTop: 8,
	},
	footer: {
		paddingHorizontal: 20,
		paddingBottom: 20,
		paddingTop: 16,
	},
	startButton: {
		backgroundColor: "#6C5CE7",
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
	},
	startButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	backButtonText: {
		color: "#6C5CE7",
		fontSize: 16,
		fontWeight: "600",
	},

	// Quiz styles
	quizHeader: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingTop: 10,
		paddingBottom: 20,
		gap: 16,
	},
	progressContainer: {
		flex: 1,
		alignItems: "center",
		gap: 8,
	},
	progressTrack: {
		width: "100%",
		height: 6,
		backgroundColor: "#e0e0e0",
		borderRadius: 3,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: "#6C5CE7",
		borderRadius: 3,
	},
	progressText: {
		fontSize: 14,
		color: "#666",
		fontWeight: "500",
	},
	quizContent: {
		flex: 1,
		paddingHorizontal: 20,
	},
	questionContainer: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 24,
		marginBottom: 24,
	},
	questionText: {
		fontSize: 20,
		fontWeight: "600",
		color: "#333",
		lineHeight: 28,
		textAlign: "center",
	},
	answersContainer: {
		gap: 12,
		marginBottom: 20,
	},
	answerOption: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 20,
		borderWidth: 2,
		borderColor: "#e0e0e0",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	selectedAnswer: {
		borderColor: "#6C5CE7",
		backgroundColor: "#F5F3FF",
	},
	correctAnswer: {
		borderColor: "#4CAF50",
		backgroundColor: "#E8F5E8",
	},
	wrongAnswer: {
		borderColor: "#f44336",
		backgroundColor: "#FFEBEE",
	},
	answerText: {
		fontSize: 16,
		color: "#333",
		flex: 1,
	},
	selectedAnswerText: {
		color: "#6C5CE7",
		fontWeight: "600",
	},
	correctAnswerText: {
		color: "#4CAF50",
		fontWeight: "600",
	},
	wrongAnswerText: {
		color: "#f44336",
		fontWeight: "600",
	},
	resultIcon: {
		fontSize: 20,
		fontWeight: "bold",
	},
	nextButton: {
		backgroundColor: "#6C5CE7",
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
	},
	nextButtonDisabled: {
		backgroundColor: "#ccc",
	},
	nextButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	loadingOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0, 0, 0, 0.8)",
		justifyContent: "center",
		alignItems: "center",
		gap: 16,
	},
	loadingOverlayText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "500",
	},

	// Completion styles
	completedContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 40,
	},
	successIcon: {
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: "#E8F5E8",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 32,
	},
	successEmoji: {
		fontSize: 60,
	},
	completedTitle: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#333",
		textAlign: "center",
		marginBottom: 12,
	},
	completedMessage: {
		fontSize: 18,
		color: "#666",
		textAlign: "center",
		marginBottom: 32,
	},
	scoreContainer: {
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 24,
		marginBottom: 32,
		minWidth: 200,
	},
	scoreLabel: {
		fontSize: 16,
		color: "#666",
		marginBottom: 8,
	},
	scoreValue: {
		fontSize: 36,
		fontWeight: "bold",
		marginBottom: 4,
	},
	scorePercentage: {
		fontSize: 18,
		color: "#666",
		fontWeight: "600",
	},
	finishButton: {
		backgroundColor: "#6C5CE7",
		paddingHorizontal: 48,
		paddingVertical: 16,
		borderRadius: 12,
		minWidth: 200,
	},
	finishButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
		textAlign: "center",
	},
});
