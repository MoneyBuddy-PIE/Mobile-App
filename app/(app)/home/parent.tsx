import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	ActivityIndicator,
	RefreshControl,
	SafeAreaView,
	Image
} from "react-native";
import { useFonts } from "expo-font";
import { DMSans_700Bold, DMSans_400Regular, DMSans_600SemiBold } from "@expo-google-fonts/dm-sans";
import { Link, router } from "expo-router";
import { UserStorage } from "@/utils/storage";
import { SubAccount } from "@/types/Account";
import { useAuthContext } from "@/contexts/AuthContext";
import { tasksService } from "@/services/tasksService";
import { Ionicons } from "@expo/vector-icons";
import { Chapter } from "@/types/Chapter";
import { chapterService } from "@/services/chapterService";
import { courseService } from "@/services/courseService";

interface ChildSummary {
	child: SubAccount;
	tasksCount: number;
	completedTasksCount: number;
	loading: boolean;
}

export default function ParentHome() {
	const { user, refreshUserData } = useAuthContext();
	const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
	const [childrenSummary, setChildrenSummary] = useState<ChildSummary[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	const [chapter, setChapter] = useState<Chapter | null>();
	const [progressBarWidth, setProgressBarWidth] = useState(0);

	const [fontsLoaded] = useFonts({
		DMSans_700Bold,
		DMSans_400Regular,
		DMSans_600SemiBold,
	});

	const fontStylesTitle = fontsLoaded ? { fontFamily: "DMSans_700Bold" } : {};
	const fontStylesRegular = fontsLoaded ? { fontFamily: "DMSans_400Regular" } : {};
	const fontStylesSemiBold = fontsLoaded ? { fontFamily: "DMSans_600SemiBold" } : {};

	const childAccounts = useMemo(
		() => user?.subAccounts?.filter((account) => account.role === "CHILD") || [],
		[user?.subAccounts]
	);

	const loadData = useCallback(async () => {
		try {
			const accountData = await UserStorage.getSubAccount();
			setSubAccount(accountData);

			const chaptersData = await chapterService.getChaptersByCategory();
			setChapter(chaptersData.find((chap) => !chap.isCompleted) ?? null);
			getPercentageCourseCompleted()
		} catch (error) {
			console.error("Error loading account:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	const loadChildrenData = useCallback(async () => {
		if (childAccounts.length === 0) return;

		// Initialiser le state avec les enfants
		const initialSummaries: ChildSummary[] = childAccounts.map((child) => ({
			child,
			tasksCount: 0,
			completedTasksCount: 0,
			loading: true,
		}));
		setChildrenSummary(initialSummaries);

		// Charger les tâches pour chaque enfant
		for (let i = 0; i < childAccounts.length; i++) {
			const child = childAccounts[i];
			try {
				const tasks = await tasksService.getTasksByChild(child.id, "PARENT");
				const completedTasks = tasks.filter((task) => task.done);

				setChildrenSummary((prev) =>
					prev.map((summary, index) =>
						index === i
							? {
									...summary,
									tasksCount: tasks.length,
									completedTasksCount: completedTasks.length,
									loading: false,
							  }
							: summary
					)
				);
			} catch (error) {
				console.error(`Error loading tasks for child ${child.id}:`, error);
				setChildrenSummary((prev) =>
					prev.map((summary, index) => (index === i ? { ...summary, loading: false } : summary))
				);
			}
		}
	}, [childAccounts]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	useEffect(() => {
		if (childAccounts.length > 0) {
			loadChildrenData();
		} else {
			setChildrenSummary([]);
		}
	}, [childAccounts.length, loadChildrenData]);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await refreshUserData();
		} finally {
			setRefreshing(false);
		}
	}, [refreshUserData]);

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (6 <= hour || hour < 18) return "Bonjour";
		return "Bonsoir";
	};

	const getTotalMoney = () => {
		return childAccounts.reduce((total, child) => {
			return total + parseFloat(child.money || "0");
		}, 0);
	};

	const getTotalIncome = () => {
		return childAccounts.reduce((total, child) => {
			return total + parseFloat(child.income?.toString() || "0");
		}, 0);
	}

	const getTotalTasks = () => {
		return childrenSummary.reduce((total, summary) => {
			return total + summary.tasksCount;
		}, 0);
	};

	const getTotalCompletedTasks = () => {
		return childrenSummary.reduce((total, summary) => {
			return total + summary.completedTasksCount;
		}, 0);
	};

	const getPercentageCourseCompleted = async() => {
		if (!chapter) return 0

		const courses = await chapterService.getChapterCourses(chapter.id)
		const completed = courses.filter((course) => course.completed).length
		
		setProgressBarWidth(Math.round((completed / courses.length) * 100))
	}

	const renderChildCard = (summary: ChildSummary) => {
		const { child, tasksCount, completedTasksCount, loading: childLoading } = summary;
		const url = `https://api.dicebear.com/9.x/${child.iconStyle}/png?seed=${child.iconName}`
		const money = parseFloat(child.money || "0");
		const completionRate = tasksCount > 0 ? Math.round((completedTasksCount / tasksCount) * 100) : 0;

		return (
			<TouchableOpacity key={child.id} style={styles.childCard} onPress={() => router.push("/(app)/children")}>
				<View style={styles.childCardContainer}>
					<View style={styles.childCardContainer}>
						<Image source={{ uri: url }} style={styles.childCardImg} />
						<View style={styles.childCardContainerCol}>
							<Text style={{...styles.childCardTitle, ...{fontSize: 16}}}>{child.name}</Text>
							<View style={{...styles.iconContainer, ...styles.childCardContainer, ...{backgroundColor: "#97C9FF66", paddingHorizontal: 5, paddingVertical: 3}}}>
								<Ionicons name="wallet-outline" size={15} color="#52A5FF" style={styles.icon} />
								<Text style={{...styles.childCardTitle, ...{fontSize: 12, paddingHorizontal: 5, paddingVertical: 3}}}>{child.money}€</Text>
							</View>
						</View>
					</View>
					<Ionicons name="arrow-back" size={24} color="#2F2F2F" style={{...styles.icon, ...{transform: "rotate(180deg)"}}} />
				</View>

				<View style={styles.childCardContainer}>
					<View style={styles.childCardIconContainer}>
						<View style={styles.iconContainer}>
							<Ionicons name="wallet-outline" size={20} color={"#6A6A6A"} style={styles.icon}/>
						</View>
						<Text style={styles.childCardIconText}>Verser</Text>
					</View>

					<View style={styles.childCardIconContainer}>
						<View style={styles.iconContainer}>
							<Ionicons name="ticket-outline" size={20} color={"#6A6A6A"} style={styles.icon}/>
						</View>
						<Text style={styles.childCardIconText}>Dépensé</Text>
					</View>

					<View style={styles.childCardIconContainer}>
						<View style={{...styles.iconContainer, ...{display: "flex", flexDirection: "row", gap: 2, alignItems: "center"}}}>
							<Ionicons name="list-outline" size={20} color={"#6A6A6A"} style={styles.icon}/>
							{tasksCount ? 
								<Text style={styles.childCardIconText}> {completedTasksCount} / {tasksCount}</Text> 
								: <Text style={styles.childCardIconText}>0</Text>
							}
						</View>
						<Text style={styles.childCardIconText}>Tâches faites</Text>
					</View>
				</View>
			</TouchableOpacity>
		);
	};

	if (loading) {
		return (
			<View style={[styles.container, styles.center]}>
				<ActivityIndicator size="large" color="#6C5CE7" />
				<Text style={[styles.loadingText, fontStylesRegular]}>Chargement...</Text>
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView
				style={styles.content}
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C5CE7" />}
			>
				{/* Header */}
				<View style={styles.header}>
					<Text style={[styles.nameText, fontStylesTitle]}>
						{`${getGreeting()}, ${subAccount?.name || "Parent"} !`}
					</Text>
					<View style={styles.headerNotificationContainer}>
						<Ionicons name="notifications-outline" size={20} color="#846DED" style={styles.headerNotification} />
					</View>
				</View>

				{/* Stats générales */}
				<View style={styles.contentSetup}>
					<Text style={{...styles.cardTitle, ...{paddingBottom: 20}}}>Vous avez ...</Text>
					<View style={styles.generalStats}>
						<View style={styles.statCard}>
							<View style={{...styles.iconContainer, ...{backgroundColor: "#E1FFF6"}}}>
								<Ionicons name="checkmark-circle-outline" size={20} color={"#16AA75"} style={styles.icon}/>
							</View>
							<Text style={styles.cardTitle}>{getTotalTasks() - getTotalCompletedTasks()}</Text>
							<Text style={styles.cardText}>Tâches en attente de validation</Text>
							<TouchableOpacity
								style={{width: "100%"}}
								onPress={() => {
									router.push(`/(app)/tasks`);
								}}
							>
								<View style={styles.generalStatsButton}>
									<Text style={styles.generalStatsButtonText}>Voir tout</Text>
								</View>
							</TouchableOpacity>
						</View>

						<View style={styles.generalStatsSecondary}>
							<View style={styles.statCard}>
								<View style={styles.cardTitleContainer}>
									<View style={{...styles.iconContainer, ...{backgroundColor: "#E6E2FB"}}}>
										<Ionicons name="wallet-outline" size={20} color={"#846DED"} style={styles.icon} />
									</View>
									<Text style={styles.cardTitle}>{getTotalIncome()}€</Text>
								</View>
								<Text style={styles.cardText}>À verser samedi</Text>
							</View>

							<View style={styles.statCard}>
								<View style={styles.cardTitleContainer}>
									<View style={{...styles.iconContainer, ...{backgroundColor: "#97C9FF66"}}}>
										<Ionicons name="list-outline" size={20} color={"#52A5FF"} style={styles.icon} />
									</View>
									<Text style={styles.cardTitle}>{getTotalCompletedTasks()} / {getTotalTasks()}</Text>
								</View>
								<Text style={styles.cardText}>Tâches terminées</Text>
							</View>
						</View>
					</View>
				</View>
				
				
				{/* Section Reminder - Rappel Versement */}
				<View style={styles.contentSetup}>
					<View style={styles.reminderSection}>
						<View style={styles.reminderContainer}>
							<Image 
								source={require('@/assets/images/reminder/image_8.png')}
							/>
							<View style={{display: "flex", flexDirection: "column", gap: 10, maxWidth: "70%"}}>
								<Text style={styles.reminderTitle}>
									Créez un rituel clair d’argent de poche ! 💸
								</Text>
								<Text style={styles.reminderText}>
									Un versement régulier aide votre enfant à planifier et comprendre la valeur de l’argent.
								</Text>
							</View>
						</View>
						<View style={styles.reminderContainer}>
							<TouchableOpacity>
								<Text style={styles.reminderIgnore}>Ignorer</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.reminderButtonContainer}
							>
								<Text style={styles.reminderButtonText}>Configurer le versement</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>


				{/* Section Enfants */}
				{childAccounts.length > 0 && (
					<View style={styles.contentSetup}>
						<Text style={{...styles.cardTitle, ...{paddingBottom: 20}}}>Mes enfants</Text>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.childList}
						>
							{childAccounts.map((child, index) => renderChildCard(childrenSummary[index]))}
						</ScrollView>
					</View>
				)}

				{/* Get to course */}
				{
					chapter &&(
						<View style={styles.contentSetup}>
							<Text style={{...styles.cardTitle, ...{paddingBottom: 20}}}>Continuez votre progression !</Text>
							<View style={styles.getCourseContainer}>
								<Image 
									style={styles.getCourseImage}
									source={{uri: `https://pub-ce5bc62138bd4218b56745b7ccca587e.r2.dev/${chapter.imageUrl}`}}
								/>
								<Text style={styles.getCourseTitle}>{chapter.title}</Text>
								<View style={styles.progressContainer}>
									<View style={styles.progressBar}>
										<View 
										style={[
											styles.progressFill, 
											{ width: `${progressBarWidth}%` }
										]} 
										/>
									</View>
									<Text style={styles.progressText}>{progressBarWidth}%</Text>
								</View>
								<TouchableOpacity
									style={{...styles.reminderButtonContainer, ...styles.getCourseButton}}
									onPress={() => router.push(`/(app)/courses/${chapter.id}`)}
								>
									<Text style={styles.reminderButtonText}>Reprendre le cours</Text>
								</TouchableOpacity>
							</View>
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
		backgroundColor: "#fff",
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 10,
		borderBottomColor: "#BFD0EA",
		borderBottomWidth: 1
	},
	headerNotification: {
		padding: 4,
	},
	headerNotificationContainer: {
		borderColor: "#BFD0EA",
		borderWidth: 1,
		borderRadius: 3
	},
	nameText: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 4,
	},
	roleText: {
		fontSize: 16,
		color: "#6C5CE7",
		fontWeight: "500",
	},
	contentSetup : {
		backgroundColor: "#EBF2FB",
		paddingHorizontal: 20,
		paddingVertical: 20,
	},
	generalStats: {
		display: "flex",
		flexDirection: "row",
		gap: 20,
	},
	card: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
	},
	generalStatsSecondary: {
		display: "flex",
		flexDirection: "column",
		gap: 20,
		maxWidth: "47%"
	},
	generalStatsButton: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 4,
		backgroundColor: "#EBF2FB",
		alignItems: "center",
	},
	generalStatsButtonText: {
		fontSize: 16,
		fontWeight: "300",
		color: "#6A6A6A"
	},
	statCard: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		gap: 8,
		justifyContent: "space-between",
		backgroundColor: "#fff",
		borderRadius: 4,
		paddingVertical: 12,
		paddingHorizontal: 12,
		alignItems: "flex-start",
		shadowColor: "#BFD0EA",
		shadowOffset: {
			width: 0,
			height: 3.89,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
	},
	iconContainer: {
		borderRadius: 6,
	},
	icon: {
		padding: 4,
	},
	cardTitleContainer: {
		display: "flex",
		flexDirection: "row",
		gap: 8,
		alignItems: "center",
	},
	cardTitle: {
		fontSize: 24,
		fontWeight: "700",
		color: "#333",
	},
	cardText: {
		fontSize: 16,
		fontWeight: "500",
		color: "#333"
	},
	reminderSection: {
		backgroundColor: "#BFD0EA99",
		padding: 20,
		borderRadius: 8,
		display: "flex",
		flexDirection: "column",
		gap: 20,
		alignItems: "center",
	},
	reminderContainer: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		gap: 20,
		justifyContent: "space-between",	
	},
	reminderIgnore: {
		color: "#6A6A6A",
		fontWeight: "700",
		fontSize: 16,
	},
	reminderTitle: {
		color: "#2F2F2F",
		fontWeight: "700",
		fontSize: 16,
	},
	reminderText: {
		color: "#2F2F2F",
		fontWeight: "400",
		fontSize: 14,
	},
	reminderButtonContainer: {
		backgroundColor: "#7059D7",
		paddingHorizontal: 12,
		paddingVertical: 16,
		borderRadius: 8,
	},
	reminderButtonText: {
		color: "#FFFFFF",
		fontWeight: "700",
		fontSize: 16,
	},
	childCardContainer: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		gap: 12
	},
	childList: {
		display: "flex",
		flexDirection: "row",
		gap: 16,
		paddingBottom: 3,
	},
	childCardIconContainer:{
		backgroundColor: "#EBF2FB",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		padding: 8,
		borderRadius: 4,
		gap: 4
	},
	childCardIconText: {
		fontWeight: "400",
		fontSize: 12,
		color: "#6A6A6A"
	},
	childCardContainerCol: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		gap: 4
	},
	childCardImg: {
		width: 50,
		height: 50,
		borderRadius: 8,
	},
	childCardTitle: {
		fontWeight: "700",
		color: "#333",
	},
	childCard: {
		backgroundColor: "#fff",
		borderRadius: 8,
		padding: 16,
		shadowColor: "#BFD0EA",
		shadowOffset: {
			width: 0,
			height: 3.89,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
		display: "flex",
		flexDirection: "column",
		gap: 16,
	},
	getCourseContainer: {
		backgroundColor: "#fff",
		display: "flex",
		flexDirection: "column",
		gap: 16,
		alignItems: "flex-start",
		padding: 16,
		borderRadius: 8
	},
	getCourseImage: {
		width: "100%",
		height: 188,
		borderRadius: 8,
	},
	getCourseTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: "#2F2F2F",
	},
	getCourseButton: {
		width: "100%",
		shadowColor: "#4E31CF",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
		display: "flex",
		alignItems: "center",
	},
	progressContainer: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		marginLeft: 16,
		gap: 8,
	},
	progressBar: {
		flex: 1,
		height: 6,
		backgroundColor: "#e0e0e0",
		borderRadius: 3,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: "#846DED",
		borderRadius: 3,
	},
	progressText: {
		fontSize: 12,
		color: "#666",
		minWidth: 30,
	},
	createButton: {
		backgroundColor: "#6C5CE7",
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	bottomPadding: {
		height: 20,
	},
});
