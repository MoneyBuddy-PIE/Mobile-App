import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { UserStorage } from "@/utils/storage";
import { SubAccount } from "@/types/Account";
import { HomeIcon } from "./Icons/HomeIcon";
import { RevenusIcon } from "./Icons/RevenusIcon";
import { TasksIcon } from "./Icons/TasksIcon";
import { CoursesIcon } from "./Icons/CoursesIcon";
import { ProfileIcon } from "./Icons/ProfileIcon";
import { ParentHomeIcon } from "./Icons/ParentHomeIcon";
import { ChildrenIcon } from "./Icons/ChildrenIcon";
import { ParentCoursesIcon } from "./Icons/ParentCoursesIcon";
import { ParentProfileIcon } from "./Icons/ParentProfileIcon";

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

    const getNavItems = (): NavItem[] => {
        const homeRoute = subAccount?.role === "CHILD" ? "/(app)/home/child" : "/(app)/home/parent";

        if (subAccount?.role === "CHILD") {
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
                    route: "/(app)/tasks",
                    label: "Tâches",
                    iconName: "checkmark-circle-outline",
                    iconNameActive: "checkmark-circle",
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
        } else {
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

    const isChildAccount = subAccount?.role === "CHILD";

    const getChildIcon = (route: string) => {
        const iconProps = { width: 32, height: 32, color: isActive(route) ? "#16AA75" : "#2f2f2f" };

        switch (route) {
            case "/(app)/home/child":
                return <HomeIcon {...iconProps} />;
            case "/(app)/revenus":
                return <RevenusIcon {...iconProps} />;
            case "/(app)/tasks":
                return <TasksIcon {...iconProps} />;
            case "/(app)/courses":
                return <CoursesIcon {...iconProps} />;
            case "/(app)/profile":
                return <ProfileIcon {...iconProps} />;
            default:
                return <HomeIcon {...iconProps} />;
        }
    };

    const getParentIcon = (route: string, active: boolean) => {
        const iconProps = { width: 24, height: 24, color: active ? "#846DED" : "#666" };

        switch (route) {
            case "/(app)/home/parent":
                return <ParentHomeIcon {...iconProps} />;
            case "/(app)/children":
                return <ChildrenIcon {...iconProps} />;
            case "/(app)/courses":
                return <ParentCoursesIcon {...iconProps} />;
            case "/(app)/profile":
                return <ParentProfileIcon {...iconProps} />;
            default:
                return <ParentHomeIcon {...iconProps} />;
        }
    };

    if (isChildAccount) {
        return (
            <View style={[styles.childContainer, { paddingBottom: insets.bottom || 20 }]}>
                {navItems.map((item) => {
                    const active = isActive(item.route);

                    const handlePress = () => {
                        if (!active) {
                            router.replace(item.route);
                        }
                    };

                    return (
                        <Pressable key={item.route} onPress={handlePress} style={styles.childNavItem}>
                            {({ pressed }) => (
                                <View style={styles.childIconWrapper}>
                                    <View style={[styles.childIcon, pressed && styles.pressedCircle]}>
                                        {getChildIcon(item.route)}
                                    </View>
                                    <View style={[styles.childCircle, active && styles.childCircleActive]}></View>
                                </View>
                            )}
                        </Pressable>
                    );
                })}
            </View>
        );
    }

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

    childContainer: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
        paddingTop: 16,
        paddingHorizontal: 8,
        justifyContent: "space-evenly",
        alignItems: "center",
        ...Platform.select({
            ios: {},
            android: {
                elevation: 8,
            },
        }),
    },
    childNavItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 4,
    },
    childIconWrapper: {
        alignItems: "center",
        justifyContent: "center",
    },
    childIcon: {
    },
    childCircleActive: {
        marginTop: 6,
        width: 6,
        height: 6,
        borderRadius: 1000,
        backgroundColor: "#16AA75",
    },
    childCircle: {
        marginTop: 6,
        width: 6,
        height: 6,
        borderRadius: 1000,
        backgroundColor: "transparent",
    },
    pressedCircle: {
        opacity: 0.8,
        transform: [{ scale: 0.95 }],
    },
});
