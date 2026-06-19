import React from "react";
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg";

interface ScanIconProps {
    width?: number;
    height?: number;
    color?: string;
}

export const ScanIcon: React.FC<ScanIconProps> = ({ width = 32, height = 32, color = "#fff" }) => (
    <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
        <G clipPath="url(#scan-clip)">
            <Path
                d="M32 16c0 .736-.597 1.333-1.333 1.333H1.333a1.334 1.334 0 0 1 0-2.666h29.334c.736 0 1.333.597 1.333 1.333M9.333 29.333H6.667c-2.206 0-4-1.794-4-4v-2.666a1.334 1.334 0 0 0-2.667 0v2.666A6.674 6.674 0 0 0 6.667 32h2.666a1.334 1.334 0 0 0 0-2.667m21.334-8c-.736 0-1.334.598-1.334 1.334v2.666c0 2.206-1.794 4-4 4h-2.666a1.334 1.334 0 0 0 0 2.667h2.666A6.674 6.674 0 0 0 32 25.333v-2.666c0-.736-.597-1.334-1.333-1.334M25.333 0h-2.666a1.334 1.334 0 0 0 0 2.667h2.666c2.206 0 4 1.794 4 4v2.666a1.334 1.334 0 0 0 2.667 0V6.667A6.674 6.674 0 0 0 25.333 0m-24 10.667c.736 0 1.334-.598 1.334-1.334V6.667c0-2.206 1.794-4 4-4h2.666a1.334 1.334 0 0 0 0-2.667H6.667A6.674 6.674 0 0 0 0 6.667v2.666c0 .736.597 1.334 1.333 1.334"
                fill={color}
            />
        </G>
        <Defs>
            <ClipPath id="scan-clip">
                <Path fill="#fff" d="M0 0h32v32H0z" />
            </ClipPath>
        </Defs>
    </Svg>
);
