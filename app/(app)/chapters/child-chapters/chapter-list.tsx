import { typography } from "@/styles/typography";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ChapterWithoutCoursesWithProgress } from "@/types/Chapter";
import { chapterService } from "@/services/chapterService";
import { logger } from "@/utils/logger";
import { getImageUrl } from "@/utils/image";
import { categoryLabels, categorySubtitles } from "../child-categories";
import Loader from "@/components/Loader";

const childChapterList = () => {
    const params = useLocalSearchParams<{ category: string }>();

    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [chapters, setChapters] = useState<ChapterWithoutCoursesWithProgress[]>([]);

    useEffect(() => {
        loadData();
    }, [params.category]);

    const loadData = async () => {
        try {
            const chaptersData = await chapterService.getChaptersByCategory(params.category);
            logger.log("Courses loaded:", chaptersData);
            setChapters(chaptersData);
        } catch (error) {
            console.error("Error loading chapters:", error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await loadData();
        } finally {
            setRefreshing(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={18} color="#fff" />
                </TouchableOpacity>
                <Text style={[styles.title, typography.heading]}>{categoryLabels(params.category)}</Text>
                <Text style={[styles.subtitle, typography.body]}>{categorySubtitles(params.category)}</Text>
            </View>

            {/* Chapters Grid */}
            <ScrollView
                style={styles.chapterGrid}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C5CE7" />}
            >
                {chapters?.length > 0 &&
                    chapters.map((chapter, index) => <ChapterCard chapter={chapter} index={index} category={params.category} key={chapter.id} />)}
            </ScrollView>
        </SafeAreaView>
    );
};

const ChapterCard = ({ chapter, index, category }: { chapter: ChapterWithoutCoursesWithProgress; index: number; category: string }) => {
    const uri = getImageUrl(chapter.imageUrl);

    return (
        <TouchableOpacity
            style={styles.chapterCard}
            onPress={() => {
                router.push({
                    pathname: "chapters/child-chapters/courses/course-map",
                    params: { chapterId: chapter.id, chapterIndex: index + 1, category },
                });
            }}
        >
            <View style={{ display: "flex", flexDirection: "row", gap: 16, marginBottom: 16 }}>
                <Image source={{ uri: uri ?? undefined }} style={styles.chapterImage} />
                <View style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <Text style={styles.chapterLevel}>NIVEAU {chapter.level ?? index + 1}</Text>
                    <Text style={styles.chapterTitle}>{chapter.title}</Text>
                </View>
            </View>

            {chapter.progressPercentage > 0 ? (
                <View style={styles.trackWrap}>
                    <View style={[styles.fill, { width: `${chapter.progressPercentage}%`, backgroundColor: "#75B7FF" }]} />
                </View>
            ) : (
                <Text style={styles.chapterSubTitle}>ALLER À CE NIVEAU</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    content: {
        flex: 1,
    },
    // Header
    header: {
        paddingTop: 20,
        paddingBottom: 24,
        paddingHorizontal: 20,
        display: "flex",
        flexDirection: "column",
    },
    title: {
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        textAlign: "center",
    },
    backButton: {
        alignSelf: "flex-start",
        backgroundColor: "#2F2F2F",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    // Content
    chapterGrid: {
        paddingBottom: 24,
        paddingHorizontal: 20,
    },
    // Chapter Card
    chapterCard: {
        padding: 16,
        marginBottom: 24,
        borderRadius: 8,
        borderWidth: 2,
        backgroundColor: "#FFFFFF",
        borderColor: "#BFD0EA",
        shadowColor: "#BFD0EA",
        shadowOffset: {
            width: 0,
            height: 3.89,
        },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    chapterImage: {
        width: 120,
        height: 120,
        borderRadius: 9.3,
    },
    chapterFirstHalf: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 16,
    },
    chapterLevel: {
        color: "#979797",
        fontSize: 16,
        fontWeight: 700,
    },
    chapterTitle: {
        color: "#2F2F2F",
        fontSize: 20,
        fontWeight: 700,
        textAlign: "left",
    },
    chapterSubTitle: {
        color: "#52A5FF",
        fontSize: 16,
        fontWeight: 700,
    },
    // Progress Bar
    trackWrap: {
        height: 16,
        backgroundColor: "#EBF2FB",
        borderRadius: 40,
        overflow: "hidden",
    },
    fill: {
        height: "100%",
        borderRadius: 40,
    },
});

export default childChapterList;
