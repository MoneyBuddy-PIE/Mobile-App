import React from "react";
import Svg, { G, Path, Defs, ClipPath, Rect } from "react-native-svg";

interface TasksIconProps {
    width?: number;
    height?: number;
    color?: string;
}

export const TasksIcon: React.FC<TasksIconProps> = ({ width = 32, height = 32, color = "#2F2F2F" }) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
            <G clipPath="url(#clip0_323_2898)">
                <Path
                    d="M16 0C7.17733 0 0 7.17733 0 16C0 24.8227 7.17733 32 16 32C24.8227 32 32 24.8227 32 16C32 7.17733 24.8227 0 16 0ZM24.2667 14.016L18.3653 19.8093C17.3213 20.8333 15.9773 21.344 14.632 21.344C13.3013 21.344 11.9707 20.8427 10.9307 19.8387L8.39867 17.3493C7.87333 16.8333 7.86667 15.9893 8.38267 15.464C8.89733 14.9373 9.744 14.9307 10.268 15.448L12.792 17.9293C13.8267 18.9293 15.46 18.924 16.5 17.9053L22.4 12.1133C22.924 11.596 23.7653 11.6053 24.2853 12.1307C24.8013 12.656 24.7933 13.5 24.2667 14.016Z"
                    fill={color}
                />
            </G>
            <Defs>
                <ClipPath id="clip0_323_2898">
                    <Rect width="32" height="32" fill="white" />
                </ClipPath>
            </Defs>
        </Svg>
    );
};
