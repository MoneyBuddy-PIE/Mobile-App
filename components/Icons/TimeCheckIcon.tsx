import * as React from "react";
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg";
import { SvgProps } from "react-native-svg";

const TimeCheckIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <G clipPath="url(#a)" fill="#fff">
            <Path d="M23.707 16.325a1 1 0 0 0-1.414 0l-5.627 5.628-2.688-2.653a1.002 1.002 0 0 0-1.435 1.4l2.744 2.7a1.88 1.88 0 0 0 1.345.6h.033A1.87 1.87 0 0 0 18 23.447l5.707-5.708a1 1 0 0 0 0-1.414" />
            <Path d="M11.09 21.96a10 10 0 1 1 10.869-9.049 1 1 0 0 0 .907 1.09.99.99 0 0 0 1.085-.908Q23.999 12.55 24 12a12 12 0 1 0-13.09 11.951h.091a1.001 1.001 0 0 0 .089-2z" />
            <Path d="M11 7v4.586l-2.707 2.707a1 1 0 1 0 1.414 1.414l3-3A1 1 0 0 0 13 12V7a1 1 0 0 0-2 0" />
        </G>
        <Defs>
            <ClipPath id="a">
                <Path fill="#fff" d="M0 0h24v24H0z" />
            </ClipPath>
        </Defs>
    </Svg>
);

export default TimeCheckIcon;
