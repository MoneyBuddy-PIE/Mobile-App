import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const Chevron = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path
            d="m15.4 9.88-4.59-4.59A1 1 0 1 0 9.4 6.71l4.6 4.58a1 1 0 0 1 0 1.42l-4.6 4.58a1 1 0 0 0 1.41 1.42l4.59-4.59a3 3 0 0 0 0-4.24"
            fill="#2f2f2f"
        />
    </Svg>
);
export default Chevron;
