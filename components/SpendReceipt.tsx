import React, { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Svg, { Path } from 'react-native-svg'
import getIconFromCategory, { categories } from '@/utils/fn/getIconFromCategory'

const BG_COLOR = '#EBF2FB'
const SCALLOP_W = 13   // largeur de chaque feston
const SCALLOP_H = 8    // profondeur des festons

const formatReceiptDate = (date: Date): string => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const yyyy = date.getFullYear()
    return `${days[date.getDay()]} ${dd}/${mm}/${yyyy}`
}

// ─── Bord festonné (bas du reçu) ──────────────────────────────────────────────
// Crée une forme blanche avec des festons pointant vers le haut
// → le fond bleu "perce" à travers les festons, donnant l'effet reçu papier

const ReceiptScallop = ({ width }: { width: number }) => {
    if (width < 1) return null

    const count = Math.ceil(width / SCALLOP_W)
    const totalW = count * SCALLOP_W

    // Chemin de la forme blanche :
    //   Top  : ligne droite de (0,0) à (totalW,0)
    //   Droite : descend jusqu'à (totalW, SCALLOP_H)
    //   Bas  : festons de droite à gauche — chaque feston est un arc
    //          allant de (xR, SCALLOP_H) via point de contrôle (xM, 0)
    //          jusqu'à (xL, SCALLOP_H) → arc qui monte = "trou" dans le blanc
    let d = `M 0 0 L ${totalW} 0 L ${totalW} ${SCALLOP_H}`

    for (let i = count; i > 0; i--) {
        const xR = i * SCALLOP_W
        const xL = (i - 1) * SCALLOP_W
        const xM = (xR + xL) / 2
        d += ` Q ${xM} 0 ${xL} ${SCALLOP_H}`
    }

    d += ' Z'

    return (
        <Svg
            width={totalW}
            height={SCALLOP_H}
            style={{ display: 'flex' }}
        >
            <Path d={d} fill="white" />
        </Svg>
    )
}

interface ReceiptRowProps {
    label: string
    value: string
    emoji?: string
    isLast?: boolean
}

const ReceiptRow = ({ label, value, emoji, isLast = false }: ReceiptRowProps) => (
    <View style={[rowStyles.container, isLast && { borderBottomWidth: 0 }]}>
        <Text style={rowStyles.label}>{label}</Text>
        <View style={rowStyles.valueContainer}>
            {emoji && (
                <View style={rowStyles.emojiBadge}>
                    <Ionicons name={getIconFromCategory(emoji) as keyof typeof Ionicons.glyphMap} size={24} color={"#846DED"} />
                </View>
            )}
            <Text style={rowStyles.value}>{value}</Text>
        </View>
    </View>
)

const rowStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 13,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        width: '100%',
    },
    label: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 11,
        color: '#2F2F2F',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    emojiBadge: {
        borderRadius: 4,
        padding: 4,
        backgroundColor: '#F3F0FD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emojiText: {
        fontSize: 15,
    },
    value: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
        color: '#2F2F2F',
    },
})

export interface SpendReceiptProps {
    amount: string
    categoryEmoji?: string
    description?: string
    date?: Date
    paymentMethod?: string
}

const SpendReceipt: React.FC<SpendReceiptProps> = ({
    amount,
    categoryEmoji = '🛒',
    description,
    date = new Date(),
    paymentMethod = 'Espèces',
}) => {
    const [cardWidth, setCardWidth] = useState(0)

    const parsedAmount = parseFloat(amount)
    const displayAmount = isNaN(parsedAmount) ? '0.00' : parsedAmount.toFixed(2)

    return (<>
            {/* Reçu centré */}
            <View style={styles.receiptWrapper}>

                {/* Carte du reçu */}
                <View
                    style={styles.receiptCard}
                    onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
                >
                    {/* Checkmark vert */}
                    <View style={styles.checkmarkCircle}>
                        <Ionicons name="checkmark" size={28} color="#fff" />
                    </View>

                    {/* Titre */}
                    <Text style={styles.title}>Dépense enregistrée !</Text>

                    {/* Montant */}
                    <Text style={styles.amount}>{displayAmount}€</Text>

                    {/* Séparateur */}
                    <View style={styles.separator} />

                    {/* Lignes d'information */}
                    <ReceiptRow
                        label="Date"
                        value={formatReceiptDate(date)}
                    />
                    <ReceiptRow
                        label="Catégorie"
                        value={categories.find((cat) => cat.value === categoryEmoji)?.label ?? ''} 
                        emoji={categoryEmoji}
                    />
                    <ReceiptRow
                        label="Paiement"
                        value={paymentMethod}
                        isLast={!description}
                    />

                    {/* Section Détails */}
                    {!!description && (
                        <View style={styles.detailsSection}>
                            <Text style={styles.detailsLabel}>Détails</Text>
                            <Text style={styles.detailsText}>{description}</Text>
                        </View>
                    )}

                    {/* Espace avant le bord festonné */}
                    <View style={{ height: 20 }} />
                </View>

                {/* Bord festonné (bande blanche avec festons) */}
                <ReceiptScallop width={cardWidth} />
            </View>
            </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG_COLOR,
    },

    // Bouton X
    closeBtn: {
        position: 'absolute',
        top: 56,
        right: 20,
        width: 36,
        height: 36,
        backgroundColor: '#2F2F2F',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },

    // Zone du reçu
    receiptWrapper: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingTop: 70,
        paddingBottom: 12,
    },
    receiptCard: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingHorizontal: 24,
        paddingTop: 32,
        alignItems: 'center',
        shadowColor: '#9DB5C8',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
    },

    // Checkmark
    checkmarkCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#16AA75',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
        shadowColor: '#16AA75',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },

    title: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 17,
        color: '#2F2F2F',
        marginBottom: 6,
    },
    amount: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 42,
        color: '#2F2F2F',
        marginBottom: 20,
    },
    separator: {
        width: '100%',
        height: 1,
        backgroundColor: '#EBEBEB',
        marginBottom: 2,
    },

    // Section Détails
    detailsSection: {
        width: '100%',
        paddingTop: 14,
        paddingBottom: 4,
    },
    detailsLabel: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 13,
        color: '#2F2F2F',
        marginBottom: 5,
    },
    detailsText: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
        color: '#828282',
        fontStyle: 'italic',
        lineHeight: 20,
    },

    // Footer
    footer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingBottom: 28,
        paddingTop: 12,
    },
    backBtn: {
        width: 56,
        height: 56,
        backgroundColor: '#fff',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#BFD0EA',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.6,
        shadowRadius: 0,
        elevation: 2,
    },
    validateBtn: {
        flex: 1,
        height: 56,
        backgroundColor: '#16AA75',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0E7A53',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    validateBtnText: {
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 16,
        color: '#fff',
    },
})

export default SpendReceipt
