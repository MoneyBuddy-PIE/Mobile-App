import React, { useState, useEffect, useRef } from "react";
import { Animated, View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Task } from "@/types/Task";
import { tasksService } from "@/services/tasksService";
import { colors, spacing, typography } from "@/styles";

type Step = "OPTIONS" | "CONFIRM" | "SUCCESS";
type DeleteOption = "OCCURRENCE" | "ALL";

type Props = {
    task: Task | null;
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export default function TaskDeleteModal({ task, visible, onClose, onSuccess }: Props) {
    const isRecurring = task?.type === "WEEKLY" || task?.type === "MONTHLY";

    const [step, setStep] = useState<Step>(isRecurring ? "OPTIONS" : "CONFIRM");
    const [deleteOption, setDeleteOption] = useState<DeleteOption>("OCCURRENCE");
    const [loading, setLoading] = useState(false);
    const slideAnim = useRef(new Animated.Value(900)).current;

    useEffect(() => {
        if (visible && task) {
            const recurring = task.type === "WEEKLY" || task.type === "MONTHLY";
            setStep(recurring ? "OPTIONS" : "CONFIRM");
            setDeleteOption("OCCURRENCE");
            slideAnim.setValue(900);
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        }
    }, [visible, task?.id]);

    const slideDown = (cb?: () => void) => {
        Animated.timing(slideAnim, {
            toValue: 900,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            cb?.();
        });
    };

    const switchStep = (next: Step) => {
        Animated.timing(slideAnim, {
            toValue: 900,
            duration: 220,
            useNativeDriver: true,
        }).start(() => {
            setStep(next);
            slideAnim.setValue(900);
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        });
    };

    const handleDelete = async () => {
        if (!task) return;
        setLoading(true);
        try {
            if (!isRecurring || deleteOption === "ALL") {
                await tasksService.deleteTask(task.id);
            } else {
                await tasksService.updateTask(task.id, { disable: true } as any);
            }
            switchStep("SUCCESS");
        } catch {
            // keep step as is so user can retry
        } finally {
            setLoading(false);
        }
    };

    const handleFinish = () => {
        slideDown(() => {
            onSuccess();
            onClose();
        });
    };

    const handleClose = () => {
        slideDown(onClose);
    };

    if (!visible || !task) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
            <View style={styles.overlay}>
                <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
                    {step === "OPTIONS" && (
                        <View style={styles.content}>
                            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                                <Ionicons name="close" size={20} color="#2F2F2F" />
                            </TouchableOpacity>

                            <View style={styles.iconContainer}>
                                <Ionicons name="trash" size={40} color="#FD618C" />
                            </View>

                            <Text style={styles.title}>Supprimer une tâche récurrente</Text>
                            <Text style={styles.body}>
                                {"Cette tâche fait "}
                                <Text style={styles.bodyBold}>{"partie d'une récurrence. "}</Text>
                                {"Souhaitez-vous supprimer uniquement cette occurrence ou toutes les répétitions à venir ?"}
                            </Text>

                            <TouchableOpacity
                                style={[styles.option, deleteOption === "OCCURRENCE" && styles.optionSelected]}
                                onPress={() => setDeleteOption("OCCURRENCE")}
                            >
                                <Text style={[styles.optionText, deleteOption === "OCCURRENCE" && styles.optionTextSelected]}>
                                    Supprimer cette occurence uniquement
                                </Text>
                                <Ionicons
                                    name={deleteOption === "OCCURRENCE" ? "radio-button-on" : "radio-button-off"}
                                    size={24}
                                    color={deleteOption === "OCCURRENCE" ? colors.primary[100] : colors.carbon[20]}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.option, deleteOption === "ALL" && styles.optionSelected]}
                                onPress={() => setDeleteOption("ALL")}
                            >
                                <Text style={[styles.optionText, deleteOption === "ALL" && styles.optionTextSelected]}>
                                    Supprimer toute les répétitions à venir
                                </Text>
                                <Ionicons
                                    name={deleteOption === "ALL" ? "radio-button-on" : "radio-button-off"}
                                    size={24}
                                    color={deleteOption === "ALL" ? colors.primary[100] : colors.carbon[20]}
                                />
                            </TouchableOpacity>

                            <View style={styles.row}>
                                <TouchableOpacity style={[styles.btn, styles.btnGrey, { flex: 1 }]} onPress={handleClose}>
                                    <Text style={styles.btnGreyText}>Annuler</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.btn, styles.btnPink, { flex: 1 }]} onPress={() => switchStep("CONFIRM")}>
                                    <Text style={styles.btnWhiteText}>Confirmer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {step === "CONFIRM" && (
                        <View style={styles.content}>
                            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                                <Ionicons name="close" size={20} color="#2F2F2F" />
                            </TouchableOpacity>

                            <View style={styles.iconContainer}>
                                <Ionicons name="trash" size={40} color="#FD618C" />
                            </View>

                            <Text style={styles.title}>Confirmer la suppression</Text>
                            <Text style={styles.body}>
                                Êtes vous sûr de supprimer cette tâche ? Cette action est définitive et n'est pas réversible.
                            </Text>

                            <View style={styles.col}>
                                <TouchableOpacity style={[styles.btn, styles.btnPink, { width: "100%" }]} onPress={handleDelete} disabled={loading}>
                                    {loading ? (
                                        <ActivityIndicator color={colors.white} />
                                    ) : (
                                        <Text style={styles.btnWhiteText}>Supprimer cette tâche</Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.btn, styles.btnGrey, { width: "100%" }]}
                                    onPress={() => (isRecurring ? switchStep("OPTIONS") : handleClose())}
                                >
                                    <Text style={styles.btnGreyText}>Annuler</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {step === "SUCCESS" && (
                        <View style={styles.content}>
                            <TouchableOpacity style={styles.closeBtn} onPress={handleFinish}>
                                <Ionicons name="close" size={20} color="#2F2F2F" />
                            </TouchableOpacity>

                            <View style={[styles.iconContainer, { backgroundColor: "rgba(254,160,186,0.4)" }]}>
                                <Ionicons name="checkmark-circle" size={40} color="#FD618C" />
                            </View>

                            <Text style={styles.title}>La tâche a été supprimée !</Text>

                            <TouchableOpacity style={[styles.btn, styles.btnPrimary, { width: "100%" }]} onPress={handleFinish}>
                                <Text style={styles.btnWhiteText}>Terminer</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(47,47,47,0.3)",
        justifyContent: "flex-end",
    },
    sheet: {
        backgroundColor: colors.white,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 40,
        overflow: "hidden",
    },
    content: {
        padding: 16,
        paddingTop: 24,
        gap: 16,
        alignItems: "center",
    },
    closeBtn: {
        position: "absolute",
        top: 16,
        right: 16,
        backgroundColor: "#D5D5D5",
        borderRadius: 8,
        padding: 12,
    },
    iconContainer: {
        backgroundColor: "rgba(254,160,186,0.4)",
        padding: 16,
        borderRadius: 16,
        marginTop: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        ...typography.bold,
        fontSize: 20,
        color: colors.carbon[100],
        textAlign: "center",
    },
    body: {
        ...typography.regular,
        fontSize: 14,
        color: colors.carbon[100],
        textAlign: "center",
        lineHeight: 20,
    },
    bodyBold: {
        fontWeight: "700",
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderColor: colors.carbon[20],
        borderRadius: 8,
        paddingLeft: 20,
        paddingRight: 12,
        paddingVertical: 12,
        width: "100%",
        gap: spacing.md,
    },
    optionSelected: {
        backgroundColor: colors.primary[10],
        borderColor: colors.primary[100],
    },
    optionText: {
        flex: 1,
        ...typography.regular,
        fontSize: 14,
        color: colors.carbon[100],
    },
    optionTextSelected: {
        fontWeight: "700",
    },
    row: {
        flexDirection: "row",
        gap: spacing.base,
        width: "100%",
        paddingBottom: 8,
    },
    col: {
        flexDirection: "column",
        gap: spacing.base,
        width: "100%",
        alignItems: "center",
        paddingBottom: 8,
    },
    btn: {
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: spacing.base,
        alignItems: "center",
        justifyContent: "center",
    },
    btnPink: {
        backgroundColor: "#FD618C",
        shadowColor: "#D1325E",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    btnPrimary: {
        backgroundColor: colors.primary[100],
        shadowColor: "#4E31CF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    btnGrey: {
        backgroundColor: "#D5D5D5",
    },
    btnWhiteText: {
        ...typography.bold,
        fontSize: 16,
        color: colors.white,
    },
    btnGreyText: {
        ...typography.bold,
        fontSize: 16,
        color: "#6A6A6A",
    },
});
