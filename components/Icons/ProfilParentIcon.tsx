import * as React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
    width?: number;
    height?: number;
    color?: string;
}

const ProfilParentIcon = ({ width = 24, height = 24, color = "#2f2f2f" }: Props) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
        <Path
            d="M12 12a6 6 0 1 0 0-12 6 6 0 0 0 0 12m0-10a4 4 0 1 1 0 8 4 4 0 0 1 0-8m0 12a9.01 9.01 0 0 0-9 9 1 1 0 1 0 2 0 7 7 0 1 1 14 0 1 1 0 0 0 2 0 9.01 9.01 0 0 0-9-9"
            fill={color}
        />
    </Svg>
);

export default ProfilParentIcon;
