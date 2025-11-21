/**
 * Ombres prédéfinies pour les cartes et éléments
 */

export const shadows = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    sm: {
        shadowColor: '#BFD0EA',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 2,
    },
    md: {
        shadowColor: '#BFD0EA',
        shadowOffset: { width: 0, height: 3.89 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    lg: {
        shadowColor: '#BFD0EA',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 6,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
} as const;

export type ShadowKey = keyof typeof shadows;
