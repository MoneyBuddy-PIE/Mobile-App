import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const Cross = ({ width = 20, height = 20, fill = "#fff", ...props }: SvgProps) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
        <Path
            d="M18 6a1 1 0 0 0-1.414 0L12 10.586 7.414 6A1 1 0 0 0 6 7.414L10.586 12 6 16.586A1 1 0 0 0 7.414 18L12 13.414 16.586 18A1 1 0 0 0 18 16.586L13.414 12 18 7.414A1 1 0 0 0 18 6"
            fill={fill}
        />
    </Svg>
);
export default Cross;
