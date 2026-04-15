import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { router } from "expo-router";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Alert, Modal, FlatList } from "react-native";
import { DMSans_700Bold, DMSans_400Regular, DMSans_600SemiBold } from "@expo-google-fonts/dm-sans";
import { UserStorage } from "@/utils/storage";
import { SubAccount } from "@/types/Account";
import { userService } from "@/services/userService";
import icons from "@/styles/icons";


const getUri = (iconStyle: string, iconName: string) => {
    return `https://api.dicebear.com/9.x/${iconStyle}/png?seed=${iconName}`
}

export default function ProfileForm() {
    const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
	const [name, setName] = useState<string>(subAccount?.name || "");
    const [icon, setIcon] = useState<{iconStyle: string, iconName: string}>({iconStyle: subAccount?.iconStyle ?? "bottts-neutral", iconName: subAccount?.iconName ?? "Mason"});
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);

    const [fontsLoaded] = useFonts({
		DMSans_700Bold,
		DMSans_400Regular,
		DMSans_600SemiBold,
	});


    const fontStylesTitle = fontsLoaded ? { fontFamily: "DMSans_700Bold" } : {};
	const fontStylesRegular = fontsLoaded ? { fontFamily: "DMSans_400Regular" } : {};
	const fontStylesSemiBold = fontsLoaded ? { fontFamily: "DMSans_600SemiBold" } : {};

    useEffect(() => {
		loadSubAccount();
	}, []);

    const loadSubAccount = async () => {
		try {
			const subAccountData = await UserStorage.getSubAccount();
            setSubAccount(subAccountData);

            setName(subAccountData?.name || "");
            setIcon({iconStyle: subAccountData?.iconStyle || "bottts-neutral", iconName: subAccountData?.iconName || "Mason"});
		} catch (error) {
			console.error("Error loading sub-account:", error);
		}
	};

	const handleCancel = () => {
		router.back();
	};

    const validateForm = () => {
		if (!name.trim()) {
			Alert.alert("Erreur", "Veuillez saisir un nom");
			return false;
		}
		return true;
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;

		setLoading(true);
		try {
			await userService.updateSubAccount({
				name: name.trim(),
                iconName: icon.iconName,
                iconStyle: icon.iconStyle
			});
			Alert.alert("Succès", "Compte modifié avec succès", [{ text: "OK", onPress: () => router.back() }]);
		} catch (error: any) {
			console.error("Error updating sub-account:", error);
			Alert.alert("Erreur", error.response?.data?.message || "Impossible de créer le compte");
		} finally {
			setLoading(false);
		}
	};


    // Vérifier si le formulaire est valide
	const isFormValid = () => {
		if (!name.trim()) return false;
		return true
	};

    return (
		<SafeAreaView style={styles.container}>
            {/* Header */}
			<View style={styles.header}>
				<TouchableOpacity style={styles.backButton} onPress={handleCancel}>
					<Ionicons name="arrow-back" size={20} color="#fff" />
				</TouchableOpacity>
				<Text style={[styles.headerTitle, fontStylesTitle]}>Profile</Text>
				<View style={styles.placeholder} />
			</View>

            {visible 
                && <ModalProfilePicture 
                    visible={visible} 
                    onClose={() => setVisible(false)} 
                    changeAvatar={(iconStyle, iconName) => setIcon({ iconStyle, iconName })} 
                    />
            }

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Description */}
				<View style={styles.descriptionContainer}>
					<Text style={[styles.subtitle, fontStylesRegular]}>
						Modifier votre profil !
					</Text>
				</View>

                {/* Profile picture */}
				<View style={{...styles.section, ...styles.sectionCenter}}>
					<TouchableOpacity style={styles.imageContainer} onPress={() => setVisible(true)}>
						<Image 
                            style={styles.image}
                            source={{ uri: getUri(icon.iconStyle, icon.iconName) }}
                        />
                        <View style={styles.editIcon}>
                            <Ionicons name="pencil" size={24} color="#fff" />
                        </View>
					</TouchableOpacity>
				</View>

                {/* Nom */}
				<View style={styles.section}>
					<Text style={[styles.sectionLabel, fontStylesSemiBold]}>Nom du profil</Text>
					<View style={styles.inputContainer}>
						<TextInput
							style={[styles.textInput, fontStylesRegular]}
							value={name}
							onChangeText={setName}
							autoCapitalize="words"
							maxLength={50}
						/>
					</View>
				</View>
            </ScrollView>

            {/* Bouton de création */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.createButton,
                        (!isFormValid() || loading) && styles.createButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!isFormValid() || loading}
                >
                    <Text style={[styles.createButtonText, fontStylesSemiBold]}>
                        {loading ? "Modification en cours..." : "Modifier le compte"}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const ModalProfilePicture = ({ visible, onClose, changeAvatar }: { visible: boolean; onClose: () => void,  changeAvatar: (iconStyle: string, iconName: string) => void; }) => {
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
 
    return (
        <Modal transparent visible={visible} animationType="slide" >
            {/* Overlay cliquable pour fermer */}
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                {/* Sheet */}
                <TouchableOpacity
                    style={styles.sheet}
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.headerTitle]}>Choisissez un avatar</Text>
                        <TouchableOpacity style={styles.backButton} onPress={onClose}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
 
                    {/* Contenu scrollable */}
                    <FlatList
                        data={icons}
                        keyExtractor={(item) => item.iconStyle}
                        scrollEnabled={true}
                        nestedScrollEnabled={true}
                        renderItem={({ item: icon }) => (
                            <View style={styles.iconGroup}>
                                {/* Nom de l'avatar */}
                                <Text style={[{...styles.sectionLabel}]}>
                                    {icon.label}
                                </Text>
 
                                {/* Grille d'avatars */}
                                <View style={styles.avatarGrid}>
                                    {icon.iconName.map((name) => (
                                        <TouchableOpacity
                                            key={name}
                                            style={[
                                                styles.avatarContainer,
                                                selectedStyle === name + icon.iconName && styles.avatarContainerSelected
                                            ]}
                                            onPress={() => {
                                                setSelectedStyle(name);
                                                changeAvatar(icon.iconStyle, name);
                                            }}
                                            disabled={loading}
                                        >
                                            <Image
                                                style={styles.avatarImage}
                                                source={{ uri: getUri(icon.iconStyle, name) }}
                                            />
                                            {/* Checkmark si sélectionné */}
                                            {selectedStyle === name && (
                                                <View style={styles.checkmark}>
                                                    <Ionicons name="checkmark" size={16} color="#fff" />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};
 

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
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},
	backButton: {
		width: 44,
		height: 44,
		backgroundColor: "#333",
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
	},
	placeholder: {
		width: 44,
	},
    content: {
		flex: 1,
		paddingHorizontal: 20,
	},
    descriptionContainer: {
		paddingVertical: 24,
		alignItems: "center",
	},
	subtitle: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
		lineHeight: 22,
	},
    section: {
		marginBottom: 32,
	},
    sectionCenter: {
        width: "100%",
        display: "flex",
        alignItems: "center",
    },
	sectionLabel: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		marginBottom: 8,
	},
	sectionDescription: {
		fontSize: 14,
		color: "#666",
		marginBottom: 16,
		lineHeight: 20,
	},
	inputContainer: {
		backgroundColor: "#fff",
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#e0e0e0",
		shadowColor: "#BFD0EA",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.6,
		shadowRadius: 0,
		elevation: 2,
	},
	textInput: {
		fontSize: 16,
		color: "#333",
		paddingHorizontal: 16,
		paddingVertical: 16,
	},
    imageContainer: {
		width: 110,
		height: 110,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
    },
    image: {
        width: "100%",
        height: "100%",
        borderWidth: 5,
        borderColor:   "#6C5CE7",
	},
    editIcon: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#6C5CE7",
        padding: 4,
        justifyContent: "center",
        alignItems: "center",
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },  
    sheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: "75%",
    },
    iconGroup: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    avatarGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        justifyContent: "flex-start",
    },
    avatarContainer: {
        width: "30%",
        aspectRatio: 1,
        overflow: "hidden",
        borderWidth: 6,
        borderColor: "transparent",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    avatarContainerSelected: {
        borderColor: "#6C5CE7",
        backgroundColor: "rgba(108, 92, 231, 0.1)",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
    },
    checkmark: {
        position: "absolute",
        bottom: 4,
        right: 4,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#6C5CE7",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fff",
    },

    footer: {
		paddingHorizontal: 20,
		paddingBottom: 20,
		paddingTop: 16,
		backgroundColor: "#fff",
		borderTopWidth: 1,
		borderTopColor: "#e0e0e0",
	},
	createButton: {
		backgroundColor: "#6C5CE7",
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
		shadowOpacity: 0,
		elevation: 0,
	},
	createButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
})