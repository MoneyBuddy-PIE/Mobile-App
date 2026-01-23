import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { UserStorage } from "@/utils/storage";
import { SubAccount } from "@/types/Account";

interface NavItem {
    route: string;
    label: string;
    iconName: keyof typeof Ionicons.glyphMap;
    iconNameActive: keyof typeof Ionicons.glyphMap;
}

export const BottomNavigation: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [subAccount, setSubAccount] = useState<SubAccount | null>(null);

    useEffect(() => {
        loadSubAccount();
    }, []);

    const loadSubAccount = async () => {
        try {
            const accountData = await UserStorage.getSubAccount();
            setSubAccount(accountData);
        } catch (error) {
            console.error("Error loading sub-account:", error);
        }
    };

    // Définir les routes en fonction du rôle du sous-compte
    const getNavItems = (): NavItem[] => {
        const homeRoute = subAccount?.role === "CHILD" ? "/(app)/home/child" : "/(app)/home/parent";

        if (subAccount?.role === "CHILD") {
            // Navigation pour les enfants
            return [
                {
                    route: homeRoute,
                    label: "Home",
                    iconName: "home-outline",
                    iconNameActive: "home",
                },
                {
                    route: "/(app)/revenus",
                    label: "Revenus",
                    iconName: "wallet-outline",
                    iconNameActive: "wallet",
                },
                {
                    route: "/(app)/goals",
                    label: "Objectifs",
                    iconName: "trophy-outline",
                    iconNameActive: "trophy",
                },
                {
                    route: "/(app)/tasks",
                    label: "Tâches",
                    iconName: "checkmark-circle-outline",
                    iconNameActive: "checkmark-circle",
                },
                {
                    route: "/(app)/profile",
                    label: "Profile",
                    iconName: "person-outline",
                    iconNameActive: "person",
                },
            ];
        } else {
            // Navigation pour les parents
            return [
                {
                    route: homeRoute,
                    label: "Home",
                    iconName: "home-outline",
                    iconNameActive: "home",
                },
                {
                    route: "/(app)/children",
                    label: "Enfants",
                    iconName: "people-outline",
                    iconNameActive: "people",
                },
                {
                    route: "/(app)/courses",
                    label: "Cours",
                    iconName: "book-outline",
                    iconNameActive: "book",
                },
                {
                    route: "/(app)/profile",
                    label: "Profile",
                    iconName: "person-outline",
                    iconNameActive: "person",
                },
            ];
        }
    };

    const navItems = getNavItems();

    const isActive = (route: string) => {
        const cleanPath = route.replace("/(app)", "");
        return pathname === route || pathname === cleanPath || pathname.startsWith(cleanPath + "/");
    };

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom || 20 }]}>
            {navItems.map((item) => {
                const active = isActive(item.route);

                const handlePress = () => {
                    if (!active) {
                        router.replace(item.route);
                    }
                };

                return (
                    <Pressable key={item.route} onPress={handlePress} style={styles.navItem}>
                        {({ pressed }) => (
                            <>
                                <Ionicons
                                    name={active ? item.iconNameActive : item.iconName}
                                    size={24}
                                    color={active ? "#6C5CE7" : "#666"}
                                    style={[pressed && !active && styles.pressedIcon]}
                                />
                                <Text style={[styles.label, active && styles.activeLabel, pressed && !active && styles.pressedLabel]}>{item.label}</Text>
                            </>
                        )}
                    </Pressable>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
        paddingTop: 8,
        ...Platform.select({
            ios: {
                // shadowColor: "#000",
                // shadowOffset: {
                // 	width: 0,
                // 	height: -2,
                // },
                // shadowOpacity: 0.1,
                // shadowRadius: 3,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    navItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
    },
    pressedIcon: {
        opacity: 0.7,
        transform: [{ scale: 0.95 }],
    },
    label: {
        fontSize: 12,
        color: "#666",
        fontWeight: "500",
        marginTop: 4,
    },
    activeLabel: {
        color: "#6C5CE7",
        fontWeight: "700",
    },
    pressedLabel: {
        opacity: 0.7,
    },
});
