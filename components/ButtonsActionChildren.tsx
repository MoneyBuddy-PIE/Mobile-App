import { StyleSheet, TouchableOpacity, View, Text, Button } from "react-native"
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { router } from "expo-router";
import ModalComponent from "./Modal";
import SpendForm from "./forms/SpendForm";
import { SubAccount } from "@/types/Account";

enum ButtonType {
    SPEND = 'SPEND',
    SAVE = 'SAVE',
    SCAN = 'SCAN'
}

const buttons = [
    { type: ButtonType.SPEND, label: "Dépenser", iconName: "wallet", color: "#FD618C", shadowColor: "#D1325E"},
    { type: ButtonType.SAVE, label: "Économiser", iconName: "wallet", color: "#846DED", shadowColor: "#4E31CF"},
]
const buttonWithScan = [...buttons, { type: ButtonType.SCAN, label: "Scanner", iconName: "wallet", color: "#16AA75", shadowColor: "#005C49"}]

type IProps = {
    subAccount: SubAccount
    labelPosition?: "outside" | "inside"
    addScan?: boolean
}

const ButtonsActionChildren = ({subAccount, labelPosition = "inside", addScan = false} : IProps) => {
    const list = addScan ? buttonWithScan : buttons

    const [showModal, setShowModal] = useState<ButtonType.SPEND | null>(null)
    const [modalBackgroundColor, setModalBackgroundColor] = useState<string>("#FFFFFF")

    const handleButtonClick = (type: string) => {
        if (type === ButtonType.SPEND)
            setShowModal(ButtonType.SPEND)

        if (type === ButtonType.SAVE)
            router.push('/(app)/payment')

        if (type === ButtonType.SCAN)
            console.log(type)
    }
    
    return (
        <>
        {showModal === ButtonType.SPEND &&
            <ModalComponent visible={showModal === ButtonType.SPEND} onClose={() => setShowModal(null)} backgroundColor={modalBackgroundColor} >
                <SpendForm subAccountId={subAccount.id} onFn={() => setModalBackgroundColor("#EBF2FB")}/>
            </ModalComponent>
        }

        <View style={[styles.row, {paddingHorizontal: 8}]}>
            {list.map((button) => (
                <View style={styles.column} key={button.label}>
                    <TouchableOpacity
                        onPress={() => handleButtonClick(button.type)}
                        style={[styles.button, {backgroundColor: button.color, shadowColor: button.shadowColor}]}
                    >
                        <Ionicons name={button.iconName as keyof typeof Ionicons.glyphMap} color={"#FFFFFF"} size={32}/>
                        {labelPosition == "inside" && 
                            <Text  style={[styles.labelText, {color: "#FFFFFF", fontSize: 16}]}>{button.label}</Text>}
                    </TouchableOpacity>
                    
                    {labelPosition == "outside" && 
                        <Text style={[styles.labelText, {color: "#2F2F2F", fontSize: 14}]}>{button.label}</Text>}
                </View>
            ))}
        </View>
        </>
    )
}

const styles = StyleSheet.create({
    row: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
    },
    column: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 8
    },
    button: {
        display: "flex",
        flexDirection: "row",
        gap: 4,
        alignItems: "center",
        padding: 12,
        borderRadius: 8,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    labelText: {
        fontWeight: 700,
    }
})

export default ButtonsActionChildren