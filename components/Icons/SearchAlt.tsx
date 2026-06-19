import * as React from "react";
import Svg, { G, Path, Defs, ClipPath, SvgProps } from "react-native-svg";
const SearchAlt = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <G clipPath="url(#a)">
            <Path
                d="M16 6a1 1 0 1 1 0 2H8a1 1 0 0 1 0-2zm7.707 17.707a1 1 0 0 1-1.414 0L19.886 21.3A4.46 4.46 0 0 1 15 21.242a4.5 4.5 0 1 1 7-3.742 4.46 4.46 0 0 1-.7 2.386l2.407 2.407a1 1 0 0 1 0 1.414M17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5M13 22H7a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h12a1 1 0 0 1 1 1v8a1 1 0 0 0 2 0V3a3 3 0 0 0-3-3H7a5.006 5.006 0 0 0-5 5v14a5.006 5.006 0 0 0 5 5h6a1 1 0 0 0 0-2"
                fill="#2f2f2f"
            />
        </G>
        <Defs>
            <ClipPath id="a">
                <Path fill="#fff" d="M0 0h24v24H0z" />
            </ClipPath>
        </Defs>
    </Svg>
);
export default SearchAlt;
