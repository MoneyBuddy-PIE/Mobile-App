import { chapterService } from "@/services/chapterService";
import { SubAccount } from "@/types/Account";
import { Chapter, Course } from "@/types/Chapter";
import { UserStorage } from "@/utils/storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { logger } from "@/utils/logger";

const { width: SCREEN_W } = Dimensions.get("window");
const NODE_SIZE = 72;
const NODE_SPACING = 96;
const ZIGZAG = [0.50, 0.32, 0.50, 0.68, 0.50, 0.32, 0.50, 0.68];

const getNodeLeft = (index: number) => {
    const ratio = ZIGZAG[index % ZIGZAG.length];
    return ratio * (SCREEN_W - NODE_SIZE);
};

const childCoursesByChapterList = () => {
    const params = useLocalSearchParams<{ chapterId: string }>();

    const [loading, setLoading] = useState(true);
    const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [chapter, setChapter] = useState<Chapter | undefined>();
    const [selected, setSelected] = useState<Course | null>(null);

    const popupAnim = useRef(new Animated.Value(200)).current;

    useEffect(() => { loadData(); }, []);

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
            logger.log("Courses =>", coursesData)
            setChapter(chapterData);
        } catch (e) {
            console.error("Error loading courses:", e);
        } finally {
            setLoading(false);
        }
    };

    const openPopup = (course: Course) => {
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
            pathname: "/(app)/courses/course/[courseId]",
            params: { courseId: selected.id },
        });
    };

    const totalH = courses.length * NODE_SPACING + NODE_SIZE + 40;

    if (loading) {
		return (
			<View style={[styles.container, styles.center]}>
				<ActivityIndicator size="large" color="#6C5CE7" />
				<Text style={styles.loadingText}>Chargement des cours...</Text>
			</View>
		);
	}

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={18} color="#fff" />
                </TouchableOpacity>
                <View style={styles.coinPill}>
                    <Text style={styles.coinText}>🟡 {subAccount?.coin ?? 0}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.chapterBanner} onPress={() => router.back()} activeOpacity={0.85}>
                <View style={styles.bannerTextBlock}>
                    <Text style={styles.bannerLevel}>NIVEAU {chapter?.level}</Text>
                    <Text style={styles.bannerTitle} numberOfLines={1}>{chapter?.title}</Text>
                </View>
                <View style={styles.bannerDivider}>
                    <Ionicons name="bookmark" size={22} color="#fff" style={{ paddingHorizontal: 12 }} />
                </View>
            </TouchableOpacity>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={{ height: totalH }}>
                    {courses.map((course, i) => {
                        const left = getNodeLeft(i);
                        const top = i * NODE_SPACING + 20;
                        const isCompleted = course.completed;

                        return (
                            <TouchableOpacity
                                key={course.id}
                                style={[
                                    styles.node,
                                    {
                                        left,
                                        top,
                                        backgroundColor: isCompleted ? "#16AA75" : "#D5D5D5",
                                        shadowColor: isCompleted ? "#005C49" : "#737373",
                                        borderColor: isCompleted ? "#FFFFFF99" : "#939393",
                                    },
                                    selected?.id === course.id && styles.nodeSelected,
                                ]}
                                onPress={() => openPopup(course)}
                                activeOpacity={isCompleted ? 1 : 0.8}
                            >
                                {isCompleted 
                                    ? <Ionicons name="checkmark" size={40} color="#FFFFFF" />
                                    : <Ionicons name="flower" size={40} color="#FFFFFF99" />
                                }
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {selected && (
                <Pressable style={styles.overlay} onPress={closePopup}>
                    <Animated.View
                        style={[styles.popup, { transform: [{ translateY: popupAnim }] }]}
                    >
                        <Pressable onPress={(e) => e.stopPropagation()}>
                            <Text style={styles.popupLesson}>
                                {selected.title}
                            </Text>
                            {selected.description ? (
                                <Text style={styles.popupDesc} numberOfLines={2}>
                                    {selected.description}
                                </Text>
                            ) : null}
                            <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
                                <Text style={styles.startBtnText}>Commencer</Text>
                            </TouchableOpacity>
                        </Pressable>
                    </Animated.View>
                </Pressable>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    // Container
    container: {
        flex: 1,
        backgroundColor: "#ECF2FB",
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
        paddingTop: 20,
        paddingBottom: 12,
        paddingHorizontal: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    backButton: {
        backgroundColor: "#2F2F2F",
        borderRadius: 8,
        padding: 12,
    },
    coinPill: {
        backgroundColor: "#FFFFFF",
        padding: 8,
        borderRadius: 8,
    },
    coinText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#2F2F2F",
    },
    chapterBanner: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: 20,
        marginBottom: 8,
        paddingHorizontal: 16,
        backgroundColor: "#16AA75",
        borderRadius: 8,
        shadowColor: "#005C49",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    bannerTextBlock: {
        flexDirection: "column",
        gap: 4,
        paddingVertical: 12,
    },
    bannerLevel: {
        fontSize: 12,
        fontWeight: "700",
        color: "#FFFFFF",
        textTransform: "uppercase",
        opacity: 0.85,
    },
    bannerTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    bannerDivider: {
        borderLeftWidth: 2,
        borderColor: "#005C49",
        height: "100%",
    },
    scroll: {
        flex: 1,
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
    lockedInner: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.35)",
    },
    currentInner: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.6)",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        bottom: 40,
        paddingHorizontal: 20,
        justifyContent: "flex-end",
    },
    popup: {
        backgroundColor: "#fff",
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 36,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 20,
    },
    popupLesson: {
        fontFamily: "DMSans_700Bold",
        fontSize: 22,
        color: "#2F2F2F",
        textAlign: "center",
        marginBottom: 6,
    },
    popupDesc: {
        fontFamily: "DMSans_400Regular",
        fontSize: 14,
        color: "#828282",
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 20,
    },
    startBtn: {
        backgroundColor: "#16AA75",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#005C49",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    startBtnText: {
        fontFamily: "DMSans_600SemiBold",
        fontSize: 16,
        color: "#fff",
    },
});

export default childCoursesByChapterList;
