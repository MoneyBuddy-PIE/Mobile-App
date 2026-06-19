// components/AccountCard.tsx
import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { SubAccount } from "@/types/Account";
import { colors, spacing, shadows, typography } from "@/styles";

interface AccountCardProps {
    account: SubAccount;
    onPress: () => void;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, onPress }) => {
    const getRoleIcon = (role: string) => {
        switch (role.toUpperCase()) {
            case "PARENT":
                return "👨‍👩‍👧‍👦";
            case "CHILD":
                return "👶";
            case "ADMIN":
                return "👑";
            default:
                return "👤";
        }
    };

    const getRoleColor = (role: string) => {
        switch (role.toUpperCase()) {
            case "PARENT":
                return colors.jadegreen[100];
            case "CHILD":
                return colors.blue[100];
            case "ADMIN":
                return colors.secondary[100];
            default:
                return colors.carbon[60];
        }
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>{getRoleIcon(account.role)}</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.name}>{account.name}</Text>
                <View style={styles.roleContainer}>
                    <View style={[styles.roleBadge, { backgroundColor: getRoleColor(account.role) }]}>
                        <Text style={styles.roleText}>{account.role}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.arrow}>
                <Text style={styles.arrowText}>→</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: spacing.base,
        padding: spacing.base,
        flexDirection: "row",
        alignItems: "center",
        ...shadows.md,
        marginBottom: spacing.md,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.carbon[10],
        justifyContent: "center",
        alignItems: "center",
        marginRight: spacing.base,
    },
    icon: {
        fontSize: 24,
    },
    content: {
        flex: 1,
    },
    name: {
        ...typography.lg,
        ...typography.semiBold,
        color: colors.carbon[100],
        marginBottom: spacing.xs,
    },
    roleContainer: {
        flexDirection: "row",
    },
    roleBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 6,
    },
    roleText: {
        color: colors.white,
        ...typography.xs,
        ...typography.semiBold,
        textTransform: "uppercase",
    },
    arrow: {
        marginLeft: spacing.md,
    },
    arrowText: {
        fontSize: 20,
        color: colors.carbon[50],
    },
});

export default AccountCard;
