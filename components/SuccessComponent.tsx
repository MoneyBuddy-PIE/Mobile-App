import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons";

type IProps = {
    title: string
    subTitle: string
    buttonText?: string
    onClose?: () => void
    image?: ImageSourcePropType
    showHeader?: boolean
}

const SuccessComponent =  ({
    title,
    subTitle,
    buttonText = "Terminer",
    onClose,
    image = require("@/assets/images/pig_success.png"),
    showHeader = false
}:IProps) => {

    return (
        <View style={styles.container} >
            
            {/* Header */}
            {showHeader && 
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => onClose && onClose()}>
                        <Ionicons name="close" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            }
            
            {/* Content */}
            <View style={styles.contentContainer}>
                <Text style={styles.contentTitle} >{title}</Text>
                <Text style={styles.contentSubTitle} >{subTitle}</Text>
                <Image style={styles.contentImage} source={image} />
            </View>
            
            {/* Footer */}
            <View style={styles.footer} >
                <TouchableOpacity
                    style={[styles.buttonContainer, {backgroundColor: "#16AA75"}]}
                    onPress={() => onClose && onClose()}
                >
                    <Text style={styles.buttonText} >{buttonText}</Text>
                </TouchableOpacity>
            
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
    },
    // Header
    headerContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "flex-end"
    },
    closeButton: {
        width: 36,
        height: 36,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    //Content
    contentContainer: {
        paddingHorizontal: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        justifyContent: "center",
        alignItems: "center"
    },
    contentTitle: {
        fontWeight: 700,
        fontSize: 24,
        color: "#2F2F2F"
    },
    contentSubTitle: {
        fontWeight: 400,
        fontSize: 16,
        color: "#2F2F2F",
        textAlign: "center"
    },
    contentImage: {
        marginTop: 24
    },
     // Footer
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 16,
    },
    buttonContainer: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#005C49",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
})

export default SuccessComponent