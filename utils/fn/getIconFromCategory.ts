import React from 'react';
import { SvgProps } from 'react-native-svg';
import {
    MealIcon,
    SnackIcon,
    GamesIcon,
    ClothingIcon,
    LeisureIcon,
    ReadingIcon,
    OutingIcon,
    GiftIcon,
    TransportIcon,
    SchoolIcon,
    OtherIcon,
} from '@/components/Icons/expenses';

export const categories: { value: string; label: string }[] = [
    { value: 'meal', label: 'Repas' },
    { value: 'snack', label: 'Goûter' },
    { value: 'games', label: 'Jeux' },
    { value: 'clothing', label: 'Vêtement' },
    { value: 'leisure', label: 'Loisirs' },
    { value: 'reading', label: 'Lecture' },
    { value: 'outing', label: 'Sortie' },
    { value: 'gift', label: 'Cadeau' },
    { value: 'transport', label: 'Transport' },
    { value: 'school', label: 'École' },
    { value: 'other', label: 'Autre' },
];

export const CATEGORY_ICONS: Record<string, React.ComponentType<SvgProps>> = {
    meal: MealIcon,
    snack: SnackIcon,
    games: GamesIcon,
    clothing: ClothingIcon,
    leisure: LeisureIcon,
    reading: ReadingIcon,
    outing: OutingIcon,
    gift: GiftIcon,
    transport: TransportIcon,
    school: SchoolIcon,
    other: OtherIcon,
};

export default function getIconFromCategory(category: string): React.ComponentType<SvgProps> {
    return CATEGORY_ICONS[category] ?? OtherIcon;
}
