import { CreateTaskRequest, Task, TaskType, WeekDay } from "@/types/Task";
import { useCallback, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Alert, FlatList, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tasksService } from "@/services/tasksService";
import { router } from "expo-router";
import ModalComponent from "../Modal";
import React from "react";
import TaskDelete from "./TaskDelete";

const PREDEFINED_AMOUNTS = ["0.50", "1", "1.50"];
const PREDEFINED_COINS = ["1", "5", "10", "25"];

const taskTypeInputLabel = (taskType: TaskType | null) => {
    switch (taskType) {
        case TaskType.WEEKLY:
            return "Toutes les semaines";
        case TaskType.MONTHLY:
            return "Tous les mois";
        case TaskType.PONCTUAL:
            return "Une seule fois";
        default:
            return "Sélectionnez";
    }
};

type IProps = {
    childId: string;
    type?: TaskType;
    task?: Task | null;
};

const TaskForm = ({ childId, type, task }: IProps) => {
    const taskTypeParams = type;
    const isUpdate = Boolean(task?.id);

    const [taskName, setTaskName] = useState(task?.description ?? "");

    const [selectedAmount, setSelectedAmount] = useState("");
    const [customAmount, setCustomAmount] = useState(task?.moneyReward?.toString() ?? "");
    const [showCustomAmount, setShowCustomAmount] = useState(!!task?.moneyReward);

    const [selectedCoin, setSelectedCoin] = useState("");
    const [customCoin, setCustomCoin] = useState(task?.coinReward?.toString() ?? "");
    const [showCustomCoin, setShowCustomCoin] = useState(!!task?.coinReward);

    const [showFrequencyModal, setShowFrequencyModal] = useState(taskTypeParams === TaskType.WEEKLY || false);
    const [taskType, setTaskType] = useState<TaskType | null>(taskTypeParams ?? null);
    const [weekdays, setWeekdays] = useState<WeekDay[]>(task?.weeklyDays?.length ? task?.weeklyDays : []);
    const [loading, setLoading] = useState(false);

    const handleAmountSelect = (amount: string) => {
        setSelectedAmount(amount);
        setShowCustomAmount(false);
        setCustomAmount("");
    };

    const handleCoinSelect = (amount: string) => {
        setSelectedCoin(amount);
        setShowCustomCoin(false);
        setCustomCoin("");
    };

    const handleCustomAmount = () => {
        setShowCustomAmount(true);
        setSelectedAmount("");
    };

    const handleCustomCoin = () => {
        setShowCustomCoin(true);
        setSelectedCoin("");
    };

    const handleCreateTask = async () => {
        const finalAmount = getFinalAmount();

        if (!taskName.trim()) {
            Alert.alert("Erreur", "Veuillez saisir un nom de tâche");
            return;
        }

        if (!finalAmount) {
            Alert.alert("Erreur", "Veuillez sélectionner un montant");
            return;
        }

        if (!taskType) {
            Alert.alert("Erreur", "Veuillez sélectionner une fréquence");
            return;
        }

        if (taskType === TaskType.WEEKLY && weekdays.length === 0) {
            Alert.alert("Erreur", "Veuillez sélectionner au moins un jour pour la tâche hebdomadaire");
            return;
        }

        setLoading(true);

        const moneyReward = showCustomAmount ? Number(customAmount) : Number(selectedAmount);
        const coinReward = showCustomCoin ? Number(customCoin) : Number(selectedCoin);

        let data: CreateTaskRequest = {
            description: taskName.trim(),
            type: taskType,
            subAccountId: childId,
            moneyReward,
            coinReward,
            dateLimit: new Date().toISOString(),
            prevalidation: true,
            weeklyDays: [],
            monthlyDay: 1,
        };

        if (taskType === TaskType.WEEKLY) data.weeklyDays = weekdays;

        if (taskType === TaskType.MONTHLY) data.monthlyDay = 1;

        try {
            if (isUpdate && task?.id) {
                await tasksService.updateTask(task?.id, data);
            } else {
                await tasksService.createTask(data);
            }
            Alert.alert("Succès", isUpdate ? "Tâche modifié avec succès" : "Tâche créée avec succès", [{ text: "OK", onPress: () => router.back() }]);
        } catch (error: any) {
            console.error("Error creating task:", error);
            const errorMessage = error.response?.data?.message || "Impossible de créer la tâche";
            Alert.alert("Erreur", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getFinalAmount = () => {
        if (showCustomAmount) {
            return customAmount;
        }
        return selectedAmount;
    };

    const handleCloseModal = useCallback(() => {
        setShowFrequencyModal(false);
    }, []);

    const handleTaskTypeChange = useCallback((type: TaskType) => {
        setTaskType(type);
    }, []);

    const handleWeekdayToggle = useCallback((day: WeekDay) => {
        setWeekdays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
    }, []);

    return (
        <>
            <ModalFrequency
                visible={showFrequencyModal}
                onClose={handleCloseModal}
                taskType={taskType}
                weekdays={weekdays}
                onTaskTypeChange={handleTaskTypeChange}
                onWeekdayToggle={handleWeekdayToggle}
            />
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Nom de la tâche */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>C’est quoi la tâche ?</Text>
                    <View style={[taskName ? styles.inputContainerSelectedGreen : styles.inputContainer]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ex: Sortir les poubelles"
                            value={taskName}
                            onChangeText={setTaskName}
                            autoCapitalize="sentences"
                        />
                        {taskName.trim() && <Ionicons name="checkmark-outline" size={18} color="#16AA75" />}
                    </View>
                </View>

                {/* Montant attribué */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Montant attribué</Text>
                    <View style={styles.amountContainer}>
                        {PREDEFINED_AMOUNTS.map((amount) => (
                            <TouchableOpacity
                                key={amount}
                                style={[styles.amountButton, selectedAmount === amount && styles.amountButtonSelected]}
                                onPress={() => handleAmountSelect(amount)}
                            >
                                <Text style={[styles.amountButtonText, selectedAmount === amount && styles.amountButtonTextSelected]}>{amount}€</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={[styles.amountButton, showCustomAmount && styles.amountButtonSelected]} onPress={handleCustomAmount}>
                            <Text style={[styles.amountButtonText, showCustomAmount && styles.amountButtonTextSelected]}>Définir</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Input montant personnalisé */}
                    {showCustomAmount && (
                        <View style={styles.customAmountContainer}>
                            <TextInput
                                style={styles.customAmountInput}
                                placeholder="Montant personnalisé"
                                value={customAmount}
                                onChangeText={setCustomAmount}
                                keyboardType="decimal-pad"
                                autoFocus
                            />
                            <Text style={styles.euroSymbol}>€</Text>
                        </View>
                    )}
                </View>

                {/* Coin attribué */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Récompense</Text>
                    <View style={styles.amountContainer}>
                        {PREDEFINED_COINS.map((coin) => (
                            <TouchableOpacity
                                key={coin}
                                style={[styles.amountButton, selectedCoin === coin && styles.amountButtonSelected]}
                                onPress={() => handleCoinSelect(coin)}
                            >
                                <Text style={[styles.amountButtonText, selectedCoin === coin && styles.amountButtonTextSelected]}>{coin}</Text>
                                <Ionicons name="ellipse" size={20} color="#2F2F2F" />
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={[styles.amountButton, showCustomCoin && styles.amountButtonSelected]} onPress={handleCustomCoin}>
                            <Text style={[styles.amountButtonText, showCustomCoin && styles.amountButtonTextSelected]}>Définir</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Input montant personnalisé */}
                    {showCustomCoin && (
                        <View style={styles.customAmountContainer}>
                            <TextInput
                                style={styles.customAmountInput}
                                placeholder="Montant personnalisé"
                                value={customCoin}
                                onChangeText={setCustomCoin}
                                keyboardType="decimal-pad"
                                autoFocus
                            />
                            <Ionicons name="ellipse" size={20} color="#2F2F2F" />
                        </View>
                    )}
                </View>

                {/* Type de tâche */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>À quelle fréquence ?</Text>
                    <TouchableOpacity onPress={() => setShowFrequencyModal(true)}>
                        <View style={[taskType ? styles.inputContainerSelectedGreen : styles.inputContainer]}>
                            <Text style={styles.textInput}>{taskTypeInputLabel(taskType)}</Text>
                            {taskType ? (
                                <Ionicons name="checkmark-outline" size={18} color="#16AA75" />
                            ) : (
                                <Ionicons name="arrow-back" size={18} color="#D5D5D5" style={[{ transform: [{ rotate: "180deg" }] }]} />
                            )}
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Bouton de création */}
            <View style={[styles.footer, isUpdate && styles.footerUpdate]}>
                {!isUpdate && (
                    <TouchableOpacity
                        style={[styles.createButton, (!taskName.trim() || !getFinalAmount() || loading) && styles.createButtonDisabled]}
                        onPress={handleCreateTask}
                        disabled={!taskName.trim() || !getFinalAmount() || loading}
                    >
                        <Text style={styles.createButtonText}>{loading ? "Création..." : "Créer la tâche"}</Text>
                    </TouchableOpacity>
                )}
                {isUpdate && task?.id && (
                    <>
                        <View style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    { backgroundColor: "#846DED", shadowColor: "#4E31CF" },
                                    (!taskName.trim() || !getFinalAmount() || loading) && styles.createButtonDisabled,
                                ]}
                                onPress={handleCreateTask}
                                disabled={!taskName.trim() || !getFinalAmount() || loading}
                            >
                                <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>{loading ? "Modification..." : "Ok"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: "#D5D5D5", shadowColor: "#979797" }]}
                                onPress={() => router.back()}
                            >
                                <Text style={[styles.buttonText, { color: "#6A6A6A" }]}>Annuler</Text>
                            </TouchableOpacity>
                        </View>
                        <TaskDelete taskId={task.id} />
                    </>
                )}
            </View>
        </>
    );
};

export const ModalFrequency = React.memo(
    ({
        visible,
        onClose,
        taskType,
        weekdays,
        onTaskTypeChange,
        onWeekdayToggle,
    }: {
        visible: boolean;
        onClose: () => void;
        taskType: TaskType | null;
        weekdays: WeekDay[];
        onTaskTypeChange: (type: TaskType) => void;
        onWeekdayToggle: (day: WeekDay) => void;
    }) => {
        const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
        const radios = [
            { label: "Une seule fois", value: TaskType.PONCTUAL },
            { label: "Toutes les semaines", value: TaskType.WEEKLY },
            { label: "Tous les mois", value: TaskType.MONTHLY },
        ];

        return (
            <ModalComponent visible={visible} onClose={onClose} backgroundColor="#fff">
                <View>
                    <Text style={[styles.title, { marginBottom: 16, paddingHorizontal: 20 }]}>À vous de jouer : validez ses tâches complétées !</Text>
                    {radios.map((radio) => {
                        const isSelected = taskType === radio.value;
                        return (
                            <View key={radio.value} style={{ marginBottom: 16, paddingHorizontal: 20 }}>
                                <Pressable key={radio.value} onPress={() => onTaskTypeChange(radio.value)}>
                                    <View style={[isSelected ? styles.inputContainerSelected : styles.inputContainer, { paddingVertical: 12 }]}>
                                        <Text style={[styles.textInput, { fontWeight: isSelected ? "700" : "400" }]}>{radio.label}</Text>
                                        <Ionicons
                                            name={isSelected ? "ellipse" : "ellipse-outline"}
                                            size={20}
                                            color={isSelected ? "#846DED" : "#D5D5D5"}
                                        />
                                    </View>
                                </Pressable>
                                {radio.value === TaskType.WEEKLY && isSelected && (
                                    <View style={[styles.WeekDayContainer]}>
                                        <Text style={styles.WeekDayTitle}>Cette tâche se répètera le(s) jour(s) choisi(s).</Text>
                                        <View style={{ display: "flex", flexDirection: "row", gap: 8, alignItems: "center" }}>
                                            {Object.values(WeekDay).map((day, index) => {
                                                const item = { label: days[index], value: day };
                                                const isChecked = weekdays.includes(item.value as WeekDay);

                                                return (
                                                    <Pressable
                                                        key={item.value}
                                                        style={[isChecked ? styles.weekdayButtonSelected : styles.WeekDayButton]}
                                                        onPress={() => onWeekdayToggle(item.value as WeekDay)}
                                                    >
                                                        <Text style={[styles.weekdDayButtonText, isChecked && styles.weekdDayButtonTextSelected]}>
                                                            {item.label.substring(0, 1)}
                                                        </Text>
                                                    </Pressable>
                                                );
                                            })}
                                        </View>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                    <TouchableOpacity style={[styles.createButton, { marginHorizontal: 20 }]} onPress={onClose}>
                        <Text style={styles.createButtonText}>Appliquer</Text>
                    </TouchableOpacity>
                </View>
            </ModalComponent>
        );
    },
);

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
        borderRadius: 8,
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
        borderColor: "#846DED",
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
    footerUpdate: {
        display: "flex",
        flexDirection: "row-reverse",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderColor: "#BFD0EA",
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
    button: {
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
    },
});

export default TaskForm;
