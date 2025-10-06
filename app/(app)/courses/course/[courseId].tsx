import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";
import { Course, Section, Quiz } from "@/types/Chapter";
import { typography } from "@/styles/typography";

interface CourseStep {
    type: "section" | "quiz";
    sectionIndex: number;
    section: Section;
    quizIndex?: number;
}

export default function CourseReader() {
    const params = useLocalSearchParams();
    const courseData = JSON.parse(params.courseData as string) as Course;

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [totalQuizQuestions, setTotalQuizQuestions] = useState(0);

    const steps: CourseStep[] = [];
    courseData.sections.forEach((section, index) => {
        steps.push({
            type: "section",
            sectionIndex: index,
            section,
        });

        if (section.quiz && section.quiz.length > 0) {
            section.quiz.forEach((_, quizIndex) => {
                steps.push({
                    type: "quiz",
                    sectionIndex: index,
                    section,
                    quizIndex,
                });
            });
        }
    });

    const currentStep = steps[currentStepIndex];
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === steps.length - 1;

    const handlePrevious = () => {
        if (!isFirstStep) {
            setCurrentStepIndex(currentStepIndex - 1);
            resetQuizState();
        }
    };

    const handleNext = () => {
        if (!isLastStep) {
            setCurrentStepIndex(currentStepIndex + 1);
            resetQuizState();
        } else {
            Alert.alert("Félicitations !", "Vous avez terminé ce cours !", [{ text: "Retour", onPress: () => router.back() }]);
        }
    };

    const resetQuizState = () => {
        setSelectedAnswer(null);
        setShowResult(false);
        setIsCorrect(false);
        if (currentStep.type === "quiz" && currentStep.quizIndex === 0) {
            setQuizScore(0);
            setTotalQuizQuestions(currentStep.section.quiz?.length || 0);
        }
    };

    const handleAnswerSelect = (answerIndex: number) => {
        if (!showResult) {
            setSelectedAnswer(answerIndex);
        }
    };

    const handleVerifyAnswer = () => {
        if (selectedAnswer === null || !currentStep.section.quiz || currentStep.quizIndex === undefined) return;

        const currentQuiz = currentStep.section.quiz[currentStep.quizIndex];
        const correct = selectedAnswer === currentQuiz.correctAnswerIndex;
        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            setQuizScore(quizScore + 1);
        }
    };

    const renderSectionContent = () => (
        <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
            <Markdown style={markdownStyles}>{currentStep.section.markdownContent}</Markdown>
        </ScrollView>
    );

    const renderQuiz = () => {
        if (!currentStep.section.quiz || currentStep.quizIndex === undefined) return null;

        const quiz = currentStep.section.quiz[currentStep.quizIndex];
        const isLastQuizQuestion = currentStep.quizIndex === currentStep.section.quiz.length - 1;

        return (
            <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.quizContainer}>
                    {/* Badge Récap */}
                    <View style={styles.recapBadge}>
                        <Text style={styles.recapText}>Récap - Question {currentStep.quizIndex + 1}/{currentStep.section.quiz.length}</Text>
                    </View>

                    <Text style={styles.quizInstruction}>Complétez la phrase</Text>

                    {/* Question */}
                    <Text style={[styles.quizQuestion, typography.body]}>{quiz.question}</Text>

                    {/* Options */}
                    <View style={styles.optionsContainer}>
                        {quiz.options.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.optionButton,
                                    selectedAnswer === index && styles.optionButtonSelected,
                                    showResult && selectedAnswer === index && (isCorrect ? styles.optionButtonCorrect : styles.optionButtonIncorrect),
                                    showResult && index === quiz.correctAnswerIndex && styles.optionButtonCorrect,
                                ]}
                                onPress={() => handleAnswerSelect(index)}
                                disabled={showResult}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        selectedAnswer === index && styles.optionTextSelected,
                                        showResult && selectedAnswer === index && (isCorrect ? styles.optionTextCorrect : styles.optionTextIncorrect),
                                        showResult && index === quiz.correctAnswerIndex && styles.optionTextCorrect,
                                    ]}
                                >
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Show score summary if it's the last quiz question and result is shown */}
                    {isLastQuizQuestion && showResult && (
                        <View style={styles.scoreSummary}>
                            <Text style={styles.scoreText}>Score: {quizScore}/{currentStep.section.quiz.length}</Text>
                            {quizScore >= quiz.minimumScoreToPass ? (
                                <Text style={styles.passText}>✅ Réussi!</Text>
                            ) : (
                                <Text style={styles.failText}>❌ Score minimum requis: {quiz.minimumScoreToPass}</Text>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        );
    };

    const getButtonText = () => {
        if (currentStep.type === "quiz") {
            if (!showResult) {
                return "Vérifier ma réponse";
            } else {
                return isLastStep ? "Terminer" : "Continuer";
            }
        } else {
            return isLastStep ? "Terminer" : "Continuer";
        }
    };

    const handleButtonPress = () => {
        if (currentStep.type === "quiz" && !showResult) {
            handleVerifyAnswer();
        } else {
            handleNext();
        }
    };

    const isButtonDisabled = () => {
        return currentStep.type === "quiz" && !showResult && selectedAnswer === null;
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                {/* Progress bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${((currentStepIndex + 1) / steps.length) * 100}%` }]} />
                    </View>
                </View>

                {/* Close button */}
                <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                    <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Section title */}
                <Text style={[styles.sectionTitle, typography.subheading]}>
                    {currentStep.sectionIndex + 1}. {currentStep.section.title}
                </Text>

                {/* Main content */}
                <View style={styles.mainContent}>{currentStep.type === "section" ? renderSectionContent() : renderQuiz()}</View>
            </View>

            {/* Navigation */}
            <View style={styles.navigation}>
                <TouchableOpacity
                    style={[styles.navButton, styles.backButton, isFirstStep && styles.navButtonDisabled]}
                    onPress={handlePrevious}
                    disabled={isFirstStep}
                >
                    <Ionicons name="arrow-back" size={20} color={isFirstStep ? "#ccc" : "#666"} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.navButton, styles.continueButton, isButtonDisabled() && styles.navButtonDisabled]}
                    onPress={handleButtonPress}
                    disabled={isButtonDisabled()}
                >
                    <Text style={[styles.continueButtonText, isButtonDisabled() && styles.continueButtonTextDisabled]}>{getButtonText()}</Text>
                    {currentStep.type === "quiz" && !showResult && <Ionicons name="checkmark" size={16} color="#fff" style={styles.checkIcon} />}
                    {(currentStep.type === "section" || showResult) && !isLastStep && (
                        <Ionicons name="arrow-forward" size={16} color="#fff" style={styles.arrowIcon} />
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#EBF2FB",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    progressContainer: {
        flex: 1,
        marginRight: 16,
    },
    progressBar: {
        height: 6,
        backgroundColor: "#D1D5DB",
        borderRadius: 3,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#6C5CE7",
        borderRadius: 3,
    },
    closeButton: {
        width: 36,
        height: 36,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        lineHeight: 24,
        color: "#333",
    },
    sectionTitle: {
        marginBottom: 24,
        color: "#333",
    },
    mainContent: {
        flex: 1,
    },
    contentScrollView: {
        flex: 1,
    },
    quizContainer: {
        flex: 1,
    },
    recapBadge: {
        backgroundColor: "#00D4AA",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
        marginBottom: 8,
    },
    recapText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    quizInstruction: {
        fontSize: 16,
        color: "#666",
        marginBottom: 24,
    },
    quizQuestion: {
        lineHeight: 28,
        marginBottom: 32,
        color: "#333",
    },
    optionsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    optionButton: {
        backgroundColor: "#E5E7EB",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "transparent",
    },
    optionButtonSelected: {
        backgroundColor: "#E0E7FF",
        borderColor: "#6C5CE7",
    },
    optionButtonCorrect: {
        backgroundColor: "#D1FAE5",
        borderColor: "#10B981",
    },
    optionButtonIncorrect: {
        backgroundColor: "#FEE2E2",
        borderColor: "#EF4444",
    },
    optionText: {
        fontSize: 14,
        color: "#374151",
        fontWeight: "500",
    },
    optionTextSelected: {
        color: "#6C5CE7",
    },
    optionTextCorrect: {
        color: "#10B981",
    },
    optionTextIncorrect: {
        color: "#EF4444",
    },
    navigation: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 16,
    },
    navButton: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    backButton: {
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    continueButton: {
        backgroundColor: "#6C5CE7",
        paddingHorizontal: 24,
        flexDirection: "row",
        flex: 1,
        marginLeft: 8,
    },
    navButtonDisabled: {
        opacity: 0.5,
    },
    continueButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginRight: 8,
    },
    continueButtonTextDisabled: {
        color: "#ccc",
    },
    checkIcon: {
        marginLeft: 4,
    },
    arrowIcon: {
        marginLeft: 4,
    },
    scoreSummary: {
        marginTop: 32,
        padding: 16,
        backgroundColor: "#F9FAFB",
        borderRadius: 8,
        alignItems: "center",
    },
    scoreText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    passText: {
        fontSize: 16,
        color: "#10B981",
        fontWeight: "500",
    },
    failText: {
        fontSize: 16,
        color: "#EF4444",
        fontWeight: "500",
    },
});

