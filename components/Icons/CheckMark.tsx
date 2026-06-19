import * as React from "react";
import Svg, { G, Path, Defs, ClipPath, SvgProps } from "react-native-svg";
const CheckMark = (props: SvgProps) => (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
        <G clipPath="url(#a)">
            <Path
                d="M10 0C4.486 0 0 4.486 0 10s4.486 10 10 10 10-4.486 10-10S15.514 0 10 0m5.167 8.76-3.689 3.62a3.32 3.32 0 0 1-2.333.96 3.32 3.32 0 0 1-2.313-.94l-1.583-1.557a.833.833 0 1 1 1.169-1.188l1.577 1.55a1.656 1.656 0 0 0 2.318-.014L14 7.57a.832.832 0 1 1 1.167 1.189"
                fill="#16aa75"
            />
        </G>
        <Defs>
            <ClipPath id="a">
                <Path fill="#fff" d="M0 0h20v20H0z" />
            </ClipPath>
        </Defs>
    </Svg>
);
export default CheckMark;
