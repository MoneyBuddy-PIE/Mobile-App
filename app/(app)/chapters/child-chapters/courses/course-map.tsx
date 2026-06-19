import { chapterService } from "@/services/chapterService";
import { SubAccount } from "@/types/Account";
import { ChapterWithProgress, CourseWithoutSectionsWithProgress } from "@/types/Chapter";
import { UserStorage } from "@/utils/storage";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Dimensions, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { logger } from "@/utils/logger";
import { colors } from "@/styles/colors";
import { typography } from "@/styles/typography";
import { CoinIcon } from "@/components/Icons/CoinIcon";
import { LightningIcon } from "@/components/Icons/LightningIcon";
import { DiaryBookmarksIcon } from "@/components/Icons/DiaryBookmarksIcon";
import { StarOctogramIcon } from "@/components/Icons/StarOctogramIcon";
import { spacing } from "@/styles";

const { width: SCREEN_W } = Dimensions.get("window");
const NODE_SIZE = 72;
const NODE_SPACING = 96;
const ZIGZAG = [0.5, 0.32, 0.5, 0.68, 0.5, 0.32, 0.5, 0.68];

const getNodeLeft = (index: number) => {
    const ratio = ZIGZAG[index % ZIGZAG.length];
    return ratio * (SCREEN_W - NODE_SIZE);
};

