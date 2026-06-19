import * as React from "react";
import Svg, { G, Path, Defs, ClipPath, SvgProps } from "react-native-svg";
const BoxCheck = (props: SvgProps) => (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
        <G clipPath="url(#a)">
            <Path
                d="M15.833 0H4.167A4.17 4.17 0 0 0 0 4.167V5c0 .738.323 1.403.833 1.862v8.971A4.17 4.17 0 0 0 5 20h10a4.17 4.17 0 0 0 4.167-4.167V6.862A2.5 2.5 0 0 0 20 5v-.833A4.17 4.17 0 0 0 15.833 0M1.667 4.167c0-1.379 1.121-2.5 2.5-2.5h11.666c1.379 0 2.5 1.121 2.5 2.5V5c0 .46-.373.833-.833.833h-15A.834.834 0 0 1 1.667 5zM17.5 15.833c0 1.379-1.122 2.5-2.5 2.5H5a2.503 2.503 0 0 1-2.5-2.5V7.5h15zM5.246 13.092a.833.833 0 0 1 1.175-1.184l2.026 2.012c.32.32.866.318 1.18.002l3.972-3.698a.833.833 0 0 1 1.136 1.22l-3.95 3.678a2.46 2.46 0 0 1-1.747.711c-.668 0-1.296-.26-1.768-.732z"
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
export default BoxCheck;
