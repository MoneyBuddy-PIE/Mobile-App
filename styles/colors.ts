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
    inputBackground: '#FFFFFF',
    white: '#FFFFFF',
    black: '#000000',
    border: '#E0E0E0',
    shadow: '#BFD0EA',
    transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof colors;

const colorList: string[] = ['#F06C8A', '#FD618C66', '#BADBFF'];

export default colorList;