const childCoursesByChapterList = () => {
    const params = useLocalSearchParams<{ chapterId: string; chapterIndex: string; category: string }>();

    const [loading, setLoading] = useState(true);
    const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
    const [courses, setCourses] = useState<CourseWithoutSectionsWithProgress[]>([]);
    const [chapter, setChapter] = useState<ChapterWithProgress | undefined>();
    const [selected, setSelected] = useState<CourseWithoutSectionsWithProgress | null>(null);

    const popupAnim = useRef(new Animated.Value(200)).current;

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, []),
    );

    const loadData = async () => {
        try {
            setLoading(true);
            const [sub, coursesData, chapterData] = await Promise.all([
                UserStorage.getSubAccount(),
                chapterService.getChapterCourses(params.chapterId),
                chapterService.getChapterById(params.chapterId),
            ]);
            setSubAccount(sub);
            setCourses(coursesData.sort((a, b) => a.order - b.order));
            logger.log("Courses =>", coursesData);
            setChapter(chapterData);
        } catch (e) {
            console.error("Error loading courses:", e);
        } finally {
            setLoading(false);
        }
    };

    const openPopup = (course: CourseWithoutSectionsWithProgress) => {
        if (course.locked) return;
        setSelected(course);
        Animated.spring(popupAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 12,
            tension: 100,
        }).start();
    };

    const closePopup = () => {
        Animated.timing(popupAnim, {
            toValue: 200,
            duration: 200,
            useNativeDriver: true,
        }).start(() => setSelected(null));
    };

    const handleStart = () => {
        if (!selected) return;
        closePopup();
        router.push({
            pathname: "/(app)/chapters/courses/[courseId]",
            params: { courseId: selected.id, childMode: "true" },
        });
    };

    const currentIndex = courses.findIndex((c) => !c.completed);
    const totalH = courses.length * NODE_SPACING + NODE_SIZE + 40;

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={colors.jadegreen[100]} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Topbar: coins + progression */}
            <View style={styles.topbar}>
                <View style={styles.pill}>
                    <CoinIcon width={24} height={24} />
                    <Text style={[typography.bold, typography.xl, styles.pillText]}>{subAccount?.coin ?? 0}</Text>
                </View>
                <View style={styles.pill}>
                    <LightningIcon width={24} height={24} color="#FFD700" />
                    <Text style={[typography.bold, typography.xl, styles.pillText]}>
                        {chapter?.completedCoursesCount ?? 0}/{chapter?.totalCoursesCount ?? 0}
                    </Text>
                </View>
            </View>

            {/* Chapter banner */}
            <View style={styles.chapterBanner}>
                <TouchableOpacity
                    style={styles.bannerTextBlock}
                    onPress={() => router.push({ pathname: "chapters/child-chapters/chapter-list", params: { category: params.category } })}
                    activeOpacity={0.85}
                >
                    <Text style={[typography.bold, typography.md, styles.bannerLevel]}>NIVEAU {chapter?.level ?? params.chapterIndex ?? ""}</Text>
                    <Text style={[typography.bold, typography.xl, styles.bannerTitle]} numberOfLines={1}>
                        {chapter?.title}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.bannerDivider}
                    onPress={() => router.navigate("/(app)/chapters/child-categories")}
                    activeOpacity={0.85}
                >
                    <DiaryBookmarksIcon width={22} height={22} color={colors.white} />
                </TouchableOpacity>
            </View>

            {/* Zigzag course nodes */}
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={{ height: totalH }}>
                    {courses.map((course, i) => {
                        const left = getNodeLeft(i);
                        const top = i * NODE_SPACING + 20;
                        const isCompleted = course.completed;
                        const isCurrent = i === currentIndex;

                        return (
                            <View key={course.id}>
                                {/* Glow ring for current node */}
                                {isCurrent && (
                                    <View
                                        style={[
                                            styles.nodeRing,
                                            {
                                                left: left - 10,
                                                top: top - 10,
                                            },
                                        ]}
                                    />
                                )}
                                <TouchableOpacity
                                    style={[
                                        styles.node,
                                        {
                                            left,
                                            top,
                                            backgroundColor: isCompleted ? colors.jadegreen[100] : "#D5D5D5",
                                            shadowColor: isCompleted ? "#005C49" : "#737373",
                                            borderColor: isCompleted ? "rgba(255,255,255,0.6)" : "#939393",
                                        },
                                        selected?.id === course.id && styles.nodeSelected,
                                    ]}
                                    onPress={() => openPopup(course)}
                                    activeOpacity={0.8}
                                >
                                    {isCompleted ? (
                                        <Ionicons name="checkmark" size={40} color={colors.white} />
                                    ) : (
                                        <StarOctogramIcon width={40} height={40} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Popup on node tap */}
            {selected && (
                <Pressable style={styles.overlay} onPress={closePopup}>
                    <Animated.View style={[styles.popup, { transform: [{ translateY: popupAnim }] }]}>
                        <Pressable onPress={(e) => e.stopPropagation()}>
                            <Text style={[typography.bold, typography.xl, styles.popupLesson]}>{selected.title}</Text>
                            {selected.description ? (
                                <Text style={[typography.regular, typography.sm, styles.popupDesc]} numberOfLines={2}>
                                    {selected.description}
                                </Text>
                            ) : null}
                            <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
                                <Text style={[typography.bold, typography.md, styles.startBtnText]}>Commencer</Text>
                            </TouchableOpacity>
                        </Pressable>
                    </Animated.View>
                </Pressable>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.screenBackground,
    },
    center: {
        justifyContent: "center",
        alignItems: "center",
    },
    // Topbar
    topbar: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    pill: {
        backgroundColor: colors.white,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderRadius: 8,
    },
    pillText: {
        color: colors.carbon[100],
    },
    // Chapter banner
    chapterBanner: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "stretch",
        marginHorizontal: 24,
        marginBottom: 8,
        backgroundColor: colors.jadegreen[100],
        borderRadius: 8,
        shadowColor: "#005C49",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    bannerTextBlock: {
        flex: 1,
        flexDirection: "column",
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    bannerLevel: {
        color: colors.white,
        opacity: 0.7,
    },
    bannerTitle: {
        color: colors.white,
    },
    bannerDivider: {
        borderLeftWidth: 2,
        borderColor: "#005C49",
        paddingHorizontal: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    // Scroll
    scroll: {
        flex: 1,
    },
    // Nodes
    nodeRing: {
        position: "absolute",
        width: NODE_SIZE + 20,
        height: NODE_SIZE + 20,
        borderRadius: (NODE_SIZE + 20) / 2,
        backgroundColor: "rgba(0,145,116,0.25)",
    },
    node: {
        position: "absolute",
        width: NODE_SIZE,
        height: NODE_SIZE,
        borderRadius: NODE_SIZE / 2,
        borderWidth: 5,
        alignItems: "center",
        justifyContent: "center",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 6,
    },
    nodeSelected: {
        transform: [{ scale: 1.08 }],
    },
    // Popup
    overlay: {
        ...StyleSheet.absoluteFillObject,
        bottom: 40,
        paddingHorizontal: 20,
        justifyContent: "flex-end",
    },
    popup: {
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        gap: 12,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 20,
    },
    popupLesson: {
        color: colors.carbon[100],
        textAlign: "center",
        marginBottom: 4,
    },
    popupDesc: {
        color: colors.carbon[60],
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 4,
    },
    startBtn: {
        backgroundColor: colors.jadegreen[100],
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        shadowColor: "#005C49",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    startBtnText: {
        color: colors.white,
    },
});

export default childCoursesByChapterList;
