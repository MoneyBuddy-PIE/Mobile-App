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
} from "react-native";
import { router } from "expo-router";
import { UserStorage } from "@/utils/storage";
import { SubAccount } from "@/types/Account";
import { courseService } from "@/services/courseService";
import { Course } from "@/types/Course";

const { width } = Dimensions.get("window");
const cardWidth = (width - 60) / 2; // 20px padding + 20px gap

const AGE_FILTERS = [
	{ id: "6-10", label: "6 à 10 ans", color: "#FF6B6B" },
	{ id: "10-14", label: "10 à 14 ans", color: "#4ECDC4" },
	{ id: "bases", label: "Les bases", color: "#45B7D1" },
];

const COURSE_COLORS = [
	"#FFE5E5", // Rose pâle
	"#E5F3FF", // Bleu pâle
	"#E5FFE5", // Vert pâle
	"#FFF5E5", // Orange pâle
	"#F0E5FF", // Violet pâle
	"#FFFFE5", // Jaune pâle
];

export default function Courses() {
	const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
	const [courses, setCourses] = useState<Course[]>([]);
	const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
	const [selectedFilter, setSelectedFilter] = useState<string>("all");
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		loadData();
	}, []);

	useEffect(() => {
		filterCourses();
	}, [courses, selectedFilter]);

	const loadData = async () => {
		try {
			const accountData = await UserStorage.getSubAccount();
			setSubAccount(accountData);

			if (accountData) {
				const coursesData = await courseService.getCoursesByRole(accountData.role);
				setCourses(coursesData);
			}
		} catch (error) {
			console.error("Error loading courses:", error);
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

	const filterCourses = () => {
		if (selectedFilter === "all") {
			setFilteredCourses(courses);
		} else {
			// Pour l'instant, on affiche tous les cours car l'API ne fournit pas de critères d'âge
			// On pourrait filtrer par title ou description si nécessaire
			setFilteredCourses(courses);
		}
	};

	const handleFilterPress = (filterId: string) => {
		setSelectedFilter(filterId);
	};

	const renderCourseCard = (course: Course, index: number) => {
		const backgroundColor = COURSE_COLORS[index % COURSE_COLORS.length];

		return (
			<TouchableOpacity
				key={course.id}
				style={[styles.courseCard, { backgroundColor, width: cardWidth }]}
				onPress={() => {
					router.push(`/(app)/courses/${course.id}`);
				}}
			>
				<View style={styles.courseImagePlaceholder}>
					<Text style={styles.courseEmoji}>
						{index % 6 === 0
							? "📚"
							: index % 6 === 1
							? "💰"
							: index % 6 === 2
							? "🎯"
							: index % 6 === 3
							? "🏦"
							: index % 6 === 4
							? "🎮"
							: "💡"}
					</Text>
				</View>
				<View style={styles.courseInfo}>
					<Text style={styles.courseTitle} numberOfLines={2}>
						{course.title}
					</Text>
					<Text style={styles.courseLevel}>Niveau I</Text>
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
					<Text style={styles.title}>Mes cours</Text>
					<Text style={styles.subtitle}>
						{isChildAccount
							? "Apprendre l'argent en s'amusant"
							: "Comprendre l'argent pour mieux l'expliquer"}
					</Text>
				</View>

				{/* Age Filters */}
				<View style={styles.filtersContainer}>
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
				</View>

				{/* Courses Grid */}
				<View style={styles.coursesContainer}>
					{filteredCourses.length > 0 ? (
						<View style={styles.coursesGrid}>
							{filteredCourses.map((course, index) => renderCourseCard(course, index))}
						</View>
					) : (
						<View style={styles.emptyContainer}>
							<Text style={styles.emptyIcon}>📚</Text>
							<Text style={styles.emptyTitle}>Aucun cours disponible</Text>
							<Text style={styles.emptyText}>
								Les cours seront bientôt disponibles pour votre niveau.
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
		fontSize: 32,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: "#666",
		lineHeight: 22,
	},
	filtersContainer: {
		flexDirection: "row",
		gap: 8,
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
	coursesContainer: {
		marginBottom: 20,
	},
	coursesGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		gap: 20,
	},
	courseCard: {
		borderRadius: 16,
		padding: 16,
		marginBottom: 20,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	courseImagePlaceholder: {
		height: 100,
		borderRadius: 12,
		backgroundColor: "rgba(255, 255, 255, 0.3)",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 12,
	},
	courseEmoji: {
		fontSize: 48,
	},
	courseInfo: {
		gap: 4,
	},
	courseTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		lineHeight: 20,
	},
	courseLevel: {
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
