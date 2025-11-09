import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { UserStorage } from "@/utils/storage";
import { SubAccount } from "@/types/Account";
import { tasksService } from "@/services/tasksService";
import { Task } from "@/types/Task";
import { typography } from "@/styles/typography";
import { Ionicons } from "@expo/vector-icons";
import TaskTile from "@/components/TaskTile";

export default function Tasks() {
    const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const accountData = await UserStorage.getSubAccount();
            setSubAccount(accountData);

            if (accountData) {
                const childTasks = await tasksService.getTasksByChild(accountData.id, "CHILD");
                setTasks(childTasks);
            }
        } catch (error) {
            console.error("Error loading tasks:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await loadData();
        } finally {
            setRefreshing(false);
        }
    }, [loadData]);

    const handleCompleteTask = async (taskId: string) => {
        try {
            await tasksService.completeTask(taskId);
            Alert.alert("Bravo ! 🎉", "Tu as terminé cette tâche !", [{ text: "Super !", onPress: () => loadData() }]);
        } catch (error) {
            console.error("Error completing task:", error);
            Alert.alert("Erreur", "Impossible de terminer la tâche");
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#6C5CE7" />
                <Text style={[styles.loadingText, typography.body]}>Chargement...</Text>
            </View>
        );
    }

    const completedTasks = tasks.filter((task) => task.status === "COMPLETED");
    const pendingTasks = tasks.filter((task) => task.status === "PENDING" || task.status === "PRE_VALIDATE");
    const regularTasks = pendingTasks.filter((task) => task.category === "REGULAR");
    const punctualTasks = pendingTasks.filter((task) => task.category === "PUNCTUAL");

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C5CE7" />}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, typography.title]}>Mes tâches</Text>
                    <Text style={[styles.subtitle, typography.subtitle]}>
                        {pendingTasks.length > 0
                            ? `${pendingTasks.length} tâche${pendingTasks.length > 1 ? "s" : ""} à faire`
                            : "Toutes les tâches terminées ! 🎉"}
                    </Text>
                </View>

                {/* Statistiques */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, styles.card]}>
                        <Text style={styles.statIcon}>📋</Text>
                        <Text style={[styles.statValue, typography.heading]}>{tasks.length}</Text>
                        <Text style={[styles.statLabel, typography.caption]}>Total</Text>
                    </View>
                    <View style={[styles.statCard, styles.card]}>
                        <Text style={styles.statIcon}>✅</Text>
                        <Text style={[styles.statValue, typography.heading]}>{completedTasks.length}</Text>
                        <Text style={[styles.statLabel, typography.caption]}>Terminées</Text>
                    </View>
                    <View style={[styles.statCard, styles.card]}>
                        <Text style={styles.statIcon}>⏳</Text>
                        <Text style={[styles.statValue, typography.heading]}>{pendingTasks.length}</Text>
                        <Text style={[styles.statLabel, typography.caption]}>À faire</Text>
                    </View>
                </View>

                {/* Tâches à faire */}
                {pendingTasks.length > 0 && (
                    <>
                        {/* Tâches régulières */}
                        {regularTasks.length > 0 && (
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, typography.heading]}>Tâches régulières ({regularTasks.length})</Text>
                                {regularTasks.map((task) => (
                                    <TaskTile key={task.id} task={task} onPress={() => handleCompleteTask(task.id)} />
                                ))}
                            </View>
                        )}

                        {/* Tâches ponctuelles */}
                        {punctualTasks.length > 0 && (
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, typography.heading]}>Défis ponctuels ({punctualTasks.length})</Text>
                                {punctualTasks.map((task) => (
                                    <TaskTile key={task.id} task={task} onPress={() => handleCompleteTask(task.id)} />
                                ))}
                            </View>
                        )}
                    </>
                )}

                {/* Message si aucune tâche à faire */}
                {pendingTasks.length === 0 && tasks.length > 0 && (
                    <View style={[styles.motivationCard, styles.card]}>
                        <Text style={styles.motivationIcon}>🎉</Text>
                        <Text style={[styles.motivationTitle, typography.subheading]}>Excellent travail !</Text>
                        <Text style={[styles.motivationDescription, typography.body]}>
                            Tu as terminé toutes tes tâches ! Bravo pour ta persévérance.
                        </Text>
                    </View>
                )}

                {/* Message si aucune tâche du tout */}
                {tasks.length === 0 && (
                    <View style={[styles.emptyState, styles.card]}>
                        <Text style={styles.emptyIcon}>📝</Text>
                        <Text style={[styles.emptyTitle, typography.heading]}>Pas encore de tâches</Text>
                        <Text style={[styles.emptyText, typography.body]}>
                            Demande à tes parents de t'ajouter des tâches pour gagner de l'argent de poche !
                        </Text>
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
        color: "#666",
    },

    // Cards
    card: {
        backgroundColor: "#fff",
        borderRadius: 8,
        shadowColor: "#BFD0EA",
        shadowOffset: {
            width: 0,
            height: 3.89,
        },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },

    // Header
    header: {
        paddingTop: 60,
        paddingBottom: 24,
    },
    title: {
        marginBottom: 8,
    },
    subtitle: {
        lineHeight: 22,
    },

    // Stats
    statsContainer: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 30,
    },
    statCard: {
        flex: 1,
        padding: 16,
        alignItems: "center",
    },
    statIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    statValue: {
        color: "#333",
        marginBottom: 4,
    },
    statLabel: {
        textAlign: "center",
        color: "#666",
    },

    // Sections
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        color: "#333",
        marginBottom: 16,
    },

    // Messages
    motivationCard: {
        backgroundColor: "#FFF8E1",
        padding: 24,
        alignItems: "center",
        marginBottom: 20,
    },
    motivationIcon: {
        fontSize: 40,
        marginBottom: 12,
    },
    motivationTitle: {
        color: "#333",
        marginBottom: 8,
        textAlign: "center",
    },
    motivationDescription: {
        color: "#666",
        textAlign: "center",
        lineHeight: 20,
    },

    emptyState: {
        padding: 40,
        alignItems: "center",
        marginBottom: 20,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        color: "#333",
        marginBottom: 8,
        textAlign: "center",
    },
    emptyText: {
        color: "#666",
        textAlign: "center",
        lineHeight: 20,
    },

    bottomPadding: {
        height: 20,
    },
});
