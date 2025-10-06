import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	SafeAreaView,
	ActivityIndicator,
	TouchableOpacity,
	RefreshControl,
	Dimensions,
	Image,
} from "react-native";
import { router } from "expo-router";
import { UserStorage } from "@/utils/storage";
import { SubAccount } from "@/types/Account";
import { chapterService } from "@/services/chapterService";
import { Chapter } from "@/types/Chapter";
import { logger } from "@/utils/logger";
import { typography } from "@/styles/typography";

const { width } = Dimensions.get("window");
const cardWidth = (width - 60) / 2;

const AGE_FILTERS = [
	{ id: "6-10", label: "6 à 10 ans", color: "#FF6B6B" },
	{ id: "10-14", label: "10 à 14 ans", color: "#4ECDC4" },
	{ id: "bases", label: "Les bases", color: "#45B7D1" },
];

// Images des cours
const COURSE_IMAGES = [
	require("@/assets/images/cours/course-1.png"),
	require("@/assets/images/cours/course-2.png"),
	require("@/assets/images/cours/course-3.png"),
	require("@/assets/images/cours/course-4.png"),
	require("@/assets/images/cours/course-5.png"),
	require("@/assets/images/cours/course-6.png"),
];

export default function Courses() {
	const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
	const [chapters, setChapters] = useState<Chapter[]>([]);
	const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
	const [selectedFilter, setSelectedFilter] = useState<string>("all");
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		loadData();
	}, []);

	useEffect(() => {
		filterChapters();
	}, [chapters, selectedFilter]);

	const loadData = async () => {
		try {
			const accountData = await UserStorage.getSubAccount();
			setSubAccount(accountData);

			if (accountData) {
				const chaptersData = await chapterService.getChaptersByRole(accountData.role);
                logger.log("Chapters loaded:", chaptersData);
				setChapters(chaptersData);
			}
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

	const filterChapters = () => {
		if (selectedFilter === "all") {
			setFilteredChapters(chapters);
		} else {
			setFilteredChapters(chapters);
		}
	};

	const handleFilterPress = (filterId: string) => {
		setSelectedFilter(filterId);
	};

	const renderChapterCard = (chapter: Chapter, index: number) => {
		const courseImage = COURSE_IMAGES[index % COURSE_IMAGES.length];

		return (
			<TouchableOpacity
				key={chapter.id}
				style={[styles.chapterCard, { width: cardWidth }]}
				onPress={() => {
					router.push(`/(app)/courses/${chapter.id}?imgIndex=${index}`);
				}}
			>
				<View style={styles.test}>
					<View style={styles.chapterImageContainer}>
						<Image source={courseImage} style={styles.chapterImage} resizeMode="cover" />
					</View>
				</View>
				<View style={styles.chapterInfo}>
					<Text style={styles.chapterTitle} numberOfLines={2}>
						{chapter.title}
					</Text>
					<Text style={styles.chapterLevel}>Niveau {chapter.level}</Text>
				</View>
			</TouchableOpacity>
		);
	};

	if (loading) {
		return (
			<View style={[styles.container, styles.center]}>
				<ActivityIndicator size="large" color="#6C5CE7" />
				<Text style={styles.loadingText}>Chargement des cours...</Text>
			</View>
		);
	}

	const isChildAccount = subAccount?.role === "CHILD";

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView
				style={styles.content}
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C5CE7" />}
			>
				{/* Header */}
				<View style={styles.header}>
					<Text style={[styles.title, typography.heading]}>Mes cours</Text>
					<Text style={[styles.subtitle, typography.body]}>
						{isChildAccount
							? "Apprendre l'argent en s'amusant"
							: "Comprendre l'argent pour mieux l'expliquer"}
					</Text>
				</View>

				{/* Age Filters */}
				{/* <View style={styles.filtersContainer}>
					<TouchableOpacity
						style={[
							styles.filterChip,
							selectedFilter === "all" && styles.filterChipSelected,
							{ backgroundColor: selectedFilter === "all" ? "#6C5CE7" : "#f0f0f0" },
						]}
						onPress={() => handleFilterPress("all")}
					>
						<Text style={[styles.filterText, selectedFilter === "all" && styles.filterTextSelected]}>
							Tous
						</Text>
					</TouchableOpacity>

					{AGE_FILTERS.map((filter) => (
						<TouchableOpacity
							key={filter.id}
							style={[
								styles.filterChip,
								selectedFilter === filter.id && styles.filterChipSelected,
								{ backgroundColor: selectedFilter === filter.id ? filter.color : "#f0f0f0" },
							]}
							onPress={() => handleFilterPress(filter.id)}
						>
							<Text
								style={[styles.filterText, selectedFilter === filter.id && styles.filterTextSelected]}
							>
								{filter.label}
							</Text>
						</TouchableOpacity>
					))}
				</View> */}

				{/* Chapters Grid */}
				<View style={styles.chaptersContainer}>
					{filteredChapters.length > 0 ? (
						<View style={styles.chaptersGrid}>
							{filteredChapters.map((chapter, index) => renderChapterCard(chapter, index))}
						</View>
					) : (
						<View style={styles.emptyContainer}>
							<Text style={styles.emptyIcon}>📚</Text>
							<Text style={styles.emptyTitle}>Aucun chapitre disponible</Text>
							<Text style={styles.emptyText}>
								Les chapitres seront bientôt disponibles pour votre niveau.
							</Text>
						</View>
					)}
				</View>

				<View style={styles.bottomPadding} />
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f9fa",
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
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
	header: {
		paddingTop: 20,
		paddingBottom: 24,
	},
	title: {
		marginBottom: 8,
		textAlign: "center",
	},
	subtitle: {
		textAlign: "center",
	},
	filtersContainer: {
		flexDirection: "row",
		gap: 8,
        backgroundColor: "#EBF2FB",
		marginBottom: 24,
		flexWrap: "wrap",
	},
	filterChip: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		backgroundColor: "#f0f0f0",
	},
	filterChipSelected: {
		backgroundColor: "#6C5CE7",
	},
	filterText: {
		fontSize: 14,
		fontWeight: "500",
		color: "#666",
	},
	filterTextSelected: {
		color: "#fff",
	},
	chaptersContainer: {
		marginBottom: 20,
	},
	chaptersGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		gap: 12,
	},
	chapterCard: {
		marginBottom: 24,
	},
	test: {
		shadowColor: "#BFD0EA",
		shadowOffset: {
			width: 0,
			height: 3.89,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
	},
	chapterImageContainer: {
		height: 130,
		borderRadius: 8,
		marginBottom: 12,
		overflow: "hidden",
	},
	chapterImage: {
		width: "100%",
		height: "100%",
	},
	chapterInfo: {
		gap: 4,
	},
	chapterTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		lineHeight: 20,
	},
	chapterLevel: {
		fontSize: 12,
		color: "#666",
		fontWeight: "500",
	},
	emptyContainer: {
		alignItems: "center",
		paddingVertical: 60,
		paddingHorizontal: 40,
	},
	emptyIcon: {
		fontSize: 48,
		marginBottom: 16,
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 8,
		textAlign: "center",
	},
	emptyText: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		lineHeight: 22,
	},
	bottomPadding: {
		height: 20,
	},
});
