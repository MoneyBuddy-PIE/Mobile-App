import * as React from "react";
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg";

interface CheckCircleIconProps {
    width?: number;
    height?: number;
    color?: string;
}

const CheckCircleIcon: React.FC<CheckCircleIconProps> = ({ width = 40, height = 40, color = "#16AA75" }) => (
    <Svg width={width} height={height} viewBox="0 0 40 40" fill="none">
        <G clipPath="url(#check-circle-clip)">
            <Path
                d="M30.357 15.163a1.665 1.665 0 0 1-.024 2.357l-7.376 7.242a6.64 6.64 0 0 1-4.667 1.918 6.64 6.64 0 0 1-4.627-1.882l-3.165-3.111a1.666 1.666 0 1 1 2.337-2.377l3.155 3.102a3.31 3.31 0 0 0 4.635-.03L28 15.142a1.665 1.665 0 0 1 2.357.021M40 20c0 11.028-8.972 20-20 20S0 31.028 0 20 8.972 0 20 0s20 8.972 20 20m-3.333 0c0-9.19-7.477-16.667-16.667-16.667S3.333 10.81 3.333 20 10.81 36.667 20 36.667 36.667 29.19 36.667 20"
                fill={color}
            />
        </G>
        <Defs>
            <ClipPath id="check-circle-clip">
                <Path fill="#fff" d="M0 0h40v40H0z" />
            </ClipPath>
        </Defs>
    </Svg>
);

export default CheckCircleIcon;
