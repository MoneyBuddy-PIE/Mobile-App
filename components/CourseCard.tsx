import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from "react-native";
import { typography, colors, spacing, shadows } from "@/styles";
import { CourseWithoutSectionsWithProgress } from "@/types/Chapter";
import { getImageUrl } from "@/utils/image";

interface CourseCardProps {
    course: CourseWithoutSectionsWithProgress;
    chapterImageUrl?: string | null;
    onPress?: () => void;
    imageSource?: ImageSourcePropType;
}

export default function CourseCard({ course, chapterImageUrl, onPress, imageSource }: CourseCardProps) {
    const progress = course.progressPercentage;
    const resolvedImageUrl = getImageUrl(course.imageUrl ?? chapterImageUrl);

    return (
        <View style={styles.cardContainer}>
            {/* Image */}
            <View style={styles.imageContainer}>
                {imageSource ? (
                    <Image source={imageSource} style={styles.image} resizeMode="cover" />
                ) : resolvedImageUrl ? (
                    <Image source={{ uri: resolvedImageUrl }} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={styles.imagePlaceholder} />
                )}
            </View>

            {/* Course info */}
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{course.title}</Text>
                <Text style={styles.level}>Niveau {course.order}</Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{progress}%</Text>
            </View>

            {/* Button */}
            <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
                <Text style={styles.buttonText}>Reprendre le cours</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: colors.white,
        borderRadius: 8,
        padding: spacing.base,
        gap: spacing.base,
        ...shadows.md,
    },
    imageContainer: {
        width: "100%",
        height: 188,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "#BFD0EA",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    imagePlaceholder: {
        width: "100%",
        height: "100%",
        backgroundColor: "#BFD0EA",
    },
    infoContainer: {
        gap: spacing.xs,
    },
    title: {
        ...typography.bold,
        fontSize: 16,
        lineHeight: 22.4,
        color: colors.carbon[100],
    },
    level: {
        ...typography.regular,
        fontSize: 14,
        color: colors.carbon[100],
    },
    progressContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.base,
    },
    progressBarBackground: {
        flex: 1,
        height: 6,
        backgroundColor: "#D9D9D9",
        borderRadius: 48,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: colors.primary[100],
        borderRadius: 48,
    },
    progressText: {
        ...typography.regular,
        fontSize: 14,
        color: colors.carbon[100],
    },
    button: {
        backgroundColor: colors.primary[100],
        paddingVertical: 12,
        paddingHorizontal: spacing.base,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#4E31CF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    buttonText: {
        ...typography.bold,
        fontSize: 16,
        lineHeight: 22.4,
        color: colors.white,
    },
});
