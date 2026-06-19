import { ActivityIndicator, View, Text, StyleSheet } from "react-native";

type IProps = {
    loadingText?: string;
};

const Loader = ({ loadingText = "Chargement" }: IProps) => {
    const fontStylesRegular = { fontFamily: "DMSans_400Regular" };

    return (
        <View style={[styles.container, styles.center]}>
            <ActivityIndicator size="large" color="#6C5CE7" />
            <Text style={[styles.loadingText, fontStylesRegular]}>{loadingText}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
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
});

export default Loader;
