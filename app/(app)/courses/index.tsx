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
import { Chapter, ChapterParentCategory } from "@/types/Chapter";
import { typography } from "@/styles/typography";
import Card from "@/components/Card";
import { logger } from "@/utils/logger";

const { width } = Dimensions.get("window");
const cardWidth = (width - 60) / 2;

const categoryImages = {
	ALL: require("@/assets/images/chapterCategories/basics.png"),
	BASICS: require("@/assets/images/chapterCategories/basics.png"),
	SIX_TO_TEN: require("@/assets/images/chapterCategories/six_to_ten.png"),
	TEN_TO_FOURTEEN: require("@/assets/images/chapterCategories/ten_to_fourteen.png"),
};

const categoryLabels = (category: string) => {
	switch (category) {
		case ChapterParentCategory.ALL:
			return "Tous";
		case ChapterParentCategory.BASICS:
			return "Les bases";
		case ChapterParentCategory.SIX_TO_TEN:
			return "6 à 10 ans";
		case ChapterParentCategory.TEN_TO_FOURTEEN:
			return "10 à 14 ans";
		default:
			return category;
	}
}

export default function Courses() {
	const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
	const [chapters, setChapters] = useState<Chapter[]>([]);
	const [selectedFilter, setSelectedFilter] = useState<ChapterParentCategory>(ChapterParentCategory.ALL);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		loadData();
	}, [selectedFilter]);

	const loadData = async () => {
		try {
			const accountData = await UserStorage.getSubAccount();
			setSubAccount(accountData);

			if (accountData) {
				const chaptersData = await chapterService.getChaptersByCategory(selectedFilter);
				logger.log("Courses loaded:", chaptersData);
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

	const renderChapterCard = (chapter: Chapter, index: number) => {

		return (
			<TouchableOpacity
				key={chapter.id}
				style={[styles.chapterCard, { width: cardWidth }]}
				onPress={() => {
					router.push(`/(app)/courses/${chapter.id}?imgIndex=${index}`);
				}}
			>
				<Card>
					<Image
						source={{uri: `https://pub-ce5bc62138bd4218b56745b7ccca587e.r2.dev/${chapter.imageUrl}`}} 
						style={styles.chapterImage} 
					/>
				</Card>
				<View style={styles.chapterInfo}>
					<Text style={styles.chapterTitle} numberOfLines={2}>
						{chapter.title}
					</Text>
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
				<View style={styles.filtersContainer}>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
					>
						{Object.values(ChapterParentCategory).map((category, key) => {
							const imageSource = categoryImages[category as keyof typeof categoryImages];
							return (
								<TouchableOpacity
									key={category + key}
									onPress={() => setSelectedFilter(category as ChapterParentCategory)}
									activeOpacity={0.7}
								>
									<Card 
										style={{display: "flex", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 6}}
										showCard={category === selectedFilter}
									>
										<Image source={imageSource} style={{width: 35, height: 35}}  resizeMode="cover"/>
										<Text style={styles.filterText} >
											{categoryLabels(category)}
										</Text>
									</Card>
								</TouchableOpacity>
							)
						})}
					</ScrollView>
				</View>

				{/* Chapters Grid */}
				<View style={styles.chaptersContainer}>
					{chapters.length > 0 ? (
						<View style={styles.chaptersGrid}>
							{chapters.map((chapter, index) => renderChapterCard(chapter, index))}
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
		paddingHorizontal: 20,
	},
	title: {
		marginBottom: 8,
		textAlign: "center",
	},
	subtitle: {
		textAlign: "center",
	},
	filtersContainer: {
		display: "flex",
		flexDirection: "row",
		gap: 8,
        backgroundColor: "#EBF2FB",
		paddingHorizontal: 20,
		paddingVertical: 12,
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
		color: "#333",
	},
	filterTextSelected: {
		color: "#fff",
	},
	chaptersContainer: {
		marginVertical: 20,
		paddingHorizontal: 20,
	},
	chaptersGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		gap: 12,
	},
	chapterCard: {
		display: "flex",
		flexDirection: "column",
		gap: 8,
		marginBottom: 24,
	},
	chapterImage: {
		width: "100%",
		height: 150,
		shadowColor: "#BFD0EA",
		shadowOffset: {
			width: 0,
			height: 3.89,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
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
