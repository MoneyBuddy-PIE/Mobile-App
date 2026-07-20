import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Dimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { receiptService } from "@/services/receiptService";
import { ReceiptRow } from "@/types/Receipt";
import { logger } from "@/utils/logger";
import SpendReceipt from "@/components/SpendReceipt";
import { colors, typography, spacing } from "@/styles";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ScanReceiptSheetProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const parseReceiptDate = (value: string): Date => {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
};

export default function ScanReceiptSheet({ visible, onClose, onSuccess }: ScanReceiptSheetProps) {
    const [step, setStep] = useState<"picker" | "loading" | "receipt">("picker");
    const [scannedReceipt, setScannedReceipt] = useState<ReceiptRow | null>(null);

    const resetForm = () => {
        setStep("picker");
        setScannedReceipt(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleScan = async (uri: string) => {
        setStep("loading");
        try {
            const result = await receiptService.scanReceipt(uri);
            if (result.success && result.data && result.data.receipts.length > 0) {
                setScannedReceipt(result.data.receipts[0]);
                setStep("receipt");
                onSuccess?.();
            } else {
                Alert.alert("Erreur", result.message || "Impossible de scanner le reçu");
                setStep("picker");
            }
        } catch (error) {
            logger.error("Error scanning receipt:", error);
            Alert.alert("Erreur", "Une erreur inattendue s'est produite");
            setStep("picker");
        }
    };

    const handleTakePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission requise", "Autorise l'accès à la caméra pour scanner un reçu");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
            preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
        });
        if (!result.canceled && result.assets?.[0]) {
            await handleScan(result.assets[0].uri);
        }
    };

    const handlePickFromLibrary = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission requise", "Autorise l'accès à tes photos pour scanner un reçu");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.8,
            preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
        });
        if (!result.canceled && result.assets?.[0]) {
            await handleScan(result.assets[0].uri);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={styles.overlay}>
                    <View style={[styles.sheet, step === "receipt" && [styles.sheetReceipt, styles.sheetReceiptSized]]}>
                        <View style={styles.handle} />

                        {step === "picker" && (
                            <>
                                <View style={styles.header}>
                                    <Text style={styles.title}>Scanner un reçu</Text>
                                    <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                                        <Ionicons name="close" size={24} color="#fff" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.content}>
                                    <TouchableOpacity style={styles.optionBtn} onPress={handleTakePhoto}>
                                        <View style={styles.optionIcon}>
                                            <Ionicons name="camera" size={28} color="#fff" />
                                        </View>
                                        <Text style={styles.optionText}>Prendre une photo</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.optionBtn} onPress={handlePickFromLibrary}>
                                        <View style={styles.optionIcon}>
                                            <Ionicons name="images" size={28} color="#fff" />
                                        </View>
                                        <Text style={styles.optionText}>Choisir depuis la galerie</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        {step === "loading" && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={colors.primary[100]} />
                                <Text style={styles.loadingText}>Analyse du reçu en cours...</Text>
                            </View>
                        )}

                        {step === "receipt" && scannedReceipt && (
                            <>
                                <View style={styles.receiptHeader}>
                                    <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                                        <Ionicons name="close" size={24} color="#fff" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={styles.receiptContainer} showsVerticalScrollIndicator={false}>
                                    <SpendReceipt
                                        amount={String(scannedReceipt.total)}
                                        categoryEmoji="other"
                                        description={scannedReceipt.merchant_name}
                                        date={parseReceiptDate(scannedReceipt.date)}
                                    />
                                </ScrollView>

                                <View style={styles.receiptFooter}>
                                    <TouchableOpacity style={styles.validateBtn} onPress={handleClose}>
                                        <Text style={styles.validateBtnText}>Valider</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    sheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        minHeight: 420,
    },
    sheetReceiptSized: {
        height: SCREEN_HEIGHT * 0.92,
    },
    sheetReceipt: {
        backgroundColor: "#EBF2FB",
    },
    handle: {
        width: 109,
        height: 5,
        backgroundColor: "#2F2F2F",
        borderRadius: 24,
        alignSelf: "center",
        marginTop: 8,
        marginBottom: 4,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xl,
        paddingBottom: spacing.base,
    },
    title: {
        ...typography.bold,
        ...typography.xl,
        color: colors.carbon[100],
    },
    closeBtn: {
        width: 48,
        height: 48,
        backgroundColor: colors.carbon[100],
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },

    content: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing["3xl"],
        gap: spacing.base,
    },
    optionBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.base,
        backgroundColor: colors.carbon[10],
        borderWidth: 1.5,
        borderColor: colors.carbon[20],
        borderRadius: 8,
        padding: spacing.base,
    },
    optionIcon: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: "#16AA75",
        justifyContent: "center",
        alignItems: "center",
    },
    optionText: {
        ...typography.regular,
        fontSize: 16,
        color: colors.carbon[100],
    },

    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: spacing.base,
        paddingVertical: spacing["3xl"] * 2,
    },
    loadingText: {
        ...typography.regular,
        fontSize: 14,
        color: colors.carbon[70],
    },

    receiptHeader: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xl,
        paddingBottom: spacing.sm,
    },
    receiptContainer: {
        flex: 1,
    },
    receiptFooter: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing["3xl"],
        paddingTop: spacing.base,
    },
    validateBtn: {
        height: 68,
        backgroundColor: "#16AA75",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#005C49",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    validateBtnText: {
        fontFamily: "DMSans_700Bold",
        fontSize: 20,
        color: "#fff",
    },
});
