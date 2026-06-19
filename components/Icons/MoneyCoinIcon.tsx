import React from "react";
import Svg, { Rect, Defs, Pattern, Use, Image, Text as SvgText } from "react-native-svg";

interface MoneyCoinIconProps {
    amount: string | number;
    width?: number;
    height?: number;
}

const SvgAny = Svg as any;

export const MoneyCoinIcon: React.FC<MoneyCoinIconProps> = ({ amount, width = 71, height = 68 }) => (
    <SvgAny
        width={width}
        height={height}
        viewBox="0 0 71 68"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
    >
        <Rect width={71} height={68} rx={9} fill="url(#coin_a)" />
        <SvgText x="35" y="44" textAnchor="middle" fill="white" fontSize="26" fontWeight="800">
            {String(amount)}€
        </SvgText>
        <Defs>
            <Pattern id="coin_a" patternContentUnits="objectBoundingBox" width={1} height={1}>
                <Use xlinkHref="#coin_b" transform="scale(.0023)" />
            </Pattern>
            <Image
                id="coin_b"
                width={434}
                height={434}
                preserveAspectRatio="none"
                xlinkHref="data:image/png;base64,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"
            />
        </Defs>
    </SvgAny>
);
