import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from "react-native";
import { useFonts } from "expo-font";
import { SafeAreaView } from "react-native-safe-area-context";
import { DMSans_700Bold, DMSans_400Regular, DMSans_600SemiBold } from "@expo-google-fonts/dm-sans";
import { router } from "expo-router";
import { TokenStorage, UserStorage } from "@/utils/storage";
import { Account, SubAccount } from "@/types/Account";
import { useAuthContext } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { logger } from "@/utils/logger";
import { Platform } from "react-native";
import { colors, spacing, typography, shadows } from "@/styles";
import { DEVICE_PLATFORM } from "@/types/api";

export default function Accounts() {
    const { user: contextUser, refreshUserData } = useAuthContext();
    const [user, setUser] = useState<Account | null>(contextUser);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [fontsLoaded] = useFonts({
        DMSans_700Bold,
        DMSans_400Regular,
        DMSans_600SemiBold,
    });

    const fontStylesTitle = fontsLoaded ? { fontFamily: "DMSans_700Bold" } : {};
    const fontStylesRegular = fontsLoaded ? { fontFamily: "DMSans_400Regular" } : {};
    const fontStylesSemiBold = fontsLoaded ? { fontFamily: "DMSans_600SemiBold" } : {};

    useEffect(() => {
        loadUserProfile();
    }, []);

    useEffect(() => {
        setUser(contextUser);
    }, [contextUser]);

    const loadUserProfile = async () => {
        try {
            await refreshUserData();
        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refreshUserData();
        } catch (error) {
            console.error("Error refreshing profile:", error);
        } finally {
            setRefreshing(false);
        }
    };

    const navigateToAccount = async (account: SubAccount) => {
        if (account.role === "CHILD") {
            try {
                const response = await authService.subAccountLogin(account.id, undefined);
                await TokenStorage.setSubAccountToken(response.token);
                const accountDetails = await userService.getSubAccount();
                await UserStorage.setSubAccount(accountDetails);
                await UserStorage.setSubAccountId(account.id);

                if (user?.id) {
                    const devicePlatform = (Platform.OS === "ios" ? "IOS" : "ANDROID") as DEVICE_PLATFORM;
                    authService.deviceLogin({ userId: user.id, token: response.token, devicePlatform }).catch(() => {});
                }

                router.replace("/(app)/home/child");
            } catch (error) {
                console.error("Error navigating to sub-account:", error);
            }
        } else {
            router.push({
                pathname: "/(app)/accounts/pin-entry",
                params: {
                    accountId: account.id,
                    accountName: account.name,
                },
            });
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role.toUpperCase()) {
            case "PARENT":
            case "OWNER":
                return "🍎";
            case "CHILD":
                return "🔸";
            case "ADMIN":
                return "👑";
            default:
                return "👤";
        }
    };

    const getRoleDisplayName = (role: string) => {
        switch (role.toUpperCase()) {
            case "OWNER":
                return "Parent";
            case "PARENT":
                return "Parent";
            case "CHILD":
                return "Enfant";
            case "ADMIN":
                return "Admin";
            default:
                return role;
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role.toUpperCase()) {
            case "PARENT":
            case "OWNER":
                return colors.blue[100];
            case "CHILD":
                return colors.aquamarine[100];
            case "ADMIN":
                return colors.secondary[100];
            default:
                return colors.carbon[60];
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={colors.primary[100]} />
                <Text style={[styles.loadingText, fontStylesRegular]}>Chargement des comptes...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[100]} />}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, fontStylesTitle]}>Qui se connecte ?</Text>
                    <Text style={[styles.subtitle, fontStylesRegular]}>Chaque profil a son propre tableau de bord et ses propres missions !</Text>
                </View>

                {/* Account Cards */}
                <View style={styles.cardsContainer}>
                    {user?.subAccounts && user.subAccounts.length > 0 ? (
                        user.subAccounts.map((account) => (
                            <TouchableOpacity
                                key={account.id}
                                style={styles.accountCard}
                                onPress={() => navigateToAccount(account)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.iconContainer}>
                                    <Text style={styles.accountIcon}>{getRoleIcon(account.role)}</Text>
                                </View>

                                <Text style={[styles.accountName, fontStylesSemiBold]}>{account.name}</Text>

                                <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(account.role) }]}>
                                    <Text style={[styles.roleText, fontStylesSemiBold]}>{getRoleDisplayName(account.role)}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={[styles.emptyTitle, fontStylesTitle]}>Aucun compte trouvé</Text>
                            <Text style={[styles.emptyText, fontStylesRegular]}>
                                Vous n'avez pas encore de sous-comptes. Créez-en un pour commencer.
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.screenBackground,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    center: {
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: spacing.md,
        ...typography.md,
        color: colors.carbon[60],
    },
    header: {
        paddingTop: spacing["5xl"],
        paddingBottom: spacing["3xl"],
        alignItems: "center",
    },
    title: {
        ...typography.heading,
        marginBottom: spacing.md,
        textAlign: "center",
    },
    subtitle: {
        ...typography.subtitle,
        textAlign: "center",
        paddingHorizontal: spacing.lg,
    },
    cardsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: spacing.base,
    },
    accountCard: {
        backgroundColor: colors.white,
        borderRadius: spacing.xs,
        padding: spacing.xl,
        alignItems: "center",
        width: "47%",
        minHeight: 160,
        justifyContent: "space-between",
        ...shadows.md,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: spacing.xs,
        backgroundColor: colors.screenBackground,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: spacing.base,
    },
    accountIcon: {
        fontSize: 32,
    },
    accountName: {
        ...typography.lg,
        ...typography.semiBold,
        color: colors.carbon[100],
        textAlign: "center",
        marginBottom: spacing.md,
    },
    roleBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        borderRadius: spacing.xs,
        minWidth: 80,
        alignItems: "center",
    },
    roleText: {
        color: colors.white,
        ...typography.sm,
        ...typography.semiBold,
    },
    emptyState: {
        backgroundColor: colors.white,
        borderRadius: spacing.xs,
        padding: spacing["3xl"],
        alignItems: "center",
        width: "100%",
        marginTop: spacing["3xl"],
    },
    emptyTitle: {
        ...typography.xl,
        ...typography.bold,
        color: colors.carbon[100],
        marginBottom: spacing.md,
        textAlign: "center",
    },
    emptyText: {
        ...typography.subtitle,
        textAlign: "center",
    },
    bottomPadding: {
        height: spacing["3xl"],
    },
});
