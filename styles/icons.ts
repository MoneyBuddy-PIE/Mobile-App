const styles = [
    'Caleb',
    'Liliana',
    'Ryan',
    'Nolan',
    'Jameson',
    'Oliver',
    'Adrian',
    'Andrea',
    'Brooklynn',
    'Alexander',
    'Luis',
    'Jude',
    'Chase',
    'Riley',
    'Valentina',
    'Leah',
    'Aidan',
    'Sawyer',
    'George',
    'Robert',
];

type IconConfig = { label: string; iconStyle: string; iconName: string[] };

const icons: IconConfig[] = [
    {
        label: 'Fun Emoji',
        iconStyle: 'fun-emoji',
        iconName: styles,
    },
    {
        label: 'Avataaars Neutral',
        iconStyle: 'avataaars-neutral',
        iconName: styles,
    },
    {
        label: 'Bottts Neutral',
        iconStyle: 'bottts-neutral',
        iconName: styles,
    },
    {
        label: 'Thumbs',
        iconStyle: 'thumbs',
        iconName: styles,
    },
];

export default icons;
