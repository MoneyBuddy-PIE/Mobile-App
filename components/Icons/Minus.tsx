import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const Minus = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M22.5 13.5h-21a1.5 1.5 0 0 1 0-3h21a1.5 1.5 0 0 1 0 3" fill="#fff" />
    </Svg>
);
export default Minus;