// Styles pour le markdown
const markdownStyles = StyleSheet.create({
    body: {
        fontSize: 16,
        lineHeight: 24,
        color: "#333",
        fontFamily: "DMSans_400Regular",
    },
    heading1: {
        fontSize: 24,
        fontWeight: "bold" as const,
        color: "#333",
        marginBottom: 16,
        fontFamily: "DMSans_700Bold",
    },
    heading2: {
        fontSize: 20,
        fontWeight: "bold" as const,
        color: "#333",
        marginBottom: 12,
        fontFamily: "DMSans_700Bold",
    },
    heading3: {
        fontSize: 18,
        fontWeight: "600" as const,
        color: "#333",
        marginBottom: 8,
        fontFamily: "DMSans_600SemiBold",
    },
    paragraph: {
        marginBottom: 16,
        lineHeight: 24,
    },
    strong: {
        fontWeight: "bold" as const,
        fontFamily: "DMSans_700Bold",
    },
    em: {
        fontStyle: "italic" as const,
    },
    list_item: {
        marginBottom: 8,
    },
    bullet_list: {
        marginBottom: 16,
    },
    ordered_list: {
        marginBottom: 16,
    },
    code_inline: {
        backgroundColor: "#f3f4f6",
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 14,
    },
    code_block: {
        backgroundColor: "#f3f4f6",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        fontSize: 14,
    },
    blockquote: {
        backgroundColor: "#f8f9fa",
        borderLeftWidth: 4,
        borderLeftColor: "#6C5CE7",
        paddingLeft: 16,
        paddingVertical: 12,
        marginBottom: 16,
        fontStyle: "italic" as const,
    },
});
