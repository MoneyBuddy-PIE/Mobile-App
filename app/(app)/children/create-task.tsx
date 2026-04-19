import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Task, TaskType } from "@/types/Task";
import TaskForm from "@/components/forms/TaskForm";

export default function CreateTask() {
	const params = useLocalSearchParams();

	const childId = params.childId as string;
	const taskTypeParams = params?.type as TaskType
	const task = params?.task ? JSON.parse(params?.task as string) as Task : null

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.title}>Ajouter une tâche</Text>
				<TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
					<Text style={styles.closeButtonText}>✕</Text>
				</TouchableOpacity>
			</View>

			<TaskForm childId={childId} type={taskTypeParams} task={task}/>
		</SafeAreaView>
	);
}


const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f9fa",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingTop: 10,
		paddingBottom: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},
	title: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
	},
	closeButton: {
		width: 32,
		height: 32,
		backgroundColor: "#333",
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	closeButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
	content: {
		flex: 1,
		paddingHorizontal: 20,
	},
	section: {
		marginTop: 24,
	},
	sectionLabel: {
		fontSize: 14,
		fontWeight: "400",
		color: "#2F2F2F",
		marginBottom: 12,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#D5D5D5",
		paddingHorizontal: 16,
	},
	inputContainerSelectedGreen: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#16AA75",
		paddingHorizontal: 16,
	},
	inputContainerSelected: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#F3F0FD",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#846DED",
		paddingHorizontal: 16,
	},
	textInput: {
		flex: 1,
		fontSize: 16,
		color: "#333",
		paddingVertical: 16,
	},
	amountContainer: {
		flexDirection: "row",
		gap: 12,
		flexWrap: "wrap",
	},
	amountButton: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#EAEAEA",
		padding: 8,
		borderRadius: 8,
		borderWidth: 2,
		borderColor: "transparent",
	},
	amountButtonSelected: {
		backgroundColor: "#E6E2FB",
		borderColor: "#846DED",
	},
	amountButtonText: {
		fontSize: 14,
		color: "#6E6E6E",
	},
	amountButtonTextSelected: {
		color: "#2F2F2F",
	},
	customAmountContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#6C5CE7",
		paddingHorizontal: 16,
		marginTop: 12,
	},
	customAmountInput: {
		flex: 1,
		fontSize: 16,
		color: "#333",
		paddingVertical: 16,
	},
	euroSymbol: {
		fontSize: 16,
		color: "#666",
		fontWeight: "500",
	},
	taskTypeContainer: {
		flexDirection: "row",
		gap: 12,
	},
	taskTypeButton: {
		backgroundColor: "#EAEAEA",
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
		borderWidth: 2,
		borderColor: "transparent",
	},
	taskTypeButtonSelected: {
		backgroundColor: "#E6E2FB",
		borderColor: "#846DED",
	},
	taskTypeButtonText: {
		fontSize: 14,
		color: "#6E6E6E",
	},
	taskTypeButtonTextSelected: {
		color: "#2F2F2F",
	},
	WeekDayContainer: {
		backgroundColor: "#F3F0FD",
		paddingHorizontal: 16,
		paddingVertical: 20,
		display: "flex",
		flexDirection: "column",
		gap: 12,
		marginTop: 8,
		borderRadius: 8
	},
	WeekDayTitle: {
		fontSize: 14,
		color: "#2F2F2F",
		fontWeight: "400",
	},
	WeekDayButton: {
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		backgroundColor: "#FFFFFF",
	},
	weekdayButtonSelected: {
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderWidth: 1.5,
		backgroundColor: "#CEC5F8",
		borderColor: "#846DED"
	},
	weekdDayButtonText: {
		fontSize: 16,
		color: "#6E6E6E",
		fontWeight: "400",
	},
	weekdDayButtonTextSelected: {
		fontWeight: "700",
	},
	bottomPadding: {
		height: 100,
	},
	footer: {
		paddingHorizontal: 20,
		paddingBottom: 20,
		paddingTop: 16,
	},
	createButton: {
		backgroundColor: "#846DED",
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
		shadowColor: "#4E31CF",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
		elevation: 4,
	},
	createButtonDisabled: {
		backgroundColor: "#ccc",
		shadowColor: "transparent",
	},
	createButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
});
