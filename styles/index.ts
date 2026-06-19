/**
 * Point d'entrée centralisé pour tous les styles
 * Importez depuis ce fichier pour avoir accès à tous les styles
 *
 * @example
 * import { colors, spacing, typography, commonStyles } from '@/styles';
 */

export { colors } from './colors';
export type { ColorKey } from './colors';

export { spacing } from './spacing';
export type { SpacingKey } from './spacing';

export { shadows } from './shadows';
export type { ShadowKey } from './shadows';

export { typography } from './typography';

export { commonStyles } from './commonStyles';

// Import pour la réexportation dans theme
import { colors } from './colors';
import { spacing } from './spacing';
import { shadows } from './shadows';

// Réexportation pour faciliter l'utilisation
export const theme = {
    colors,
    spacing,
    shadows,
} as const;
