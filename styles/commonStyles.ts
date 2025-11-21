import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';
import { shadows } from './shadows';

/**
 * Styles communs réutilisables à travers l'application
 */

export const commonStyles = StyleSheet.create({
    // Containers
    container: {
        flex: 1,
        backgroundColor: colors.screenBackground,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },

    // Cards
    card: {
        backgroundColor: colors.white,
        borderRadius: 8,
        padding: spacing.lg,
        ...shadows.md,
    },
    cardNoPadding: {
        backgroundColor: colors.white,
        borderRadius: 8,
        ...shadows.md,
    },

    // Sections
    section: {
        marginBottom: spacing['2xl'],
    },
    sectionHeader: {
        marginBottom: spacing.base,
    },

    // Rows et colonnes
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    column: {
        flexDirection: 'column',
    },

    // Spacing helpers
    mb4: { marginBottom: spacing.xs },
    mb8: { marginBottom: spacing.sm },
    mb12: { marginBottom: spacing.md },
    mb16: { marginBottom: spacing.base },
    mb20: { marginBottom: spacing.lg },
    mb24: { marginBottom: spacing.xl },
    mb32: { marginBottom: spacing['2xl'] },

    mt4: { marginTop: spacing.xs },
    mt8: { marginTop: spacing.sm },
    mt12: { marginTop: spacing.md },
    mt16: { marginTop: spacing.base },
    mt20: { marginTop: spacing.lg },
    mt24: { marginTop: spacing.xl },
    mt32: { marginTop: spacing['2xl'] },

    ph4: { paddingHorizontal: spacing.xs },
    ph8: { paddingHorizontal: spacing.sm },
    ph12: { paddingHorizontal: spacing.md },
    ph16: { paddingHorizontal: spacing.base },
    ph20: { paddingHorizontal: spacing.lg },

    pv4: { paddingVertical: spacing.xs },
    pv8: { paddingVertical: spacing.sm },
    pv12: { paddingVertical: spacing.md },
    pv16: { paddingVertical: spacing.base },
    pv20: { paddingVertical: spacing.lg },

    // Borders
    border: {
        borderWidth: 1,
        borderColor: colors.border,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    borderTop: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },

    // Borders arrondis
    rounded: { borderRadius: 4 },
    roundedMd: { borderRadius: 8 },
    roundedLg: { borderRadius: 12 },
    roundedFull: { borderRadius: 9999 },

    // Flex helpers
    flex1: { flex: 1 },
    flexGrow: { flexGrow: 1 },
    flexShrink: { flexShrink: 1 },

    // Alignement
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerVertical: {
        justifyContent: 'center',
    },
    centerHorizontal: {
        alignItems: 'center',
    },

    // Inputs
    input: {
        backgroundColor: colors.inputBackground,
        borderRadius: 8,
        padding: spacing.base,
        fontSize: 16,
        color: colors.carbon[90],
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputFocused: {
        borderColor: colors.primary[100],
    },
    inputError: {
        borderColor: colors.tertiary[100],
    },

    // Buttons
    button: {
        backgroundColor: colors.primary[100],
        borderRadius: 8,
        padding: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    buttonSecondary: {
        backgroundColor: colors.aquamarine[100],
        borderRadius: 8,
        padding: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderRadius: 8,
        padding: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.primary[100],
    },
    buttonDisabled: {
        backgroundColor: colors.carbon[30],
        opacity: 0.6,
    },

    // Badges
    badge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    badgeSuccess: {
        backgroundColor: colors.aquamarine[100],
    },
    badgeWarning: {
        backgroundColor: colors.secondary[100],
    },
    badgeError: {
        backgroundColor: colors.tertiary[100],
    },
    badgeInfo: {
        backgroundColor: colors.blue[100],
    },

    // Avatar
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarSm: {
        width: 40,
        height: 40,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarLg: {
        width: 80,
        height: 80,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Dividers
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.base,
    },
    dividerVertical: {
        width: 1,
        backgroundColor: colors.border,
        marginHorizontal: spacing.base,
    },

    // Shadows
    shadowSm: shadows.sm,
    shadowMd: shadows.md,
    shadowLg: shadows.lg,
    shadowXl: shadows.xl,

    // Backgrounds
    bgPrimary: { backgroundColor: colors.primary[100] },
    bgSecondary: { backgroundColor: colors.aquamarine[100] },
    bgWhite: { backgroundColor: colors.white },
    bgGray: { backgroundColor: colors.carbon[10] },

    // Text alignments
    textCenter: { textAlign: 'center' },
    textLeft: { textAlign: 'left' },
    textRight: { textAlign: 'right' },
});
