import * as React from "react";
import Svg, { G, Path, Defs, ClipPath, SvgProps } from "react-native-svg";

const SchoolIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <G clipPath="url(#a)">
            <Path
                d="M9 11a1 1 0 0 1 1-1h4a1 1 0 0 1 0 2h-4a1 1 0 0 1-1-1m15 7v1a5.006 5.006 0 0 1-5 5H5a5.006 5.006 0 0 1-5-5v-1a5.01 5.01 0 0 1 4-4.9V12a8 8 0 0 1 4.015-6.927C8.013 5.048 8 5.026 8 5V4a4 4 0 0 1 8 0v1c0 .026-.013.048-.015.073A8 8 0 0 1 20 12v1.1a5.01 5.01 0 0 1 4 4.9M10 4.263a7.75 7.75 0 0 1 4 0V4a2 2 0 1 0-4 0zM6 16.535a8.37 8.37 0 0 1 12 0V12a6 6 0 1 0-12 0zM5 22h.026A4.95 4.95 0 0 1 4 19v-3.816A3 3 0 0 0 2 18v1a3 3 0 0 0 3 3m10 0a3 3 0 0 0 2.874-2.188 6.432 6.432 0 0 0-11.748 0A3 3 0 0 0 9 22zm7-4a3 3 0 0 0-2-2.816V19a4.95 4.95 0 0 1-1.026 3H19a3 3 0 0 0 3-3z"
                fill={props.color ?? "#6e6e6e"}
            />
        </G>
        <Defs>
            <ClipPath id="a">
                <Path fill="#fff" d="M0 0h24v24H0z" />
            </ClipPath>
        </Defs>
    </Svg>
);

export default SchoolIcon;
