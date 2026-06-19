import * as React from "react";
import Svg, { G, Path, Defs, ClipPath, SvgProps } from "react-native-svg";

const TransportIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <G clipPath="url(#a)">
            <Path
                d="M19.783 12.079a74 74 0 0 0-.555-1.873A23 23 0 0 1 18 5a1 1 0 0 1 2 0 1 1 0 0 0 2 0 3 3 0 1 0-6 0c.025.764.132 1.522.32 2.263L11.52 11 5.97 7H9a1 1 0 0 0 0-2H5.97a1.969 1.969 0 0 0-1.16 3.559l5.071 3.712-1.438 1.119a4.954 4.954 0 1 0 1.15 1.638l7.29-5.669c.14.476.726 2.384.855 2.823a4.994 4.994 0 1 0 2.046-.1zM5 20a3 3 0 1 1 0-6 3 3 0 0 1 0 6m14 0a3 3 0 1 1 0-6 3 3 0 0 1 0 6"
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

export default TransportIcon;
