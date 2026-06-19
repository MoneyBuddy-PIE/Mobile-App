import React from "react";
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg";

interface StarOctogramIconProps {
    width?: number;
    height?: number;
    color?: string;
    opacity?: number;
}

export const StarOctogramIcon: React.FC<StarOctogramIconProps> = ({ width = 40, height = 40, color = "#fff", opacity = 0.6 }) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 40 40" fill="none">
            <G clipPath="url(#a)">
                <Path
                    d="M36.284 14.913a2.063 2.063 0 0 1-1.167-2.833 5.399 5.399 0 0 0-7.192-7.193 2.065 2.065 0 0 1-2.833-1.167 5.398 5.398 0 0 0-10.167 0 2.064 2.064 0 0 1-2.833 1.167 5.398 5.398 0 0 0-7.202 7.195 2.06 2.06 0 0 1-1.166 2.833 5.4 5.4 0 0 0 0 10.167 2.064 2.064 0 0 1 1.175 2.833 5.397 5.397 0 0 0 7.185 7.195 2.064 2.064 0 0 1 2.833 1.167 5.399 5.399 0 0 0 10.167 0 2.063 2.063 0 0 1 2.833-1.167 5.398 5.398 0 0 0 7.193-7.192 2.065 2.065 0 0 1 1.167-2.833 5.398 5.398 0 0 0 0-10.167z"
                    fill={color}
                    fillOpacity={opacity}
                />
            </G>
            <Defs>
                <ClipPath id="a">
                    <Path fill="#fff" d="M0 0h40v40H0z" />
                </ClipPath>
            </Defs>
        </Svg>
    );
};
