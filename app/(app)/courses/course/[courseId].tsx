import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";
import { Course, Section, Quiz, QuizType } from "@/types/Chapter";
import { typography } from "@/styles/typography";
import { courseService } from "@/services/courseService";
import { logger } from "@/utils/logger";
import { progressService } from "@/services/progressService";
import { SubAccount } from "@/types/Account";
import { UserStorage } from "@/utils/storage";
import GuessCashFromValue from "@/components/GuessCashFromValue";
import SuccessComponent from "@/components/SuccessComponent";

interface CourseStep {
    type: "section" | "quiz";
    sectionIndex: number;
    section: Section;
    quizIndex?: number;
}

export default function CourseReader() {
    const params = useLocalSearchParams();
    const courseId = params.courseId as string;
    
    const [subAccount, setSubAccount] = useState<SubAccount | null>(null)
    const [courseData, setCourseData] = useState<Course | null>(null)

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [loading, setLoading] = useState(true);
    const [quizScore, setQuizScore] = useState(0);
    const [totalQuizQuestions, setTotalQuizQuestions] = useState(0);
    const [quizResponse, setQuizReponse] = useState<string>("");
    const [moneyCounts, setMoneyCounts] = useState<Record<string, number>>({})
    const [showLastStep, setShowLastStep] = useState<boolean>(false)

    const steps: CourseStep[] = [];

    useEffect(() => {
        loadCourse();
    }, []);

    const loadCourse = async () => {
        try {
            const course = await courseService.getCourseById(courseId);
            logger.log("Loaded course data:", course);
            setCourseData(course);
            setSubAccount(await UserStorage.getSubAccount())
        } catch (error) {
            logger.error("Error loading chapter:", error);
            Alert.alert("Erreur", "Impossible de charger le chapitre", [{ text: "Retour", onPress: () => router.back() }]);
        } finally {
            setLoading(false);
        }
    };

    courseData?.sections.forEach((section, index) => {
        steps.push({
            type: "section",
            sectionIndex: index,
            section,
        });

        if (section && section?.quiz && section?.quiz.length > 0) {
            section?.quiz.forEach((_, quizIndex) => {
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

    const isChild = subAccount?.role === "CHILD"

    const handlePrevious = () => {
        if (!isFirstStep) {
            setCurrentStepIndex(currentStepIndex - 1);
            resetQuizState();
        }
    };

    const handleNext = async () => {
        if (currentStep.type === "section" && !currentStep.section?.completed && currentStep.section?.quiz?.length === 0) {
            currentStep.section.completed = await progressService.validateSection(currentStep.section.id);
        }
  
        if (showResult && !isCorrect) return resetQuizState();

        if (!isLastStep) {
            setCurrentStepIndex(currentStepIndex + 1);
            resetQuizState();
        } else {
            if (!courseData?.completed) 
                currentStep.section.completed = await progressService.validateSection(currentStep.section.id);
            
            setShowLastStep(true)
        }
    };

    useEffect(() => {
        if (currentStep?.type === "quiz" && currentStep?.quizIndex === 0) {
            setQuizScore(0);
            setTotalQuizQuestions(currentStep?.section?.quiz?.length || 0);
        }
    }, [currentStepIndex]);

    const resetQuizState = () => {
        setSelectedAnswer(null);
        setShowResult(false);
        setIsCorrect(false);
    };

    const handleAnswerSelect = (answerIndex: number) => {
        if (!showResult) {
            setSelectedAnswer(answerIndex);
        }
    };

    const handleVerifyAnswer = () => {
        if (selectedAnswer === null || !currentStep?.section?.quiz || currentStep?.quizIndex === undefined) return;

        const currentQuiz = currentStep?.section?.quiz[currentStep?.quizIndex];
        const correct = selectedAnswer === currentQuiz.correctAnswerIndex;

        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            setQuizScore(quizScore + 1);
            setMoneyCounts({})
        }
    };

    const renderSectionContent = () => (
        <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
            <Markdown style={markdownStyles}>{currentStep?.section?.markdownContent}</Markdown>
        </ScrollView>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#6C5CE7" />
                <Text style={styles.loadingText}>Chargement du cours...</Text>
            </View>
        );
    }

    if (showLastStep)
        return (
            <SafeAreaView style={styles.container}>
                <SuccessComponent 
                    title="Bien joué !" 
                    subTitle="Tu sais reconnaître et compter des montants simples." 
                    image={require("@/assets/images/complete_course.png")} 
                    onClose={() => router.back()} 
                    showHeader
                />
            </SafeAreaView>
        )

    const renderQuiz = () => {
        if (!currentStep?.section?.quiz || currentStep?.quizIndex === undefined) return null;
        
        const quiz = currentStep?.section?.quiz[currentStep?.quizIndex]
        const isLastQuizQuestion = currentStep?.quizIndex === currentStep?.section?.quiz.length - 1;

        const total = Object.entries(moneyCounts).reduce((acc, [money, count]) => {
            return acc + (Number(money) * count)
        }, 0)

        const incrementMoney = (money: string) => {
            handleAnswerSelect((total / 100)?.toString() === quiz.options[0] ? 1 : 0)
            setMoneyCounts(prev => ({
                ...prev,
                [money]: (prev[money] || 0) + 1
            }))
        }
        
        const decrementMoney = (money: string) => {
            handleAnswerSelect(total?.toString() === quiz.options[0] ? 0 : 1)
            setMoneyCounts(prev => ({
                ...prev,
                [money]: Math.max((prev[money] || 0) - 1, 0)
            }))
        }

        return (
            <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.quizContainer}>
                    {/* Badge Récap */}
                    <View style={styles.recapBadge}>
                        <Text style={styles.recapText}>
                            Récap - Question {currentStep?.quizIndex + 1}/{currentStep?.section?.quiz.length}
                        </Text>
                    </View>

                    <Text style={styles.quizInstruction}>Complétez la phrase</Text>

                    {/* Question */}
                    {isChild
                        ?   <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: 32}}>
                                <Image
                                    source={require('@/assets/lil_mascot_head.png')}
                                />
                                <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                <View
                                    style={{
                                        width: 0,
                                        height: 0,
                                        borderTopWidth: 10,
                                        borderTopColor: "transparent",
                                        borderBottomWidth: 10,
                                        borderBottomColor: "transparent",
                                        borderRightWidth: 10,
                                        borderRightColor: "#FFFFFF",
                                        marginRight: -1,
                                    }}
                                />
                                    <View style={{backgroundColor: "#FFFFFF", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, minWidth: "70%", justifyContent: "center"}}>
                                        <Text style={[{lineHeight: 28, color: "#2F2F2F"}, typography.body]}>{quiz.question}</Text>
                                    </View>
                                </View>
                            </View>
                        : <Text style={[styles.quizQuestion, typography.body]}>{quiz.question}</Text>
                    }

                    {/* Options */}
                    <View style={styles.optionsContainer}>
                        {quiz.options.map((option, index) => {
                            if (!isChild) 
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.optionButton,
                                            selectedAnswer === index && styles.optionButtonSelected,
                                            showResult && selectedAnswer === index && (isCorrect ? styles.optionButtonCorrect : styles.optionButtonIncorrect),
                                        ]}
                                        onPress={() => {handleAnswerSelect(index), setQuizReponse(quiz.response || "")}}
                                        disabled={showResult}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                selectedAnswer === index && styles.optionTextSelected,
                                                showResult && selectedAnswer === index && (isCorrect ? styles.optionTextCorrect : styles.optionTextIncorrect),
                                            ]}
                                        >
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            
                            switch (quiz.quizType) {
                                case QuizType.CALCULATE:
                                    return quiz.moneyValues?.map((money, idx) => (
                                        <View key={idx + money} style={{width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                                            <GuessCashFromValue value={money} />
                                            <View style={{display: "flex", flexDirection: "row", gap: 12, alignItems: "center"}}>
                                                <TouchableOpacity
                                                    disabled={showResult}
                                                    onPress={() => decrementMoney(money)}
                                                    style={[styles.quizOptionButton, {borderColor: "#E0ECFF", shadowColor: "#BFD0EA", backgroundColor: "#FFFFFF", paddingVertical: 12, paddingHorizontal: 8}]}
                                                >
                                                    <Ionicons name="remove" size={24} color={"#2F2F2F"} />
                                                </TouchableOpacity>
                                                <View style={{backgroundColor: "#BFD0EA", paddingVertical: 8, paddingHorizontal: 18, borderRadius: 4, borderWidth: 3, borderColor: "#BFD0EA"}}>
                                                    <Text style={{color: "#2F2F2F", fontSize: 26, fontWeight: 800}}>{moneyCounts[money] || 0}</Text>
                                                </View>
                                                <TouchableOpacity
                                                    disabled={showResult}
                                                    onPress={() => incrementMoney(money)}
                                                    style={[styles.quizOptionButton, {borderColor: "#E0ECFF", shadowColor: "#BFD0EA", backgroundColor: "#FFFFFF", paddingVertical: 12, paddingHorizontal: 8}]}
                                                >
                                                    <Ionicons name="add" size={24} color={"#2F2F2F"} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))
                                case QuizType.IMAGES:
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => {
                                                handleAnswerSelect(index);
                                                setQuizReponse(quiz.response || "");
                                            }}
                                            disabled={showResult}
                                            style={[
                                                styles.quizOptionButton, {width: "47%", marginBottom: 12},
                                                showResult ? selectedAnswer === index ? isCorrect
                                                    ? { backgroundColor: "#C4FFEA", borderColor: "#16AA75", shadowColor: "#005C49"}
                                                    : { backgroundColor: "#FFD9E3", borderColor: "#FD618C", shadowColor: "#D1325E"}
                                                    : { backgroundColor: "#FFFFFF", borderColor: "#E0ECFF", shadowColor: "#BFD0EA"}
                                                    : selectedAnswer === index
                                                        ? { backgroundColor: "#E0ECFF", borderColor: "#75B7FF", shadowColor: "#52A5FF"}
                                                        : { backgroundColor: "#FFFFFF", borderColor: "#E0ECFF",shadowColor: "#BFD0EA"},
                                            ]}
                                        >
                                            <Image 
                                                source={{uri: `https://pub-ce5bc62138bd4218b56745b7ccca587e.r2.dev/${option}`}} 
                                                style={{width: "100%",  aspectRatio: 1, borderRadius: 9, padding: 12}}
                                                resizeMode="cover"
                                            />
                                        </TouchableOpacity>
                                    )
                                default:
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => {
                                                handleAnswerSelect(index);
                                                setQuizReponse(quiz.response || "");
                                            }}
                                            disabled={showResult}
                                            style={[
                                                styles.quizOptionButton, {width: "100%", marginBottom: 12},
                                                showResult ? selectedAnswer === index ? isCorrect
                                                    ? { backgroundColor: "#C4FFEA", borderColor: "#16AA75", shadowColor: "#005C49"}
                                                    : { backgroundColor: "#FFD9E3", borderColor: "#FD618C", shadowColor: "#D1325E"}
                                                    : { backgroundColor: "#FFFFFF", borderColor: "#E0ECFF", shadowColor: "#BFD0EA"}
                                                    : selectedAnswer === index
                                                        ? { backgroundColor: "#E0ECFF", borderColor: "#75B7FF", shadowColor: "#52A5FF"}
                                                        : { backgroundColor: "#FFFFFF", borderColor: "#E0ECFF",shadowColor: "#BFD0EA"},
                                            ]}
                                        >
                                            <Text 
                                                style={{fontWeight: 700, fontSize: 24, color: "#2F2F2F", paddingHorizontal: 12, paddingVertical: 8, textAlign: "center"}}
                                            >
                                                {option}
                                            </Text>
                                        </TouchableOpacity>
                                    ) 
                            }
                        })}
                    </View>
                </View>
            </ScrollView>
        );
    };

    const getButtonText = () => {
        if (currentStep?.type === "quiz") {
            if (!showResult) {
                return "Vérifier ma réponse";
            } else if (showResult && !isCorrect) {
                return "Réessayer";
            } else {
                return isLastStep ? "Terminer" : "Continuer";
            }
        } else {
            return isLastStep ? "Terminer" : "Continuer";
        }
    };

    const handleButtonPress = () => {
        if (currentStep?.type === "quiz" && !showResult) {
            handleVerifyAnswer();
        } else {
            handleNext();
        }
    };

    const isButtonDisabled = () => {
        return currentStep?.type === "quiz" && !showResult && selectedAnswer === null;
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
                    {currentStep?.sectionIndex + 1}. {currentStep?.section?.title}
                </Text>

                {/* Main content */}
                <View style={styles.mainContent}>{currentStep?.type === "section" ? renderSectionContent() : renderQuiz()}</View>
            </View>

            {/* Navigation */}
            <View style={{backgroundColor: "#fff"}}>
                {showResult && 
                    <View style={styles.sectionAnswer}>
                        <View style={{width: "100%", height: 3, backgroundColor: isCorrect ? "#16AA75" : "#F7543E",}}></View>
                        <View style={{paddingHorizontal: 20}}>
                            <Text style={styles.rightAnswer}>
                                {isCorrect ? "Bonne réponse !" : "Mauvaise réponse, réessayez !"}
                            </Text>
                            {isCorrect && quizResponse && <Text>{quizResponse}</Text>}  
                        </View>
                    </View>
                }
                <View style={styles.navigation}>
                    <TouchableOpacity
                        style={[styles.navButton, styles.backButton, isFirstStep && styles.navButtonDisabled]}
                        onPress={handlePrevious}
                        disabled={isFirstStep}
                    >
                        <Ionicons name="arrow-back" size={20} color={isFirstStep ? "#ccc" : "#666"} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={
                            [   styles.navButton, 
                                styles.continueButton, 
                                isChild ? styles.continueButtonChild : {backgroundColor: "#6C5CE7",},
                                isButtonDisabled() && styles.navButtonDisabled
                            ]}
                        onPress={handleButtonPress}
                        disabled={isButtonDisabled()}
                    >
                        <Text style={[styles.continueButtonText, isButtonDisabled() && styles.continueButtonTextDisabled]}>{getButtonText()}</Text>
                        {currentStep?.type === "quiz" && !showResult && isCorrect && <Ionicons name="checkmark" size={16} color="#fff" style={styles.checkIcon} />}
                        {currentStep?.type === "quiz" && showResult && !isCorrect && <Ionicons name="reload-outline" size={16} color="#fff" style={styles.checkIcon} />}
                        {(currentStep?.type === "section" || (showResult && isCorrect)) && !isLastStep && (
                            <Ionicons name="arrow-forward" size={16} color="#fff" style={styles.arrowIcon} />
                        )}
                    </TouchableOpacity>
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
    // Header
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
        justifyContent: "space-between",
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
    sectionAnswer: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    rightAnswer: {
        fontSize: 20,
        color: "#374151",
        fontWeight: "700",
        marginBlock: 12
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
    continueButtonChild: {
        backgroundColor: "#16AA75",
        shadowColor: "#005C49",
		shadowOffset: {
			width: 0,
			height: 3.89,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
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
    // Quiz
    quizOptionButton: {
        borderWidth: 3,
        borderRadius: 8,
        shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.6,
		shadowRadius: 0,
		elevation: 2,
    }
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
