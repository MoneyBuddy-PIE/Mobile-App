import React, { useState, useRef, useEffect, memo } from 'react'
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    NativeScrollEvent,
    NativeSyntheticEvent,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const ITEM_HEIGHT = 48
const VISIBLE_ITEMS = 5
const PADDING_ITEMS = Math.floor(VISIBLE_ITEMS / 2) // 2 items vides de chaque côté

const MONTHS_FR = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const getDaysInMonth = (month: number, year: number): number =>
    new Date(year, month + 1, 0).getDate()

const range = (start: number, end: number): number[] =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i)

const formatDateFR = (date: Date): string =>
    date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    })

interface WheelColumnProps {
    items: string[]
    selectedIndex: number
    onSelect: (index: number) => void
    flex?: number
}

const WheelColumn = memo<WheelColumnProps>(({ items, selectedIndex, onSelect, flex = 1 }) => {
    const scrollRef = useRef<ScrollView>(null)
    const paddedItems = [
        ...Array(PADDING_ITEMS).fill(''),
        ...items,
        ...Array(PADDING_ITEMS).fill(''),
    ]

    // Scroll to the initial selected item at mount
    useEffect(() => {
        const timer = setTimeout(() => {
            scrollRef.current?.scrollTo({
                y: selectedIndex * ITEM_HEIGHT,
                animated: false,
            })
        }, 80)
        return () => clearTimeout(timer)
    }, [])

    const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT)
        onSelect(Math.max(0, Math.min(index, items.length - 1)))
    }

    return (
        <View style={{ flex, height: ITEM_HEIGHT * VISIBLE_ITEMS, position: 'relative' }}>
            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onMomentumScrollEnd={handleScrollEnd}
                onScrollEndDrag={handleScrollEnd}
                scrollEventThrottle={16}
                nestedScrollEnabled
            >
                {paddedItems.map((item, index) => {
                    const actualIndex = index - PADDING_ITEMS
                    const isSelected = actualIndex === selectedIndex
                    return (
                        <View
                            key={index}
                            style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}
                        >
                            <Text style={[wheelStyles.text, isSelected && wheelStyles.textSelected]}>
                                {item}
                            </Text>
                        </View>
                    )
                })}
            </ScrollView>

            {/* Lignes de sélection (overlay non-interactif) */}
            <View style={wheelStyles.topFade} pointerEvents="none" />
            <View style={wheelStyles.bottomFade} pointerEvents="none" />
            <View style={wheelStyles.highlight} pointerEvents="none" />
        </View>
    )
})

const wheelStyles = StyleSheet.create({
    text: {
        fontSize: 15,
        color: '#BBBBBB',
        fontFamily: 'DMSans_400Regular',
        textAlign: 'center',
    },
    textSelected: {
        fontSize: 17,
        color: '#2F2F2F',
        fontFamily: 'DMSans_600SemiBold',
    },
    highlight: {
        position: 'absolute',
        top: ITEM_HEIGHT * PADDING_ITEMS,
        left: 4,
        right: 4,
        height: ITEM_HEIGHT,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(132, 109, 237, 0.35)',
        backgroundColor: 'rgba(132, 109, 237, 0.06)',
        borderRadius: 8,
    },
    topFade: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: ITEM_HEIGHT * PADDING_ITEMS,
        backgroundColor: 'rgba(255,255,255,0.6)',
    },
    bottomFade: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: ITEM_HEIGHT * PADDING_ITEMS,
        backgroundColor: 'rgba(255,255,255,0.6)',
    },
})

