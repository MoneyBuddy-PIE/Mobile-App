import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { CourseWithProgress, SectionWithProgress, Quiz } from "@/types/Chapter";
import { typography } from "@/styles/typography";
import { colors } from "@/styles/colors";
import { chapterService } from "@/services/chapterService";
import { logger } from "@/utils/logger";
import { getImageUrl } from "@/utils/image";
import { formatMoney } from "@/utils/money";
import { MascotIcon } from "@/components/Icons/MascotIcon";
import { LightningIcon } from "@/components/Icons/LightningIcon";
import { MoneyBillIcon } from "@/components/Icons/MoneyBillIcon";
import { MoneyCoinIcon } from "@/components/Icons/MoneyCoinIcon";

interface CourseStep {
    type: "section" | "quiz";
    sectionIndex: number;
    section: SectionWithProgress;
    quizIndex?: number;
}

export default function CourseReader() {
    const params = useLocalSearchParams();
    const courseId = params.courseId as string;
    const isChildMode = params.childMode === "true";
    const insets = useSafeAreaInsets();

    const [course, setCourse] = useState<CourseWithProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [courseCompleted, setCourseCompleted] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [totalQuizQuestions, setTotalQuizQuestions] = useState(0);
    const [quantities, setQuantities] = useState<number[]>([]);

    const animDirection = useRef<"forward" | "back">("forward");
    const contentOpacity = useSharedValue(1);
    const contentTranslateX = useSharedValue(0);
    const contentAnimStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ translateX: contentTranslateX.value }],
    }));

    useEffect(() => {
        loadCourse();
    }, [courseId]);

    const loadCourse = async () => {
        try {
            const courseData = await chapterService.getCourse(courseId);
            logger.log("Course loaded:", courseData);
            setCourse(courseData);
        } catch (error) {
            logger.error("Error loading course:", error);
            Alert.alert("Erreur", "Impossible de charger le cours", [{ text: "Retour", onPress: () => router.back() }]);
        } finally {
            setLoading(false);
        }
    };

    const steps: CourseStep[] = useMemo(() => {
        if (!course || !course.sections) return [];
        const result: CourseStep[] = [];
        // L'API retourne sections comme un objet, on le convertit en tableau
        const sectionsArray: SectionWithProgress[] = Array.isArray(course.sections)
            ? course.sections
            : (Object.values(course.sections) as SectionWithProgress[]);
        sectionsArray.forEach((section, index) => {
            const quizArray: Quiz[] = section.quiz ? (Array.isArray(section.quiz) ? section.quiz : (Object.values(section.quiz) as Quiz[])) : [];
            const normalizedSection: SectionWithProgress = { ...section, quiz: quizArray };

            result.push({
                type: "section",
                sectionIndex: index,
                section: normalizedSection,
            });

            if (quizArray.length > 0) {
                quizArray.forEach((_, quizIndex) => {
                    result.push({
                        type: "quiz",
                        sectionIndex: index,
                        section: normalizedSection,
                        quizIndex,
                    });
                });
            }
        });
        return result;
    }, [course]);

    const currentStep = steps[currentStepIndex];
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === steps.length - 1;

    const handlePrevious = () => {
        if (!isFirstStep) {
            const prevStep = steps[currentStepIndex - 1];
            logger.log("Course step back:", { from: currentStepIndex, to: currentStepIndex - 1, step: prevStep });
            animDirection.current = "back";
            setCurrentStepIndex(currentStepIndex - 1);
            resetQuizState();
        }
    };

    const handleNext = async () => {
        if (!isLastStep) {
            const nextStep = steps[currentStepIndex + 1];
            logger.log("Course step forward:", { from: currentStepIndex, to: currentStepIndex + 1, step: nextStep });

            // Section sans quiz → la compléter directement avec score 100
            if (currentStep.type === "section" && (!currentStep.section.quiz || currentStep.section.quiz.length === 0)) {
                try {
                    await chapterService.completeSection(currentStep.section.id, 100);
                } catch (e: any) {
                    if (e?.status !== 409) logger.error("Error completing section:", e);
                }
            }

            animDirection.current = "forward";
            setCurrentStepIndex(currentStepIndex + 1);
            resetQuizState();
        } else {
            if (currentStep.type === "section" && (!currentStep.section.quiz || currentStep.section.quiz.length === 0)) {
                try {
                    await chapterService.completeSection(currentStep.section.id, 100);
                } catch (e: any) {
                    if (e?.status !== 409) logger.error("Error completing section:", e);
                }
            }
            logger.log("Course completed:", { courseId, totalSteps: steps.length });
            try {
                await chapterService.completeCourse(courseId);
            } catch (error: any) {
                if (error?.status !== 409) {
                    logger.error("Error completing course:", error);
                }
            }
            setCourseCompleted(true);
        }
    };

    const resetQuizState = () => {
        setSelectedAnswer(null);
        setShowResult(false);
        setIsCorrect(false);
        setQuantities([]);
    };

    const handleQuantityChange = (index: number, delta: number) => {
        setQuantities((prev) => {
            const next = [...prev];
            next[index] = Math.max(0, (next[index] || 0) + delta);
            return next;
        });
    };

    useEffect(() => {
        if (currentStep?.type === "quiz" && currentStep.quizIndex === 0) {
            setQuizScore(0);
            setTotalQuizQuestions(currentStep.section.quiz?.length || 0);
        }
    }, [currentStepIndex, currentStep]);

    useEffect(() => {
        const offset = animDirection.current === "forward" ? 40 : -40;
        contentOpacity.value = 0;
        contentTranslateX.value = offset;
        contentOpacity.value = withTiming(1, { duration: 250 });
        contentTranslateX.value = withTiming(0, { duration: 250 });
    }, [currentStepIndex]);

    const handleAnswerSelect = (answerIndex: number) => {
        if (!showResult) {
            setSelectedAnswer(answerIndex);
        }
    };

    const handleVerifyAnswer = async () => {
        if (!currentStep.section.quiz || currentStep.quizIndex === undefined) return;

        const currentQuiz = currentStep.section.quiz[currentStep.quizIndex];

        let correct: boolean;
        if (currentQuiz.quizType === "CALCULATE") {
            const total = (currentQuiz.moneyValues ?? []).reduce((sum, val, i) => sum + (parseFloat(val) / 100) * (quantities[i] || 0), 0);
            const target = parseFloat(currentQuiz.options[currentQuiz.correctAnswerIndex]) / 100;
            correct = Math.abs(total - target) < 0.01;
        } else {
            if (selectedAnswer === null) return;
            correct = selectedAnswer === currentQuiz.correctAnswerIndex;
        }

        const newScore = correct ? quizScore + 1 : quizScore;
        const isLastQuiz = currentStep.quizIndex === currentStep.section.quiz.length - 1;

        logger.log("Quiz answer verified:", {
            sectionIndex: currentStep.sectionIndex,
            quizIndex: currentStep.quizIndex,
            selectedAnswer,
            correctAnswer: currentQuiz.correctAnswerIndex,
            isCorrect: correct,
        });

        setIsCorrect(correct);
        setShowResult(true);
        if (correct) setQuizScore(newScore);

        if (isLastQuiz) {
            const scorePercent = Math.round((newScore / currentStep.section.quiz.length) * 100);
            const passed = scorePercent >= currentStep.section.minimumScoreToPass;
            logger.log("Section quiz completed:", { sectionId: currentStep.section.id, score: scorePercent, passed });
            if (passed) {
                try {
                    await chapterService.completeSection(currentStep.section.id, scorePercent);
                } catch (e) {
                    logger.error("Error completing section:", e);
                }
            }
        }
    };

    const renderSectionContent = () => (
        <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
            <Markdown style={markdownStyles}>{currentStep.section.markdownContent}</Markdown>
        </ScrollView>
    );

    const renderQuizOptions = (quiz: Quiz) => {
        if (quiz.quizType === "IMAGES") {
            return (
                <View style={styles.optionsGridContainer}>
                    {quiz.options.map((option, index) => {
                        const uri = getImageUrl(option);
                        const isSelected = selectedAnswer === index;
                        const isCorrectOption = showResult && isCorrect && index === quiz.correctAnswerIndex;
                        const isWrongSelected = showResult && isSelected && !isCorrect;
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.optionImageButton,
                                    isSelected && styles.optionButtonSelected,
                                    isCorrectOption && styles.optionButtonCorrect,
                                    isWrongSelected && styles.optionButtonIncorrect,
                                ]}
                                onPress={() => handleAnswerSelect(index)}
                                disabled={showResult}
                            >
                                <Image source={{ uri: uri ?? undefined }} style={styles.optionImage} resizeMode="cover" />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            );
        }

        if (quiz.quizType === "CALCULATE") {
            return (
                <View>
                    <View style={styles.moneyValuesContainer}>
                        {(quiz.moneyValues ?? []).map((val, i) => (
                            <View key={i} style={styles.moneyValueChip}>
                                <Text style={styles.moneyValueText}>{formatMoney(parseFloat(val) / 100)} €</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.optionsContainer}>
                        {quiz.options.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.optionButton,
                                    selectedAnswer === index && styles.optionButtonSelected,
                                    showResult && selectedAnswer === index && (isCorrect ? styles.optionButtonCorrect : styles.optionButtonIncorrect),
                                    showResult && isCorrect && index === quiz.correctAnswerIndex && styles.optionButtonCorrect,
                                ]}
                                onPress={() => handleAnswerSelect(index)}
                                disabled={showResult}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        selectedAnswer === index && styles.optionTextSelected,
                                        showResult && selectedAnswer === index && (isCorrect ? styles.optionTextCorrect : styles.optionTextIncorrect),
                                        showResult && isCorrect && index === quiz.correctAnswerIndex && styles.optionTextCorrect,
                                    ]}
                                >
                                    {formatMoney(parseFloat(option) / 100)} €
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            );
        }

        // TEXT (default)
        return (
            <View style={styles.optionsContainer}>
                {quiz.options.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.optionButton,
                            selectedAnswer === index && styles.optionButtonSelected,
                            showResult && selectedAnswer === index && (isCorrect ? styles.optionButtonCorrect : styles.optionButtonIncorrect),
                            showResult && isCorrect && index === quiz.correctAnswerIndex && styles.optionButtonCorrect,
                        ]}
                        onPress={() => handleAnswerSelect(index)}
                        disabled={showResult}
                    >
                        <Text
                            style={[
                                styles.optionText,
                                selectedAnswer === index && styles.optionTextSelected,
                                showResult && selectedAnswer === index && (isCorrect ? styles.optionTextCorrect : styles.optionTextIncorrect),
                                showResult && isCorrect && index === quiz.correctAnswerIndex && styles.optionTextCorrect,
                            ]}
                        >
                            {option}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderQuiz = () => {
        if (!currentStep.section.quiz || currentStep.quizIndex === undefined) return null;

        const quiz = currentStep.section.quiz[currentStep.quizIndex];
        const isLastQuizQuestion = currentStep.quizIndex === currentStep.section.quiz.length - 1;

        return (
            <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.quizContainer}>
                    {/* Badge Récap */}
                    <View style={styles.recapBadge}>
                        <Text style={styles.recapText}>
                            Récap - Question {currentStep.quizIndex + 1}/{currentStep.section.quiz.length}
                        </Text>
                    </View>

                    <Text style={styles.quizInstruction}>
                        {quiz.quizType === "CALCULATE"
                            ? "Calcule le résultat"
                            : quiz.quizType === "IMAGES"
                              ? "Choisis l'image correcte"
                              : "Complète la phrase"}
                    </Text>

                    {/* Question */}
                    <Text style={[styles.quizQuestion, typography.body]}>{quiz.question}</Text>

                    {/* Quiz image if present */}
                    {quiz.imageUrl && (
                        <Image source={{ uri: getImageUrl(quiz.imageUrl) ?? undefined }} style={styles.quizImage} resizeMode="contain" />
                    )}

                    {/* Options selon le type */}
                    {renderQuizOptions(quiz)}

                    {/* Score summary */}
                    {isLastQuizQuestion && showResult && isCorrect && (
                        <View style={styles.scoreSummary}>
                            <Text style={styles.scoreText}>
                                Score: {quizScore}/{currentStep.section.quiz.length} (
                                {Math.round((quizScore / currentStep.section.quiz.length) * 100)}%)
                            </Text>
                            {Math.round((quizScore / currentStep.section.quiz.length) * 100) >= currentStep.section.minimumScoreToPass ? (
                                <Text style={styles.passText}>✅ Réussi!</Text>
                            ) : (
                                <Text style={styles.failText}>❌ Score minimum requis: {currentStep.section.minimumScoreToPass}%</Text>
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
        if (currentStep.type !== "quiz" || showResult) return false;
        if (quiz?.quizType === "CALCULATE") return false;
        return selectedAnswer === null;
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#6C5CE7" />
                <Text style={styles.loadingText}>Chargement du cours...</Text>
            </SafeAreaView>
        );
    }

    if (!course || !currentStep) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <Text style={styles.errorText}>Cours non trouvé</Text>
                <TouchableOpacity style={styles.errorBackButton} onPress={() => router.back()}>
                    <Text style={styles.errorBackButtonText}>Retour</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (courseCompleted) {
        return (
            <SafeAreaView style={successStyles.container}>
                <Image source={require("@/assets/images/course_success.png")} style={successStyles.image} resizeMode="contain" />
                <Text style={successStyles.title}>Cours terminé !</Text>
                <Text style={successStyles.subtitle}>Tu as complété ce cours avec succès. Continue comme ça !</Text>
                <TouchableOpacity style={successStyles.btn} onPress={() => router.back()} activeOpacity={0.85}>
                    <Text style={successStyles.btnText}>Retour</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const progressPercent = ((currentStepIndex + 1) / steps.length) * 100;
    const quiz = currentStep.type === "quiz" && currentStep.section.quiz ? currentStep.section.quiz[currentStep.quizIndex!] : null;
    const isLastQuizQuestion = quiz && currentStep.section.quiz ? currentStep.quizIndex === currentStep.section.quiz.length - 1 : false;

    if (isChildMode) {
        return (
            <SafeAreaView style={childStyles.container} edges={["top", "left", "right"]}>
                {/* Header */}
                <View style={childStyles.header}>
                    <TouchableOpacity style={childStyles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={18} color="#fff" />
                    </TouchableOpacity>
                    <View style={childStyles.progressBarBg}>
                        <View style={[childStyles.progressBarFill, { width: `${progressPercent}%` }]} />
                    </View>
                    <View style={childStyles.lightningChip}>
                        <LightningIcon width={24} height={24} color="#FFD700" />
                    </View>
                </View>

                <Animated.ScrollView
                    style={[childStyles.scroll, contentAnimStyle]}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={childStyles.scrollContent}
                >
                    {/* Section title */}
                    <Text style={childStyles.sectionTitle}>
                        {currentStep.sectionIndex + 1}. {currentStep.section.title}
                    </Text>

                    {/* Mascot + speech bubble : quiz only */}
                    {currentStep.type === "quiz" && quiz && (
                        <View style={childStyles.mascotRow}>
                            <MascotIcon width={83} height={69} />
                            <View style={childStyles.speechBubble}>
                                <View style={childStyles.speechArrow} />
                                <Text style={childStyles.questionText}>{quiz.question}</Text>
                            </View>
                        </View>
                    )}

                    {/* Section content (markdown) */}
                    {currentStep.type === "section" && (
                        <View style={childStyles.markdownWrapper}>
                            <Markdown style={markdownStyles}>{currentStep.section.markdownContent}</Markdown>
                        </View>
                    )}

                    {/* Quiz image if present */}
                    {quiz?.imageUrl && (
                        <Image source={{ uri: getImageUrl(quiz.imageUrl) ?? undefined }} style={childStyles.quizImage} resizeMode="contain" />
                    )}

                    {/* Quiz options — CALCULATE */}
                    {currentStep.type === "quiz" && quiz && quiz.quizType === "CALCULATE" && (
                        <View style={childStyles.calcContainer}>
                            {(quiz.moneyValues ?? []).map((val, i) => {
                                const euros = parseFloat(val) / 100;
                                const isBill = euros >= 5;
                                return (
                                    <View key={i} style={childStyles.calcRow}>
                                        {isBill ? <MoneyBillIcon amount={formatMoney(euros)} /> : <MoneyCoinIcon amount={formatMoney(euros)} />}
                                        <View style={childStyles.calcControls}>
                                            <TouchableOpacity
                                                style={childStyles.calcBtn}
                                                onPress={() => handleQuantityChange(i, -1)}
                                                disabled={showResult}
                                                activeOpacity={0.85}
                                            >
                                                <Text style={childStyles.calcBtnText}>−</Text>
                                            </TouchableOpacity>
                                            <View style={childStyles.calcCount}>
                                                <Text style={childStyles.calcCountText}>{quantities[i] || 0}</Text>
                                            </View>
                                            <TouchableOpacity
                                                style={childStyles.calcBtn}
                                                onPress={() => handleQuantityChange(i, 1)}
                                                disabled={showResult}
                                                activeOpacity={0.85}
                                            >
                                                <Text style={childStyles.calcBtnText}>+</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* Quiz options — TEXT / IMAGES */}
                    {currentStep.type === "quiz" && quiz && quiz.quizType !== "CALCULATE" && (
                        <View style={quiz.quizType === "IMAGES" ? childStyles.optionsGrid : childStyles.optionsColumn}>
                            {quiz.options.map((option, index) => {
                                const isSelected = selectedAnswer === index;
                                const isCorrectOption = showResult && isCorrect && index === quiz.correctAnswerIndex;
                                const isWrong = showResult && !isCorrect && isSelected;

                                if (quiz.quizType === "IMAGES") {
                                    const cardStyle = isCorrectOption
                                        ? childStyles.optionCardCorrect
                                        : isWrong
                                          ? childStyles.optionCardIncorrect
                                          : isSelected
                                            ? childStyles.optionCardSelected
                                            : childStyles.optionCard;
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={cardStyle}
                                            onPress={() => handleAnswerSelect(index)}
                                            disabled={showResult}
                                            activeOpacity={0.85}
                                        >
                                            <Image
                                                source={{ uri: getImageUrl(option) ?? undefined }}
                                                style={childStyles.optionImage}
                                                resizeMode="contain"
                                            />
                                        </TouchableOpacity>
                                    );
                                }

                                const cardStyle = isCorrectOption
                                    ? childStyles.optionCardFullCorrect
                                    : isWrong
                                      ? childStyles.optionCardFullIncorrect
                                      : isSelected
                                        ? childStyles.optionCardFullSelected
                                        : childStyles.optionCardFull;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={cardStyle}
                                        onPress={() => handleAnswerSelect(index)}
                                        disabled={showResult}
                                        activeOpacity={0.85}
                                    >
                                        <Text
                                            style={[
                                                childStyles.optionTextFull,
                                                isCorrectOption && childStyles.optionTextCorrect,
                                                isWrong && childStyles.optionTextIncorrect,
                                                isSelected && !showResult && childStyles.optionTextSelected,
                                            ]}
                                        >
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}

                    {/* Score summary */}
                    {isLastQuizQuestion && showResult && quiz && currentStep.section.quiz && (
                        <View style={styles.scoreSummary}>
                            <Text style={styles.scoreText}>
                                Score: {quizScore}/{currentStep.section.quiz.length} (
                                {Math.round((quizScore / currentStep.section.quiz.length) * 100)}%)
                            </Text>
                            {Math.round((quizScore / currentStep.section.quiz.length) * 100) >= currentStep.section.minimumScoreToPass ? (
                                <Text style={styles.passText}>✅ Réussi!</Text>
                            ) : (
                                <Text style={styles.failText}>❌ Score minimum requis: {currentStep.section.minimumScoreToPass}%</Text>
                            )}
                        </View>
                    )}
                </Animated.ScrollView>

                {/* Bottom */}
                <View
                    style={[
                        childStyles.bottom,
                        { paddingBottom: 24 + insets.bottom },
                        showResult && currentStep.type === "quiz" && (isCorrect ? childStyles.bottomSuccess : childStyles.bottomError),
                    ]}
                >
                    {showResult && currentStep.type === "quiz" && !isCorrect ? (
                        <>
                            <Text style={childStyles.errorTitle}>Raté, retente !</Text>
                            {quiz?.response && <Text style={childStyles.errorSubtitle}>{quiz.response}</Text>}
                            <TouchableOpacity style={childStyles.retryBtn} onPress={resetQuizState} activeOpacity={0.85}>
                                <Text style={childStyles.verifyBtnText}>Réessayer</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            {showResult && isCorrect && currentStep.type === "quiz" && <Text style={childStyles.successTitle}>Bonne réponse !</Text>}
                            <TouchableOpacity
                                style={[childStyles.verifyBtn, isButtonDisabled() && childStyles.verifyBtnDisabled]}
                                onPress={handleButtonPress}
                                disabled={isButtonDisabled()}
                                activeOpacity={0.85}
                            >
                                <Text style={childStyles.verifyBtnText}>
                                    {currentStep.type === "quiz" && !showResult ? "Vérifier" : isLastStep ? "Terminer" : "Continuer"}
                                </Text>
                                <Ionicons
                                    name={currentStep.type === "quiz" && !showResult ? "checkmark-circle-outline" : "arrow-forward"}
                                    size={24}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
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
            <Animated.View style={[styles.content, contentAnimStyle]}>
                {/* Section title */}
                <Text style={[styles.sectionTitle, typography.subheading]}>
                    {currentStep.sectionIndex + 1}. {currentStep.section.title}
                </Text>

                {/* Main content */}
                <View style={styles.mainContent}>{currentStep.type === "section" ? renderSectionContent() : renderQuiz()}</View>
            </Animated.View>

            {/* Navigation */}
            <View
                style={[
                    styles.navigation,
                    { paddingBottom: 24 + insets.bottom },
                    showResult && currentStep.type === "quiz" && (isCorrect ? styles.navigationSuccess : styles.navigationError),
                ]}
            >
                {showResult && currentStep.type === "quiz" && (
                    <Text style={styles.navResultTitle}>{isCorrect ? "Bonne réponse !" : "Mauvaise réponse, réessayez !"}</Text>
                )}
                <View style={styles.navigationButtons}>
                    <TouchableOpacity
                        style={[styles.navButton, styles.backButton, isFirstStep && styles.navButtonDisabled]}
                        onPress={handlePrevious}
                        disabled={isFirstStep}
                    >
                        <Ionicons name="arrow-back" size={20} color={isFirstStep ? "#ccc" : "#666"} />
                    </TouchableOpacity>

                    {showResult && currentStep.type === "quiz" && !isCorrect ? (
                        <TouchableOpacity style={styles.retryButton} onPress={resetQuizState}>
                            <Text style={styles.retryButtonText}>Réessayer</Text>
                            <Ionicons name="checkmark-circle-outline" size={24} color="#6a6a6a" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.navButton, styles.continueButton, isButtonDisabled() && styles.navButtonDisabled]}
                            onPress={handleButtonPress}
                            disabled={isButtonDisabled()}
                        >
                            <Text style={[styles.continueButtonText, isButtonDisabled() && styles.continueButtonTextDisabled]}>
                                {getButtonText()}
                            </Text>
                            {currentStep.type === "quiz" && !showResult && (
                                <Ionicons name="checkmark" size={16} color="#fff" style={styles.checkIcon} />
                            )}
                            {(currentStep.type === "section" || showResult) && !isLastStep && (
                                <Ionicons name="arrow-forward" size={16} color="#fff" style={styles.arrowIcon} />
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>
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
    errorBackButton: {
        backgroundColor: "#6C5CE7",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    errorBackButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
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
    quizImage: {
        width: "100%",
        height: 180,
        borderRadius: 8,
        marginBottom: 20,
    },
    optionsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    optionsGridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    optionImageButton: {
        width: "47%",
        aspectRatio: 1,
        borderRadius: 8,
        borderWidth: 3,
        borderColor: "transparent",
        overflow: "hidden",
    },
    optionImage: {
        width: "100%",
        height: "100%",
    },
    moneyValuesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 20,
    },
    moneyValueChip: {
        backgroundColor: "#E0E7FF",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#6C5CE7",
    },
    moneyValueText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#6C5CE7",
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
        flexDirection: "column",
        backgroundColor: "#fff",
        borderTopWidth: 2,
        borderTopColor: "#E0ECFF",
        paddingHorizontal: 24,
        paddingTop: 24,
        gap: 16,
    },
    navigationSuccess: {
        borderTopColor: "#16aa75",
    },
    navigationError: {
        borderTopColor: "#f7543e",
    },
    navigationButtons: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    navResultTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#2F2F2F",
    },
    navButton: {
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    backButton: {
        backgroundColor: "#EBF2FB",
        paddingHorizontal: 16,
        borderWidth: 1.5,
        borderColor: "#BFD0EA",
    },
    continueButton: {
        backgroundColor: "#6C5CE7",
        paddingHorizontal: 24,
        flexDirection: "row",
        shadowColor: "#3B2FA0",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    retryButton: {
        backgroundColor: "#D5D5D5",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#6a6a6a",
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

const childStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#EBF2FB",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 16,
        gap: 12,
    },
    backBtn: {
        backgroundColor: "#2F2F2F",
        borderRadius: 8,
        padding: 12,
    },
    progressBarBg: {
        flex: 1,
        height: 12,
        backgroundColor: "#fff",
        borderRadius: 32,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: "#846ded",
        borderRadius: 32,
    },
    lightningChip: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 8,
    },
    scroll: {
        flex: 1,
        backgroundColor: "#EBF2FB",
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#2F2F2F",
        marginBottom: 16,
    },
    mascotRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 16,
        marginBottom: 24,
    },
    speechBubble: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        justifyContent: "center",
    },
    speechArrow: {
        position: "absolute",
        left: -12,
        top: 20,
        width: 0,
        height: 0,
        borderTopWidth: 10,
        borderTopColor: "transparent",
        borderBottomWidth: 10,
        borderBottomColor: "transparent",
        borderRightWidth: 12,
        borderRightColor: "#fff",
    },
    questionText: {
        fontSize: 18,
        color: "#2F2F2F",
        lineHeight: 26,
    },
    markdownWrapper: {
        marginBottom: 16,
    },
    quizImage: {
        width: "100%",
        height: 180,
        borderRadius: 8,
        marginBottom: 16,
    },
    optionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 14,
        justifyContent: "space-between",
    },
    optionsColumn: {
        flexDirection: "column",
        gap: 12,
    },
    optionCardFull: {
        width: "100%",
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#E0ECFF",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#BFD0EA",
        shadowOffset: { width: 0, height: 3.887 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    optionCardFullSelected: {
        width: "100%",
        backgroundColor: "#E0ECFF",
        borderWidth: 3,
        borderColor: "#75B7FF",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#52A5FF",
        shadowOffset: { width: 0, height: 3.887 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    optionCardFullCorrect: {
        width: "100%",
        backgroundColor: "#D1FAE5",
        borderWidth: 3,
        borderColor: "#10B981",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 3.887 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    optionCardFullIncorrect: {
        width: "100%",
        backgroundColor: "#FFD9E3",
        borderWidth: 2,
        borderColor: "#FD618C",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#D1325E",
        shadowOffset: { width: 0, height: 3.887 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    optionTextFull: {
        fontSize: 24,
        fontWeight: "700",
        color: "#2F2F2F",
        textAlign: "center",
    },
    optionCard: {
        width: "47%",
        aspectRatio: 1,
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#E0ECFF",
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#BFD0EA",
        shadowOffset: { width: 0, height: 3.887 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    optionCardSelected: {
        width: "47%",
        aspectRatio: 1,
        backgroundColor: "#E0ECFF",
        borderWidth: 3,
        borderColor: "#75B7FF",
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#52A5FF",
        shadowOffset: { width: 0, height: 3.887 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    optionCardCorrect: {
        width: "47%",
        aspectRatio: 1,
        backgroundColor: "#D1FAE5",
        borderWidth: 3,
        borderColor: "#10B981",
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 3.887 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    optionCardIncorrect: {
        width: "47%",
        aspectRatio: 1,
        backgroundColor: "#FFD9E3",
        borderWidth: 2,
        borderColor: "#FD618C",
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#D1325E",
        shadowOffset: { width: 0, height: 3.887 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    optionImage: {
        width: "100%",
        height: "100%",
        borderRadius: 4,
    },
    optionText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2F2F2F",
        textAlign: "center",
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
    calcContainer: {
        flexDirection: "column",
        gap: 16,
    },
    calcRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    calcControls: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    calcBtn: {
        width: 48,
        height: 48,
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#E0ECFF",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#BFD0EA",
        shadowOffset: { width: 0, height: 3.887 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    calcBtnText: {
        fontSize: 24,
        fontWeight: "700",
        color: "#2F2F2F",
        lineHeight: 28,
    },
    calcCount: {
        width: 66,
        backgroundColor: "#BFD0EA",
        borderRadius: 4,
        paddingVertical: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    calcCountText: {
        fontSize: 26,
        fontWeight: "800",
        color: "#2F2F2F",
        textAlign: "center",
    },
    bottom: {
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#E0ECFF",
        paddingHorizontal: 24,
        paddingTop: 24,
        gap: 12,
    },
    bottomError: {
        borderTopColor: "#FD618C",
    },
    bottomSuccess: {
        borderTopColor: colors.jadegreen[100],
    },
    successTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#2F2F2F",
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#2F2F2F",
    },
    errorSubtitle: {
        fontSize: 16,
        color: "#2F2F2F",
        lineHeight: 22,
    },
    retryBtn: {
        backgroundColor: "#FD618C",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 20,
        borderRadius: 8,
        shadowColor: "#D1325E",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    verifyBtn: {
        backgroundColor: colors.jadegreen[100],
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        paddingVertical: 20,
        borderRadius: 8,
        shadowColor: "#005C49",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    verifyBtnDisabled: {
        opacity: 0.5,
    },
    verifyBtnText: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
    },
});

const successStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#EBF2FB",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
        gap: 20,
    },
    image: {
        width: 200,
        height: 200,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#2F2F2F",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        lineHeight: 24,
    },
    btn: {
        backgroundColor: colors.jadegreen[100],
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: 8,
        shadowColor: "#005C49",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
        marginTop: 8,
    },
    btnText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
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
