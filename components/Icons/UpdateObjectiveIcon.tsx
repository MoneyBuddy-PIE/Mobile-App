import * as React from "react";
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg";

interface UpdateObjectiveIconProps {
    width?: number;
    height?: number;
    color?: string;
}

const UpdateObjectiveIcon: React.FC<UpdateObjectiveIconProps> = ({ width = 20, height = 20, color = "#16AA75" }) => (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
        <G clipPath="url(#update-objective-clip)">
            <Path
                d="M10 0a10 10 0 1 0 10 10A10.01 10.01 0 0 0 10 0m.833 18.29v-1.623a.834.834 0 0 0-1.666 0v1.624a8.345 8.345 0 0 1-7.458-7.458h1.624a.834.834 0 0 0 0-1.666H1.71a8.346 8.346 0 0 1 7.458-7.458v1.624a.833.833 0 1 0 1.666 0V1.71a8.345 8.345 0 0 1 7.458 7.458h-1.624a.834.834 0 0 0 0 1.666h1.624a8.345 8.345 0 0 1-7.458 7.458m2.5-8.29a.834.834 0 0 1-.833.833h-1.667V12.5a.834.834 0 0 1-1.666 0v-1.667H7.5a.834.834 0 0 1 0-1.666h1.667V7.5a.833.833 0 0 1 1.666 0v1.667H12.5a.834.834 0 0 1 .833.833"
                fill={color}
            />
        </G>
        <Defs>
            <ClipPath id="update-objective-clip">
                <Path fill="#fff" d="M0 0h20v20H0z" />
            </ClipPath>
        </Defs>
    </Svg>
);

export default UpdateObjectiveIcon;
