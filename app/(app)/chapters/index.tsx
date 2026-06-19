import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Dimensions, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { chapterService } from "@/services/chapterService";
import { ChapterParentCategory, ChapterWithoutCoursesWithProgress } from "@/types/Chapter";
import { colors } from "@/styles";
import { getImageUrl } from "@/utils/image";

const { width } = Dimensions.get("window");
const HORIZONTAL_PADDING = 24;
const COLUMN_GAP = 12;
const cardWidth = (width - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;

const FILTERS = [
    { id: "all", label: "Tous" },
    { id: ChapterParentCategory.SIX_TO_TEN, label: "6 à 10 ans" },
    { id: ChapterParentCategory.TEN_TO_FOURTEEN, label: "10 à 14 ans" },
    { id: ChapterParentCategory.BASICS, label: "Les bases" },
];

export default function Courses() {
    const [chapters, setChapters] = useState<ChapterWithoutCoursesWithProgress[]>([]);
    const [filteredChapters, setFilteredChapters] = useState<ChapterWithoutCoursesWithProgress[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<string>("all");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedFilter === "all") {
            setFilteredChapters(chapters);
        } else {
            setFilteredChapters(chapters.filter((c) => (c.category as string[]).includes(selectedFilter)));
        }
    }, [chapters, selectedFilter]);

    const loadData = async () => {
        try {
            const chaptersData = await chapterService.getAllChapters();
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
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={colors.primary[100]} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Mes cours</Text>
                <Text style={styles.subtitle}>Comprendre l'argent pour mieux l'expliquer</Text>
            </View>

            {/* Filters */}
            <View style={styles.filtersWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
                    {FILTERS.map((filter) => (
                        <TouchableOpacity
                            key={filter.id}
                            style={[styles.filterChip, selectedFilter === filter.id && styles.filterChipSelected]}
                            onPress={() => setSelectedFilter(filter.id)}
                        >
                            <Text style={styles.filterLabel}>{filter.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Grid */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[100]} />}
                contentContainerStyle={styles.scrollContent}
            >
                {filteredChapters.length > 0 ? (
                    <View style={styles.grid}>
                        {filteredChapters.map((chapter, index) => (
                            <TouchableOpacity
                                key={chapter.id}
                                style={styles.card}
                                onPress={() =>
                                    router.push({ pathname: "/(app)/chapters/[chapterId]", params: { chapterId: chapter.id, imgIndex: index } })
                                }
                            >
                                <View style={styles.imageWrapper}>
                                    {chapter.imageUrl ? (
                                        <Image source={{ uri: getImageUrl(chapter.imageUrl) ?? undefined }} style={styles.image} resizeMode="cover" />
                                    ) : (
                                        <View style={[styles.image, styles.imagePlaceholder]} />
                                    )}
                                </View>
                                <View style={styles.cardInfo}>
                                    <Text style={styles.cardTitle} numberOfLines={2}>
                                        {chapter.title}
                                    </Text>
                                    <Text style={styles.cardLevel}>Niveau {chapter.level}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>Aucun chapitre disponible</Text>
                        <Text style={styles.emptyText}>Les chapitres seront bientôt disponibles pour votre niveau.</Text>
                    </View>
                )}
                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    center: {
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#BFD0EA",
        gap: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#2F2F2F",
        textAlign: "center",
        lineHeight: 29,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: "400",
        color: "#2F2F2F",
        textAlign: "center",
        lineHeight: 20,
    },
    filtersWrapper: {
        backgroundColor: "#EBF2FB",
        paddingTop: 12,
        paddingBottom: 16,
    },
    filtersContent: {
        paddingHorizontal: 24,
        gap: 8,
        flexDirection: "row",
        alignItems: "center",
    },
    filterChip: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 4,
    },
    filterChipSelected: {
        backgroundColor: "#fff",
        shadowColor: "#BFD0EA",
        shadowOffset: { width: 0, height: 3.887 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 3,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: "700",
        color: "#2F2F2F",
    },
    scrollContent: {
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingTop: 24,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        columnGap: COLUMN_GAP,
        rowGap: 24,
    },
    card: {
        width: cardWidth,
        gap: 12,
    },
    imageWrapper: {
        borderRadius: 8,
        shadowColor: "#BFD0EA",
        shadowOffset: { width: 0, height: 3.887 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    image: {
        width: "100%",
        height: 130,
        borderRadius: 8,
    },
    imagePlaceholder: {
        backgroundColor: "#EBF2FB",
    },
    cardInfo: {
        gap: 4,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#2F2F2F",
        lineHeight: 20,
    },
    cardLevel: {
        fontSize: 14,
        fontWeight: "400",
        color: "#2F2F2F",
    },
    emptyContainer: {
        alignItems: "center",
        paddingVertical: 60,
        paddingHorizontal: 16,
        gap: 8,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#2F2F2F",
        textAlign: "center",
    },
    emptyText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        lineHeight: 22,
    },
    bottomPadding: {
        height: 32,
    },
});
