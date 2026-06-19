import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const BackArrow = ({ width = 20, height = 20, fill = "#fff", ...props }: SvgProps) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
        <Path
            d="M11.29 17.71a1 1 0 0 0 0-1.42L8 13h10a1 1 0 0 0 0-2H8l3.29-3.29a1 1 0 1 0-1.41-1.42l-4.29 4.3A2 2 0 0 0 5 12a2 2 0 0 0 .59 1.4l4.29 4.3a1 1 0 0 0 1.41.01"
            fill={fill}
        />
    </Svg>
);
export default BackArrow;
