import * as React from "react";
import Svg, { G, Path, Defs, ClipPath, SvgProps } from "react-native-svg";

const OtherIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <G clipPath="url(#a)">
            <Path
                d="M23.967 10.417a12.04 12.04 0 1 0-13.55 13.55q.243.031.49.032a4 4 0 0 0 2.804-1.184l9.1-9.1a3.96 3.96 0 0 0 1.156-3.298m-21.9.474a10.034 10.034 0 0 1 19.8-.884 12.006 12.006 0 0 0-11.86 11.852A9.99 9.99 0 0 1 2.063 10.89zM12.3 21.4q-.13.124-.278.225a10 10 0 0 1 9.606-9.607q-.1.15-.224.279z"
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

export default OtherIcon;
