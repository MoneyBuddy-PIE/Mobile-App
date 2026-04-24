import * as React from "react";
import Svg, { G, Path, Defs, ClipPath, SvgProps } from "react-native-svg";
const ReturnArrow = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <G clipPath="url(#a)">
            <Path
                d="M22.535 8.46A4.97 4.97 0 0 0 19 7H2.8l4.3-4.3a1 1 0 1 0-1.418-1.412L.732 6.237a2.5 2.5 0 0 0 0 3.535l4.95 4.95A1.001 1.001 0 0 0 7.1 13.31L2.788 9H19a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H5a1 1 0 0 0 0 2h14a5.006 5.006 0 0 0 5-5v-7a4.97 4.97 0 0 0-1.465-3.54"
                fill="#fff"
            />
        </G>
        <Defs>
            <ClipPath id="a">
                <Path fill="#fff" d="M0 0h24v24H0z" />
            </ClipPath>
        </Defs>
    </Svg>
);
export default ReturnArrow;
