import React from "react";
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg";

interface ArrowUpIconProps {
    width?: number;
    height?: number;
    color?: string;
}

export const ArrowUpIcon: React.FC<ArrowUpIconProps> = ({ width = 32, height = 32, color = "#fff" }) => (
    <Svg width={width} height={height} viewBox="0 0 32 32" fill="none" style={{ transform: [{ rotate: "180deg" }] }}>
        <G clipPath="url(#arrow-up-clip)">
            <Path
                d="M17.32 32h-2.64c-2.947 0-5.347-2.373-5.347-5.293v-9.374H6.587c-1.64 0-3.04-.946-3.667-2.466-.627-1.507-.293-3.174.867-4.334l8.44-8.96C14.32-.52 17.68-.52 19.747 1.547l8.493 9.026c1.133 1.12 1.467 2.787.84 4.294s-2.027 2.453-3.653 2.466H22.68v9.374c0 2.92-2.4 5.293-5.347 5.293zM16 2.667c-.68 0-1.347.253-1.867.773l-8.44 8.96c-.6.6-.386 1.267-.32 1.453.08.187.4.814 1.2.814h4.067c.733 0 1.333.6 1.333 1.333v10.707c0 1.453 1.2 2.626 2.68 2.626h2.64c1.48 0 2.68-1.186 2.68-2.626V16c0-.733.6-1.333 1.334-1.333h4.08c.8 0 1.12-.627 1.2-.814s.293-.853-.28-1.426l-8.454-9a2.6 2.6 0 0 0-1.84-.76z"
                fill={color}
            />
        </G>
        <Defs>
            <ClipPath id="arrow-up-clip">
                <Path fill="#fff" d="M0 0h32v32H0z" />
            </ClipPath>
        </Defs>
    </Svg>
);
