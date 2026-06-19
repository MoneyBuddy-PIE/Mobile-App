import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthContext } from "@/contexts/AuthContext";
import { UserStorage } from "@/utils/storage";
import { formatMoney } from "@/utils/money";
import { SubAccount } from "@/types/Account";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, shadows } from "@/styles";

const getAvatarUri = (iconStyle: string, iconName: string) => `https://api.dicebear.com/9.x/${iconStyle}/png?seed=${iconName}`;

export default function Profile() {
    const { user, logout } = useAuthContext();
    const [subAccount, setSubAccount] = useState<SubAccount | null>(null);

    useEffect(() => {
        UserStorage.getSubAccount().then(setSubAccount).catch(console.error);
    }, []);

    const handleLogout = () => {
        Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
            { text: "Annuler", style: "cancel" },
            { text: "Déconnexion", style: "destructive", onPress: logout },
        ]);
    };

    const isChildAccount = subAccount?.role === "CHILD";

    const getRoleLabel = (role: string) => {
        switch (role?.toUpperCase()) {
            case "OWNER":
                return "Parent principal";
            case "PARENT":
                return "Parent";
            case "CHILD":
                return "Enfant";
            case "ADMIN":
                return "Administrateur";
            default:
                return role || "Utilisateur";
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role?.toUpperCase()) {
            case "OWNER":
            case "PARENT":
                return colors.primary[100];
            case "CHILD":
                return colors.jadegreen[100];
            case "ADMIN":
                return colors.tertiary[100];
            default:
                return colors.carbon[60];
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <Text style={styles.pageTitle}>Mon profil</Text>

                {/* Profile Card */}
                {subAccount && (
                    <View style={styles.profileCard}>
                        <View style={styles.avatarRow}>
                            {subAccount.iconStyle && subAccount.iconName ? (
                                <Image style={styles.avatar} source={{ uri: getAvatarUri(subAccount.iconStyle, subAccount.iconName) }} />
                            ) : (
                                <View style={styles.avatarFallback}>
                                    <Ionicons name="person" size={32} color={colors.primary[100]} />
                                </View>
                            )}
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>{subAccount.name}</Text>
                                <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(subAccount.role) }]}>
                                    <Text style={styles.roleText}>{getRoleLabel(subAccount.role)}</Text>
                                </View>
                            </View>
                        </View>

                        {isChildAccount && (
                            <View style={styles.moneyBanner}>
                                <Text style={styles.moneyLabel}>Argent de poche</Text>
                                <Text style={styles.moneyAmount}>{formatMoney(subAccount.money ?? 0)} €</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Account info — parents only */}
                {!isChildAccount && user && (
                    <>
                        <Text style={styles.sectionTitle}>Compte principal</Text>
                        <View style={styles.card}>
                            <InfoRow label="Email" value={user.email} />
                            <InfoRow label="Plan" value={user.planType || "Gratuit"} />
                            <InfoRow label="Sous-comptes" value={String(user.subAccounts?.length ?? 0)} />
                            <InfoRow label="Membre depuis" value={new Date(user.createdAt).toLocaleDateString("fr-FR")} last />
                        </View>
                    </>
                )}

                {/* Actions */}
                <Text style={styles.sectionTitle}>Actions</Text>
                <View style={styles.card}>
                    {!isChildAccount && (
                        <Link href="/accounts/create" asChild>
                            <ActionRow icon="person-add-outline" label="Créer un compte" />
                        </Link>
                    )}
                    <Link href="/accounts" asChild replace>
                        <ActionRow icon="swap-horizontal-outline" label="Changer de compte" />
                    </Link>
                    <Link href="/profile/profileForm" asChild>
                        <ActionRow icon="pencil-outline" label="Modifier le profil" />
                    </Link>
                    <Link href="/plans" asChild push>
                        <ActionRow icon="card-outline" label="Voir les plans" last />
                    </Link>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
                    <Ionicons name="log-out-outline" size={20} color={colors.tertiary[100]} />
                    <Text style={styles.logoutText}>Se déconnecter</Text>
                </TouchableOpacity>

                <Text style={styles.version}>MoneyBuddy v1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
    return (
        <View style={[styles.row, !last && styles.rowDivider]}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value}</Text>
        </View>
    );
}

function ActionRow({ icon, label, last, onPress }: { icon: string; label: string; last?: boolean; onPress?: () => void }) {
    return (
        <TouchableOpacity style={[styles.row, !last && styles.rowDivider]} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.actionIconBox}>
                <Ionicons name={icon as any} size={18} color={colors.primary[100]} />
            </View>
            <Text style={styles.actionLabel}>{label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.carbon[30]} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.screenBackground,
    },
    content: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing["5xl"],
        paddingBottom: spacing["3xl"],
    },
    pageTitle: {
        ...typography["3xl"],
        ...typography.bold,
        color: colors.carbon[100],
        marginBottom: spacing["2xl"],
    },

    // Profile card
    profileCard: {
        backgroundColor: colors.white,
        borderRadius: 4,
        padding: spacing.base,
        marginBottom: spacing["2xl"],
        ...shadows.md,
        gap: spacing.base,
    },
    avatarRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.base,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 4,
        borderWidth: 3,
        borderColor: colors.primary[20],
    },
    avatarFallback: {
        width: 64,
        height: 64,
        borderRadius: 4,
        backgroundColor: colors.primary[20],
        justifyContent: "center",
        alignItems: "center",
    },
    profileInfo: {
        flex: 1,
        gap: spacing.sm,
    },
    profileName: {
        ...typography["2xl"],
        ...typography.bold,
        color: colors.carbon[100],
    },
    roleBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 4,
    },
    roleText: {
        ...typography.xs,
        ...typography.semiBold,
        color: colors.white,
    },
    moneyBanner: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: colors.screenBackground,
        borderRadius: 4,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
    },
    moneyLabel: {
        ...typography.body,
        color: colors.carbon[60],
    },
    moneyAmount: {
        ...typography["2xl"],
        ...typography.bold,
        color: colors.primary[100],
    },

    // Section
    sectionTitle: {
        ...typography.xl,
        ...typography.bold,
        color: colors.carbon[100],
        marginBottom: spacing.md,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 4,
        marginBottom: spacing["2xl"],
        ...shadows.md,
        overflow: "hidden",
    },

    // Rows
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.base,
        gap: spacing.md,
    },
    rowDivider: {
        borderBottomWidth: 1,
        borderBottomColor: colors.carbon[10],
    },
    rowLabel: {
        ...typography.body,
        color: colors.carbon[60],
        flex: 1,
    },
    rowValue: {
        ...typography.body,
        ...typography.semiBold,
        color: colors.carbon[100],
    },
    actionIconBox: {
        width: 36,
        height: 36,
        borderRadius: 4,
        backgroundColor: colors.primary[20],
        justifyContent: "center",
        alignItems: "center",
    },
    actionLabel: {
        ...typography.body,
        ...typography.semiBold,
        color: colors.carbon[100],
        flex: 1,
    },

    // Logout
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.md,
        backgroundColor: colors.white,
        borderRadius: 4,
        paddingVertical: spacing.base,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.tertiary[20],
        ...shadows.md,
    },
    logoutText: {
        ...typography.button,
        color: colors.tertiary[100],
    },

    version: {
        ...typography.caption,
        textAlign: "center",
        color: colors.carbon[40],
    },
});
