import * as React from "react";
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg";

interface Props {
    width?: number;
    height?: number;
    color?: string;
}

const HomeParentIcon = ({ width = 24, height = 24, color = "#2f2f2f" }: Props) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
        <G clipPath="url(#home-parent-clip)">
            <Path
                d="M.213 9.145A1 1 0 0 1 .384 7.74l8.535-6.68a4.99 4.99 0 0 1 6.162 0l8.535 6.68a1 1 0 0 1-1.232 1.576l-8.535-6.68a2.99 2.99 0 0 0-3.697 0L1.616 9.317a1 1 0 0 1-1.403-.171m3.524 8.89C1.571 18.625 0 20.714 0 23a1 1 0 1 0 2 0c0-1.38.973-2.684 2.263-3.035a1 1 0 1 0-.526-1.93m16.525 0a1 1 0 0 0-.526 1.93c1.29.352 2.263 1.656 2.263 3.035a1 1 0 1 0 2 0c0-2.286-1.571-4.374-3.737-4.965M4.499 11a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5m17.5 2.5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0m-10-5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5m0 7c-2.757 0-5 2.243-5 5v3a1 1 0 1 0 2 0v-3c0-1.654 1.346-3 3-3s3 1.346 3 3v3a1 1 0 1 0 2 0v-3c0-2.757-2.243-5-5-5"
                fill={color}
            />
        </G>
        <Defs>
            <ClipPath id="home-parent-clip">
                <Path fill="#fff" d="M0 0h24v24H0z" />
            </ClipPath>
        </Defs>
    </Svg>
);

export default HomeParentIcon;
