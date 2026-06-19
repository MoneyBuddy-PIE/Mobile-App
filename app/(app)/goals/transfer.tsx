import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Goal } from "@/types/Goal";
import { SubAccount } from "@/types/Account";
import { goalsService } from "@/services/goalService";
import { userService } from "@/services/userService";
import { logger } from "@/utils/logger";
import Loader from "@/components/Loader";
import SuccessComponent from "@/components/SuccessComponent";
import { typography } from "@/styles";

const ITEM_HEIGHT = 140;
const GOAL_COLORS = ["#FEC0D1", "#BADBFF", "#9BFFE2", "#FFE599", "#D4A8FF", "#FFCBA4"];

type TransferItem = {
    id: string;
    name: string;
    available: number;
    emoji: string;
    iconColor: string;
};

function formatAmount(value: number): string {
    return value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ItemCard({ item, selected, side, conflict }: { item: TransferItem; selected: boolean; side: "left" | "right"; conflict?: boolean }) {
    const cornerRadius =
        side === "left" ? { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 } : { borderTopRightRadius: 8, borderBottomRightRadius: 8 };

    const selectedBg = conflict ? styles.itemCardConflict : styles.itemCardSelected;

    return (
        <View style={[styles.itemCard, selected ? [selectedBg, cornerRadius] : styles.itemCardDimmed]}>
            <View style={[styles.itemIcon, { backgroundColor: item.iconColor }]}>
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
            </View>
            <Text style={[styles.itemName, conflict && selected && styles.itemNameConflict]} numberOfLines={1}>
                {item.name}
            </Text>
            <Text style={[styles.itemAmount, conflict && selected && styles.itemAmountConflict]}>{formatAmount(item.available)}€</Text>
        </View>
    );
}

export default function TransferScreen() {
    const params = useLocalSearchParams<{ preselectedGoalId?: string; mode?: string }>();

    const [loading, setLoading] = useState(true);
    const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [fromIndex, setFromIndex] = useState(0);
    const [toIndex, setToIndex] = useState(0);
    const [columnHeight, setColumnHeight] = useState(0);
    const [amountText, setAmountText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const fromScrollRef = useRef<ScrollView>(null);
    const toScrollRef = useRef<ScrollView>(null);
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [account, goalsList] = await Promise.all([userService.getSubAccount(), goalsService.getGoals(undefined, "ACTIVATED")]);
            setSubAccount(account);
            setGoals(goalsList ?? []);
        } catch (err) {
            logger.warn("Error loading transfer data", err);
        } finally {
            setLoading(false);
        }
    };

    // Scroll to initial position once column is measured and data is loaded
    useEffect(() => {
        if (loading || columnHeight === 0) return;

        const allItems = [{ id: "balance" }, ...goals.map((g) => ({ id: g.id }))];
        let initialFrom = 0;
        let initialTo = goals.length > 0 ? 1 : 0;

        if (params.preselectedGoalId) {
            const preIndex = allItems.findIndex((i) => i.id === params.preselectedGoalId);
            if (preIndex >= 0) {
                if (params.mode === "to") {
                    initialFrom = 0;
                    initialTo = preIndex;
                } else {
                    initialFrom = preIndex;
                    initialTo = 0;
                }
            }
        }

        setFromIndex(initialFrom);
        setToIndex(initialTo);

        // Small delay to ensure ScrollViews are rendered with correct padding
        setTimeout(() => {
            fromScrollRef.current?.scrollTo({ y: initialFrom * ITEM_HEIGHT, animated: false });
            toScrollRef.current?.scrollTo({ y: initialTo * ITEM_HEIGHT, animated: false });
        }, 50);
    }, [loading, columnHeight]);

    if (loading) return <Loader />;

    const balanceItem: TransferItem = {
        id: "balance",
        name: "Solde courant",
        available: subAccount?.money ?? 0,
        emoji: "💵",
        iconColor: "#9BFFE2",
    };

    const goalItems: TransferItem[] = goals.map((g, i) => ({
        id: g.id,
        name: g.name,
        available: (g.amount * g.progression) / 100,
        emoji: g.emoji ?? "🎯",
        iconColor: GOAL_COLORS[i % GOAL_COLORS.length],
    }));

    const items: TransferItem[] = [balanceItem, ...goalItems];
    const fromItem = items[fromIndex] ?? items[0];
    const toItem = items[toIndex] ?? items[0];

    // Padding so first and last items can be scrolled to center
    const centerPadding = columnHeight > 0 ? (columnHeight - ITEM_HEIGHT) / 2 : 0;

    const maxAmount = fromItem.available;
    const amountValue = parseFloat(amountText.replace(",", ".")) || 0;
    const sameItem = fromItem.id === toItem.id;
    const isValid = amountValue > 0 && amountValue <= maxAmount && !sameItem;

    const makeScrollHandler = (setter: (i: number) => void) => (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        // targetContentOffset is the snap destination (iOS), fall back to current offset
        const y = e.nativeEvent.targetContentOffset?.y ?? e.nativeEvent.contentOffset.y;
        const index = Math.max(0, Math.min(Math.round(y / ITEM_HEIGHT), items.length - 1));
        setter(index);
        setAmountText("");
    };

    const handleTransfer = async () => {
        if (!isValid || submitting) return;
        setSubmitting(true);
        try {
            if (fromItem.id === "balance") {
                await goalsService.addMoneyToGoal(toItem.id, { transferMoney: amountValue });
            } else if (toItem.id === "balance") {
                await goalsService.removeMoneyFromGoal(fromItem.id, { transferMoney: amountValue });
            } else {
                await goalsService.removeMoneyFromGoal(fromItem.id, { transferMoney: amountValue });
                await goalsService.addMoneyToGoal(toItem.id, { transferMoney: amountValue });
            }
            setSuccess(true);
        } catch (err) {
            logger.warn("Transfer failed", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
                <SuccessComponent
                    title="Virement enregistré !"
                    subTitle={`${formatAmount(amountValue)} € de ${fromItem.name} à ${toItem.name}`}
                    image={require("@/assets/images/transfer_success.png")}
                    onClose={() => router.back()}
                    showHeader
                />
            </SafeAreaView>
        );
    }

    return (
        // White bg so the status bar area above the header is white, not blue
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Virement de {subAccount?.name}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                    <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Scroll picker columns */}
            <View style={styles.columnsWrapper} onLayout={(e) => setColumnHeight(e.nativeEvent.layout.height)}>
                {/* Left — from */}
                <ScrollView
                    ref={fromScrollRef}
                    style={styles.column}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    onMomentumScrollEnd={makeScrollHandler(setFromIndex)}
                    onScrollEndDrag={makeScrollHandler(setFromIndex)}
                    contentContainerStyle={{ paddingVertical: centerPadding }}
                    scrollEventThrottle={16}
                >
                    {items.map((item, index) => (
                        <ItemCard key={item.id} item={item} selected={fromIndex === index} side="left" conflict={sameItem && fromIndex === index} />
                    ))}
                </ScrollView>

                {/* Divider — thick bar with a triangle tip pointing right */}
                <View style={styles.divider}>
                    <View style={styles.dividerTriangle} />
                </View>

                {/* Right — to */}
                <ScrollView
                    ref={toScrollRef}
                    style={styles.column}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    onMomentumScrollEnd={makeScrollHandler(setToIndex)}
                    onScrollEndDrag={makeScrollHandler(setToIndex)}
                    contentContainerStyle={{ paddingVertical: centerPadding }}
                    scrollEventThrottle={16}
                >
                    {items.map((item, index) => (
                        <ItemCard key={item.id} item={item} selected={toIndex === index} side="right" conflict={sameItem && toIndex === index} />
                    ))}
                </ScrollView>
            </View>

            {/* Bottom Panel */}
            <View style={styles.bottomPanel}>
                {/* Fixed-height slot — no layout shift when message appears/disappears */}
                <View style={styles.errorSlot}>
                    {sameItem ? (
                        <Text style={styles.errorText}>Comptes identiques — impossible d'effectuer ce virement</Text>
                    ) : maxAmount === 0 ? (
                        <Text style={styles.errorText}>⚠️ Solde disponible : 0 € — choisissez une autre source</Text>
                    ) : amountValue > maxAmount && amountValue > 0 ? (
                        <Text style={styles.errorText}>⚠️ Solde insuffisant — max {formatAmount(maxAmount)} €</Text>
                    ) : null}
                </View>

                <TouchableOpacity style={styles.amountBox} activeOpacity={0.8} onPress={() => inputRef.current?.focus()}>
                    <TextInput
                        ref={inputRef}
                        style={[styles.amountInput, typography.bold]}
                        keyboardType="decimal-pad"
                        placeholder="0,00"
                        placeholderTextColor="#979797"
                        value={amountText}
                        onChangeText={(t) => {
                            const cleaned = t.replace(/[^0-9,]/g, "").replace(/,{2,}/g, ",");
                            setAmountText(cleaned);
                        }}
                        maxLength={10}
                    />
                    <Text style={[styles.amountCurrency, typography.bold]}>€</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.validateButton, isValid && styles.validateButtonActive]}
                    onPress={handleTransfer}
                    disabled={!isValid || submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color={isValid ? "#fff" : "#828282"} />
                    ) : (
                        <Text style={[styles.validateButtonText, isValid && styles.validateButtonTextActive]}>Valider le virement</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF", // white for status bar area above header
    },
    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#BFD0EA",
    },
    headerTitle: {
        fontWeight: "700",
        fontSize: 20,
        color: "#2F2F2F",
    },
    closeButton: {
        backgroundColor: "#2F2F2F",
        borderRadius: 8,
        padding: 12,
    },
    // Columns
    columnsWrapper: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "#EBF2FB",
    },
    column: {
        flex: 1,
    },
    // Item card — height drives snap interval
    itemCard: {
        height: ITEM_HEIGHT,
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 8,
        justifyContent: "center",
    },
    itemCardSelected: {
        backgroundColor: "#FFFFFF",
        opacity: 1,
    },
    itemCardConflict: {
        backgroundColor: "#F5F5F5",
        opacity: 1,
    },
    itemCardDimmed: {
        opacity: 0.4,
    },
    itemIcon: {
        width: 32,
        height: 32,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
    },
    itemEmoji: {
        fontSize: 18,
    },
    itemName: {
        fontWeight: "700",
        fontSize: 14,
        color: "#2F2F2F",
    },
    itemNameConflict: {
        color: "#ACACAC",
    },
    itemAmount: {
        fontWeight: "700",
        fontSize: 20,
        color: "#2F2F2F",
    },
    itemAmountConflict: {
        color: "#ACACAC",
    },
    // Divider — thin bar with a triangle tip poking into the right column
    divider: {
        width: 4,
        backgroundColor: "#BFD0EA",
        justifyContent: "center",
        alignItems: "flex-end",
        zIndex: 2,
        overflow: "visible",
    },
    dividerTriangle: {
        width: 0,
        height: 0,
        borderTopWidth: 9,
        borderBottomWidth: 9,
        borderLeftWidth: 9,
        borderTopColor: "transparent",
        borderBottomColor: "transparent",
        borderLeftColor: "#BFD0EA",
        transform: [{ translateX: 9 }],
    },
    // Bottom Panel
    bottomPanel: {
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#BFD0EA",
        paddingHorizontal: 24,
        paddingTop: 12,
        gap: 12,
    },
    amountBox: {
        backgroundColor: "#EBF2FB",
        borderRadius: 4,
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: "row",
    },
    amountInput: {
        fontSize: 40,
        color: "#2F2F2F",
        minWidth: 80,
        textAlign: "right",
    },
    amountCurrency: {
        fontSize: 40,
        color: "#2F2F2F",
        marginLeft: 4,
    },
    errorSlot: {
        height: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    errorText: {
        fontSize: 12,
        color: "#F59E0B",
        textAlign: "center",
    },
    validateButton: {
        backgroundColor: "#D5D5D5",
        borderRadius: 8,
        paddingVertical: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    validateButtonActive: {
        backgroundColor: "#16AA75",
        shadowColor: "#005C49",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    validateButtonText: {
        fontWeight: "700",
        fontSize: 20,
        color: "#828282",
    },
    validateButtonTextActive: {
        color: "#FFFFFF",
    },
});
