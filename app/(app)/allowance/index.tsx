import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AllowanceForm from "@/components/forms/AllowanceForm";
import { theme, typography } from "@/styles";
import { useAuthContext } from "@/contexts/AuthContext";
import { SubAccount } from "@/types/Account";

const Allowance = () => {
    const params = useLocalSearchParams();
    const { user } = useAuthContext();

    const paramChildId = params.childId as string | undefined;
    const paramChildName = params.childName as string | undefined;

    const childAccounts: SubAccount[] = user?.subAccounts?.filter((a) => a.role === "CHILD") ?? [];

    const [selectedChild, setSelectedChild] = useState<SubAccount | null>(
        paramChildId && paramChildName ? ({ id: paramChildId, name: paramChildName } as SubAccount) : null,
    );
    const [showForm, setShowForm] = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 100,
                useNativeDriver: true,
            }).start();
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    const handlePrimary = () => {
        if (selectedChild) {
            setShowForm(true);
        } else {
            setShowPicker(true);
        }
    };

    if (showForm && selectedChild) {
        return (
            <SafeAreaView style={styles.formContainer}>
                <View style={styles.formHeader}>
                    <Text style={styles.formTitle}>Argent de poche régulier</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                        <Ionicons name="close" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
                <AllowanceForm childId={selectedChild.id} childName={selectedChild.name} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Back button */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Text block */}
            <View style={styles.textBlock}>
                <Text style={styles.title}>Lancez sa routine d'argent de poche !</Text>
                <Text style={styles.subtitle}>Et accompagnez-le dans ses premières habitudes financières.</Text>
            </View>

            {/* Illustration */}
            <View style={styles.illustrationContainer}>
                <View style={styles.blob} />
                <Animated.View style={[styles.imageWrapper, { transform: [{ scale: scaleAnim }] }]}>
                    <Image source={require("@/assets/images/allowance_index.png")} style={styles.image} resizeMode="contain" />
                </Animated.View>
            </View>

            {/* Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.primaryButton} onPress={handlePrimary}>
                    <Text style={styles.primaryButtonText}>Allons-y !</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
                    <Text style={styles.secondaryButtonText}>Je le ferai plus tard</Text>
                </TouchableOpacity>
            </View>

            {/* Child picker (only when coming from home without a pre-selected child) */}
            <Modal visible={showPicker} transparent animationType="fade" onRequestClose={() => setShowPicker(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPicker(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Pour quel enfant ?</Text>
                        {childAccounts.map((child) => (
                            <TouchableOpacity
                                key={child.id}
                                style={styles.modalOption}
                                onPress={() => {
                                    setSelectedChild(child);
                                    setShowPicker(false);
                                    setShowForm(true);
                                }}
                            >
                                <Text style={styles.modalOptionText}>{child.name}</Text>
                                <Ionicons name="chevron-forward" size={18} color={theme.colors.carbon[60]} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.blue[60],
    },
    formContainer: {
        flex: 1,
        backgroundColor: theme.colors.white,
    },
    formHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: theme.colors.carbon[100],
        flex: 1,
    },
    closeButton: {
        width: 36,
        height: 36,
        backgroundColor: "rgba(0,0,0,0.8)",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 8,
    },
    backButton: {
        width: 48,
        height: 48,
        backgroundColor: theme.colors.carbon[100],
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    textBlock: {
        marginTop: 32,
        paddingHorizontal: 24,
        alignItems: "center",
        gap: 8,
    },
    title: {
        fontFamily: "Corben_400Regular",
        fontSize: 36,
        color: theme.colors.carbon[100],
        textAlign: "center",
        lineHeight: 44,
    },
    subtitle: {
        fontFamily: "PlusJakartaSans_400Regular",
        fontSize: 16,
        color: theme.colors.carbon[100],
        textAlign: "center",
        lineHeight: 22,
    },
    illustrationContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    blob: {
        position: "absolute",
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: "rgba(255,255,255,0.25)",
    },
    imageWrapper: {
        width: 194,
        height: 194,
    },
    image: {
        width: 194,
        height: 194,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        gap: 12,
    },
    primaryButton: {
        backgroundColor: theme.colors.primary[100],
        borderRadius: 8,
        paddingVertical: 20,
        alignItems: "center",
        shadowColor: "#4e31cf",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    primaryButtonText: {
        ...typography.bold,
        fontSize: 20,
        color: theme.colors.white,
    },
    secondaryButton: {
        backgroundColor: theme.colors.carbon[20],
        borderRadius: 8,
        paddingVertical: 20,
        alignItems: "center",
    },
    secondaryButtonText: {
        ...typography.bold,
        fontSize: 20,
        color: theme.colors.carbon[60],
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        padding: 20,
        width: "80%",
        gap: 8,
    },
    modalTitle: {
        ...typography.bold,
        fontSize: 18,
        color: theme.colors.carbon[100],
        marginBottom: 8,
    },
    modalOption: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: theme.colors.screenBackground,
    },
    modalOptionText: {
        ...typography.semiBold,
        fontSize: 16,
        color: theme.colors.carbon[100],
    },
});

export default Allowance;
