import { View, TouchableOpacity, StyleSheet, Text, Pressable, Alert } from "react-native"
import ModalComponent from "../Modal"
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { tasksService } from "@/services/tasksService";

enum ModalSteps {
    HIDE = "HIDE",
    OPTIONS = "OPTIONS",
    CONFIRME = "CONFIRME",
    CLOSE = "CLOSE"
}

type IProps = {
    taskId: string
    shadow?: boolean
}

const TaskDelete = ({taskId, shadow = true}: IProps) => {
    const [showFrequencyModal, setShowFrequencyModal] = useState<ModalSteps>(ModalSteps.HIDE);
    const [loading, setLoading] = useState<boolean>(false)
    const [deleteOption, setDeleteOption] = useState<"DELETE_OCCURENCE" | "DELETE">("DELETE_OCCURENCE")

    const handleDeleteTask = async() => {
        try {
            setLoading(true)
            if (deleteOption === 'DELETE')
                await tasksService.deleteTask(taskId)

            if (deleteOption === "DELETE_OCCURENCE")
                await tasksService.updateTask(taskId, {disable: true})

        } catch (error: any) {
			console.error("Error creating task:", error);
			const errorMessage = error.response?.data?.message || "Impossible de créer la tâche";
			Alert.alert("Erreur", errorMessage);
		} finally {
			setLoading(false);
            setShowFrequencyModal(ModalSteps.CLOSE)
		}
    }


    return (
        <>
        <TouchableOpacity
            style={[
                styles.button,
                shadow && styles.buttonShadow,
                {backgroundColor: "#FD618C", shadowColor: "#D1325E"}
            ]}
            onPress={() => {setShowFrequencyModal(ModalSteps.OPTIONS)}}
        >
            <View>
                <Ionicons name="trash-outline" size={20} color={"#FFFFFF"}/>
            </View>
        </TouchableOpacity>  

            {/* Options Modal */}
            {showFrequencyModal === ModalSteps.OPTIONS &&
                <ModalComponent visible={showFrequencyModal === ModalSteps.OPTIONS} onClose={() => setShowFrequencyModal(ModalSteps.HIDE)} backgroundColor="#FFFFFF" custom={true}>
                    <View style={styles.modalContainer}> 
                        <ModalIcon />
                        <Text style={styles.modalTitle}>Supprimer une tâche récurrente</Text>
                        <Text style={styles.modalText}>Cette tâche fait partie d'une récurrence. Souhaitez-vous supprimer uniquement cette occurrence ou toutes les répétitions à venir ?</Text>
                        <Pressable
                            style={[deleteOption === "DELETE_OCCURENCE" ? styles.inputContainerSelected : styles.inputContainer, {paddingVertical: 12}]}
                            onPress={() => {setDeleteOption("DELETE_OCCURENCE")}}
                        >
                            <Text style={[styles.textInput, {fontWeight: deleteOption === "DELETE_OCCURENCE" ? "700" : "400"}]}>Supprimer cette occurence uniquement</Text>
                            <Ionicons 
								name={deleteOption === "DELETE_OCCURENCE" ? "ellipse" : "ellipse-outline" } size={20} color={deleteOption === "DELETE_OCCURENCE" ? "#846DED" : "#D5D5D5"}
							/>
                        </Pressable>
                        <Pressable
                            style={[deleteOption === "DELETE" ? styles.inputContainerSelected : styles.inputContainer, {paddingVertical: 12}]}
                            onPress={() => {setDeleteOption("DELETE")}}
                        >
                            <Text style={[styles.textInput, {fontWeight: deleteOption === "DELETE" ? "700" : "400"}]}>Supprimer toute les répétitions à venir</Text>
                            <Ionicons 
								name={deleteOption === "DELETE" ? "ellipse" : "ellipse-outline" } size={20} color={deleteOption === "DELETE" ? "#846DED" : "#D5D5D5"}
							/>
                        </Pressable>
                        <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%"}}>
                            <Pressable
                                style={[
                                    styles.button,
                                    {backgroundColor: "#D5D5D5", width: "47%"}
                                ]}
                                onPress={() => {setShowFrequencyModal(ModalSteps.CLOSE)}}
                            >
                                <Text style={[styles.buttonText, {color: "#6A6A6A"}]}>Annuler</Text>
                            </Pressable>
                        
                            <Pressable
                                style={[
                                    styles.button,
                                    styles.buttonShadow,
                                    {backgroundColor: "#FD618C", shadowColor: "#D1325E", width: "47%"}
                                ]}
                                onPress={() => {setShowFrequencyModal(ModalSteps.CONFIRME)}}
                            >
                                <Text style={[styles.buttonText, {color: "#FFFFFF"}]}>Confirmer</Text>
                            </Pressable>
                        </View>
                    </View>
                </ModalComponent>
            }

            {/* Confirme Modal */}
            {showFrequencyModal === ModalSteps.CONFIRME && 
                <ModalComponent visible={showFrequencyModal === ModalSteps.CONFIRME} onClose={() => setShowFrequencyModal(ModalSteps.HIDE)} backgroundColor="#FFFFFF" custom={true}>
                    <View style={styles.modalContainer}> 
                        <ModalIcon />
                        <Text style={styles.modalTitle}>Confirmer la suppression</Text>
                        <Text style={styles.modalText}>Êtes vous sûr de supprimer cette tâche ? Cette action est définitive et n’est pas réversible.</Text>
                        <View style={{display: "flex", flexDirection: "column", gap: 16, alignItems: "center", width: "100%"}}>
                            <Pressable
                                style={[
                                    styles.button,
                                    styles.buttonShadow,
                                    {backgroundColor: "#FD618C", shadowColor: "#D1325E", width: "100%"}
                                ]}
                                onPress={() => {handleDeleteTask()}}
                            >
                                <Text style={[styles.buttonText, {color: "#FFFFFF"}]}>{loading ? "Suppression..." : "Supprimer cette tâche"}</Text>
                            </Pressable>
                            <Pressable
                                style={[
                                    styles.button,
                                    {backgroundColor: "#D5D5D5", shadowColor: "#6A6A6A", width: "100%"}
                                ]}
                                onPress={() => {setShowFrequencyModal(ModalSteps.OPTIONS)}}
                            >
                                <Text style={[styles.buttonText, {color: "#FFFFFF"}]}>Annuler</Text>
                            </Pressable>
                        </View>
                    </View>
                </ModalComponent>
            }

            {/* Close Modal */}
            {showFrequencyModal === ModalSteps.CLOSE && 
                <ModalComponent visible={showFrequencyModal === ModalSteps.CLOSE} onClose={() => setShowFrequencyModal(ModalSteps.HIDE)} backgroundColor="#FFFFFF" custom={true}>
                    <View style={styles.modalContainer}> 
                        <ModalIcon isDeleted={true} />
                        <Text style={styles.modalTitle}>La tâche a été supprimée !</Text>
                        <Pressable
                            style={[
                                styles.button,
                                styles.buttonShadow,
                                {backgroundColor: "#846DED", shadowColor: "#4E31CF", width: "100%"}
                            ]}
                            onPress={() => {setShowFrequencyModal(ModalSteps.HIDE); router.back()}}
                        >
                            <Text style={[styles.buttonText, {color: "#FFFFFF"}]}>Terminer</Text>
                        </Pressable>
                    </View>
                </ModalComponent>
            }
        </>
    )
}

const ModalIcon = ({isDeleted = false}:{isDeleted?: boolean}) => (
    <View style={{backgroundColor: "#FEA0BA66", padding: 16, borderRadius: 16}}>
        {isDeleted ?
            <Ionicons name="checkmark-outline" size={40} color={"#D1325E"}/>
            : <Ionicons name="trash-outline" size={40} color={"#D1325E"}/>
        }
    </View>
)

const styles = StyleSheet.create({
    button: {
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        display: "flex",
        alignItems: "center",
    },
    buttonShadow: {
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
        fontWeight: "700"
    },
    modalContainer: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        paddingHorizontal: 20,
    },
    modalTitle: {
        fontWeight: "700",
        fontSize: 20,
        textAlign: 'center'
    },
    modalText: {
        fontWeight: "400",
        fontSize: 14,
        textAlign: 'center'
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
})

export default TaskDelete