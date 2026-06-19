import { chapterService } from "@/services/chapterService";
import { typography } from "@/styles/typography";
import { ChapterWithoutCoursesWithProgress, ChapterChildCategory } from "@/types/Chapter";
import { logger } from "@/utils/logger";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from "react-native";

const categoryImages = {
    EVERYDAY_MATH: require("@/assets/images/chapterCategories/everyday_math.png"),
    HISTORY_OF_MONEY: require("@/assets/images/chapterCategories/history_of_money.png"),
    BUDGETING: require("@/assets/images/chapterCategories/budgeting.png"),
    SCAM_OR_NOT: require("@/assets/images/chapterCategories/scam_or_not.png"),
};

export const categorySubtitles = (category: string) => {
    switch (category) {
        case ChapterChildCategory.EVERYDAY_MATH:
            return "Compte, compare les prix et apprends à utiliser l'argent au quotidien.";
        case ChapterChildCategory.BUDGETING:
            return "Apprends à planifier tes dépenses et à économiser intelligemment.";
        case ChapterChildCategory.HISTORY_OF_MONEY:
            return "Découvre comment l'argent est apparu et a évolué à travers les siècles.";
        case ChapterChildCategory.SCAM_OR_NOT:
            return "Apprends à repérer les arnaques et à protéger ton argent.";
        default:
            return "";
    }
};

export const categoryLabels = (category: string) => {
    switch (category) {
        case ChapterChildCategory.EVERYDAY_MATH:
            return "Les maths du quotidien";
        case ChapterChildCategory.BUDGETING:
            return "La budgétisation";
        case ChapterChildCategory.HISTORY_OF_MONEY:
            return "L’histoire de l’argent";
        case ChapterChildCategory.SCAM_OR_NOT:
            return "Arnaque ou pas ?";
        default:
            return "";
    }
};

const ChildCategoryPage = () => {
    const [chapters, setChapters] = useState<ChapterWithoutCoursesWithProgress[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const handleCategoryPress = (cat: string, chaptersLength: number) => {
        if (chaptersLength > 0) return router.push({ pathname: "chapters/child-chapters/chapter-list", params: { category: cat } });
    };

    const loadData = async () => {
        try {
            setChapters((await chapterService.getChapters({ category: "*", size: 100 })).content);
        } catch (e) {
            logger.warn("Error while crawling chapters %s", { e });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

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
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.title, typography.heading]}>Choisis ton parcours !</Text>
                <Text style={[styles.subtitle, typography.body]}>Apprends à gérer l’argent avec des jeux, des défis et des histoires.</Text>
            </View>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Content */}
                <View style={styles.contentContainer}>
                    {Object.keys(ChapterChildCategory).map((cat, index) => {
                        const imageSource = categoryImages[cat as keyof typeof categoryImages];
                        const chaptersOfCategory = chapters?.filter((chap) => (chap.category as string[])?.includes(cat));

                        return (
                            <TouchableOpacity
                                key={index + cat}
                                style={[styles.categoryCard, { opacity: chaptersOfCategory?.length > 0 ? 1 : 0.5 }]}
                                onPress={() => {
                                    handleCategoryPress(cat, chaptersOfCategory?.length);
                                }}
                            >
                                <Image source={imageSource} style={{ width: 147, height: 147 }} resizeMode="cover" />
                                <Text style={styles.categoryTitle}>{categoryLabels(cat)}</Text>
                                <View style={styles.trackWrap}>
                                    <View
                                        style={[
                                            styles.fill,
                                            {
                                                width: `${chaptersOfCategory?.reduce((acc, curr) => acc + (curr.progressPercentage || 0), 0)}%`,
                                                backgroundColor: "#75B7FF",
                                            },
                                        ]}
                                    />
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
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
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderColor: "#BFD0EA",
    },
    title: {
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        textAlign: "center",
    },
    // Content
    contentContainer: {
        minHeight: "100%",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 12,
        width: "100%",
        backgroundColor: "#EBF2FB",
        paddingTop: 20,
        paddingBottom: 24,
        paddingHorizontal: 20,
    },
    // Category Card
    categoryCard: {
        width: "48%",
        padding: 8,
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 12,
        backgroundColor: "#FFFFFF",
        shadowColor: "#BFD0EA",
        shadowOffset: {
            width: 0,
            height: 3.89,
        },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    categoryTitle: {
        fontWeight: 700,
        fontSize: 16,
    },
    // Progress Bar
    trackWrap: {
        height: 8,
        backgroundColor: "#EBF2FB",
        borderRadius: 40,
        overflow: "hidden",
    },
    fill: {
        height: "100%",
        borderRadius: 40,
    },
});

export default ChildCategoryPage;
