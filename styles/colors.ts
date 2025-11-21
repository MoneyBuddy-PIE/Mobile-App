/**
 * Palette de couleurs de l'application
 * Utilisez ces couleurs pour maintenir une cohérence visuelle
 */

export const colors = {
    carbon: {
        100: '#2F2F2F',
        90: '#444444',
        80: '#6A6A6A',
        70: '#6E6E6E',
        60: '#828282',
        50: '#979797',
        40: '#ACACAC',
        30: '#C0C0C0',
        20: '#D5D5D5',
        10: '#EAEAEA',
    },
    cream: { 100: '#FFFCF1' },
    primary: {
        100: '#846DED',
        80: '#9D8AF1',
        60: '#B5A7F4',
        40: '#CEC5F8',
        20: '#E6E2FB',
        10: '#846DED1A',
    },
    secondary: {
        100: '#ECFF5C',
        80: '#F0FF7D',
        60: '#F4FF9D',
        40: '#F7FFBE',
        20: '#FBFFDE',
    },
    tertiary: {
        100: '#F7543E',
        80: '#F87665',
        60: '#FA998B',
        40: '#FCBBB2',
        20: '#FDDDD8',
    },
    aquamarine: {
        100: '#59FFCF',
        60: '#9BFFE2',
    },
    jadegreen: {
        100: '#16AA75',
        60: '#73CCAC',
    },
    blue: {
        100: '#52A5FF',
        60: '#97C9FF',
    },
    pink: {
        100: '#FD618C',
        40: '#FEA0BA',
    },
    screenBackground: '#EBF2FB',
    inputBackground: '#F5F5F5',
    white: '#FFFFFF',
    black: '#000000',
    border: '#E0E0E0',
    shadow: '#BFD0EA',
    transparent: 'transparent',
} as const;

// Couleurs principales
// primary: '#6C5CE7',
// primaryLight: '#A29BFE',
// primaryDark: '#5F4FD1',

// // Couleurs secondaires
// secondary: '#00D4AA',
// secondaryLight: '#00F5C4',
// secondaryDark: '#00B894',

// // Couleurs d'accentuation
// accent: '#4A90E2',
// accentLight: '#74B9FF',
// accentDark: '#0984E3',

// Couleurs de statut
// success: '#00D4AA',
// warning: '#FF9800',
// error: '#FF6B6B',
// info: '#4A90E2',

// // Nuances de gris
// black: '#000000',
// dark: '#2F2F2F',
// darkGray: '#333333',
// gray: '#666666',
// mediumGray: '#999999',
// lightGray: '#CCCCCC',
// ultraLightGray: '#F0F0F0',
// background: '#F8F9FA',
// white: '#FFFFFF',

// // Couleurs par rôle
// roleParent: '#4A90E2',
// roleChild: '#00D4AA',
// roleAdmin: '#FF9800',

// // Couleurs spécifiques
// border: '#E0E0E0',
// shadow: '#BFD0EA',
// overlay: 'rgba(0, 0, 0, 0.5)',

// // Backgrounds
// cardBackground: '#FFFFFF',
// screenBackground: '#F8F9FA',
// inputBackground: '#F5F5F5',

export type ColorKey = keyof typeof colors;
