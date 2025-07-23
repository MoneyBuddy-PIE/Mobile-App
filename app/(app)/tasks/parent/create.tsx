import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { TokenStorage } from "@/utils/storage";
import { tasksService } from "@/services/tasksService";
import { Task } from "@/types/Task";

export default function CreateTask() {
	const [loading, setLoading] = useState(true);
	const [tasks, setTasks] = useState<Task[]>([]);

	useEffect(() => {
		loadTasks();
	}, []);

	const loadTasks = async () => {
		try {
			// Simulate fetching tasks from an API
			const response = await tasksService.getAllTasks();
			console.log("Tasks loaded:", response);
		} catch (error) {
			console.error("Error loading tasks:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return <Text>Loading...</Text>;
	}

	return (
		<View>
			{tasks.map((task) => (
				<Text key={task.id}>{task.description}</Text>
			))}
		</View>
	);
}
