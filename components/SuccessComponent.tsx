import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"

type IProps = {
    title: string
    subTitle: string
    buttonText?: string
    onClose?: () => void
}

const SuccessComponent =  ({
    title,
    subTitle,
    buttonText = "Terminer",
    onClose
}:IProps) => {

    return (
        <View style={styles.container} >

            {/* Content */}
            <View style={styles.contentContainer}>
                <Text style={styles.contentTitle} >{title}</Text>
                <Text style={styles.contentSubTitle} >{subTitle}</Text>
                <Image style={styles.contentImage} source={require('@/assets/images/pig_success.png')} />
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
    //Content
    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
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
        color: "#2F2F2F"
    },
    contentImage: {
        marginTop: 24
    },
     // Footer
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 16,
        backgroundColor: "#FFFFFF"
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