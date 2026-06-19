import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Modal, Pressable, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type IProps = {
    visible: boolean;
    onClose: () => void;
    backgroundColor?: string;
    custom?: boolean;
    children: React.ReactNode;
};

const ModalComponent = ({ visible, onClose, children, backgroundColor = "#EBF2FB", custom }: IProps) => {
    return (
        <Modal transparent visible={visible} animationType="slide">
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Pressable style={styles.overlay} onPress={onClose}>
                    <Pressable
                        style={[styles.contentSetup, custom ? styles.contentSetupMargin : styles.height, { backgroundColor: backgroundColor }]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <Pressable style={styles.backButton} onPress={onClose}>
                                <Ionicons name="close" size={24} color="#fff" />
                            </Pressable>
                        </View>

                        {/* Content */}
                        {children}
                    </Pressable>
                </Pressable>
            </GestureHandlerRootView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    contentSetup: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: "#EBF2FB",
        paddingVertical: 20,
    },
    contentSetupMargin: {
        marginHorizontal: 20,
        marginBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    height: {
        height: "75%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingTop: 10,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        backgroundColor: "#333",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default ModalComponent;