export interface DatePickerInputProps {
    value: Date | null
    onChange: (date: Date) => void
    placeholder?: string
    minYear?: number
    maxYear?: number
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
    value,
    onChange,
    placeholder = 'Choisir une date',
    minYear,
    maxYear,
}) => {
    const [visible, setVisible] = useState(false)
    const [modalKey, setModalKey] = useState(0)

    const today = new Date()
    const currentYear = today.getFullYear()
    const yearsArray = range(minYear ?? currentYear, maxYear ?? currentYear + 10)

    const getInitialValues = (date: Date | null) => {
        const d = date ?? today
        const yearIdx = yearsArray.indexOf(d.getFullYear())
        return {
            day: d.getDate() - 1,
            month: d.getMonth(),
            year: yearIdx >= 0 ? yearIdx : 0,
        }
    }

    const init = getInitialValues(value)
    const [selectedDay, setSelectedDay] = useState(init.day)
    const [selectedMonth, setSelectedMonth] = useState(init.month)
    const [selectedYear, setSelectedYear] = useState(init.year)
    const [dayKey, setDayKey] = useState(0)

    const safeYearIdx = Math.max(0, Math.min(selectedYear, yearsArray.length - 1))
    const maxDayCount = getDaysInMonth(selectedMonth, yearsArray[safeYearIdx])
    const daysArray = range(1, maxDayCount).map(d => String(d).padStart(2, '0'))
    const clampedDay = Math.min(selectedDay, maxDayCount - 1)

    const handleOpen = () => {
        const i = getInitialValues(value)
        setSelectedDay(i.day)
        setSelectedMonth(i.month)
        setSelectedYear(i.year)
        setDayKey(k => k + 1)
        setModalKey(k => k + 1) // Remonte toutes les colonnes avec les bonnes valeurs initiales
        setVisible(true)
    }

    const handleMonthSelect = (index: number) => {
        setSelectedMonth(index)
        const newMax = getDaysInMonth(index, yearsArray[safeYearIdx]) - 1
        if (selectedDay > newMax) setSelectedDay(newMax)
        setDayKey(k => k + 1)
    }

    const handleYearSelect = (index: number) => {
        setSelectedYear(index)
        const newMax = getDaysInMonth(selectedMonth, yearsArray[index]) - 1
        if (selectedDay > newMax) setSelectedDay(newMax)
        setDayKey(k => k + 1)
    }

    const handleConfirm = () => {
        const confirmed = new Date(yearsArray[safeYearIdx], selectedMonth, clampedDay + 1)
        onChange(confirmed)
        setVisible(false)
    }

    const isSelected = value !== null

    return (
        <>
            {/* Trigger */}
            <TouchableOpacity
                onPress={handleOpen}
                style={[styles.container, isSelected && styles.containerSelected]}
                activeOpacity={0.7}
            >
                <Text style={[styles.inputText, !isSelected && styles.placeholder]}>
                    {value ? formatDateFR(value) : placeholder}
                </Text>
                {isSelected
                    ? <Ionicons name="checkmark-outline" size={18} color="#16AA75" />
                    : <Ionicons name="calendar-outline" size={18} color="#979797" />
                }
            </TouchableOpacity>

            {/* Bottom Sheet Modal */}
            <Modal
                visible={visible}
                transparent
                animationType="slide"
                onRequestClose={() => setVisible(false)}
            >
                {/* Overlay sombre */}
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={() => setVisible(false)}
                />

                <View style={styles.sheet}>
                    {/* Handle */}
                    <View style={styles.handle} />

                    {/* En-tête */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Choisir une date</Text>
                        <TouchableOpacity
                            onPress={() => setVisible(false)}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        >
                            <Ionicons name="close" size={22} color="#999" />
                        </TouchableOpacity>
                    </View>

                    {/* Colonnes en roue */}
                    <View style={styles.wheelsRow}>
                        {/* Jour */}
                        <WheelColumn
                            key={`day-${modalKey}-${dayKey}`}
                            items={daysArray}
                            selectedIndex={clampedDay}
                            onSelect={setSelectedDay}
                            flex={1}
                        />
                        {/* Mois */}
                        <WheelColumn
                            key={`month-${modalKey}`}
                            items={MONTHS_FR}
                            selectedIndex={selectedMonth}
                            onSelect={handleMonthSelect}
                            flex={2}
                        />
                        {/* Année */}
                        <WheelColumn
                            key={`year-${modalKey}`}
                            items={yearsArray.map(String)}
                            selectedIndex={safeYearIdx}
                            onSelect={handleYearSelect}
                            flex={1.2}
                        />
                    </View>

                    {/* Bouton Confirmer */}
                    <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                        <Text style={styles.confirmBtnText}>Confirmer</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    // Trigger
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D5D5D5',
        paddingHorizontal: 16,
    },
    containerSelected: {
        borderColor: '#16AA75',
    },
    inputText: {
        fontSize: 16,
        color: '#333',
        paddingVertical: 16,
        fontFamily: 'DMSans_400Regular',
    },
    placeholder: {
        color: '#999',
    },
    // Modal
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: 36,
    },
    handle: {
        width: 36,
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_600SemiBold',
        color: '#2F2F2F',
    },
    wheelsRow: {
        flexDirection: 'row',
        paddingTop: 12,
        paddingBottom: 8,
    },
    confirmBtn: {
        backgroundColor: '#846DED',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#4E31CF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    confirmBtnText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'DMSans_600SemiBold',
    },
})

export { formatDateFR }
export default DatePickerInput
