import React from "react";
import Svg, { G, Path, Defs, ClipPath, Rect } from "react-native-svg";

interface HomeIconProps {
    width?: number;
    height?: number;
    color?: string;
}

export const HomeIcon: React.FC<HomeIconProps> = ({ width = 32, height = 32, color = "#2F2F2F" }) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
            <G clipPath="url(#clip0_323_3380)">
                <Path
                    d="M16 19.9897C13.7909 19.9897 12 21.7806 12 23.9897V31.9897H20V23.9897C20 21.7806 18.2091 19.9897 16 19.9897Z"
                    fill={color}
                />
                <Path
                    d="M22.6667 23.9898V31.9898H28C30.2091 31.9898 32 30.199 32 27.9898V15.8285C32.0003 15.1358 31.7311 14.4702 31.2493 13.9725L19.9187 1.72315C17.9194 -0.439972 14.5452 -0.572784 12.3821 1.42647C12.2793 1.52147 12.1803 1.6204 12.0854 1.72315L0.774688 13.9685C0.278313 14.4683 -0.000187405 15.1442 9.46143e-08 15.8485V27.9898C9.46143e-08 30.199 1.79087 31.9898 4 31.9898H9.33331V23.9898C9.35825 20.3541 12.2937 17.3851 15.8379 17.2996C19.5006 17.2112 22.6388 20.2308 22.6667 23.9898Z"
                    fill={color}
                />
                <Path
                    d="M16 19.9897C13.7909 19.9897 12 21.7806 12 23.9897V31.9897H20V23.9897C20 21.7806 18.2091 19.9897 16 19.9897Z"
                    fill={color}
                />
            </G>
            <Defs>
                <ClipPath id="clip0_323_3380">
                    <Rect width="32" height="32" fill="white" />
                </ClipPath>
            </Defs>
        </Svg>
    );
};
