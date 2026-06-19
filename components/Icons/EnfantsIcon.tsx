import * as React from "react";
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg";

interface Props {
    width?: number;
    height?: number;
    color?: string;
}

const EnfantsIcon = ({ width = 24, height = 24, color = "#2f2f2f" }: Props) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
        <G clipPath="url(#enfants-clip)" fill={color}>
            <Path d="M24 11.5a3.5 3.5 0 0 0-2.15-3.226 10 10 0 0 0-19.7 0 3.5 3.5 0 0 0 1.12 6.719 10.6 10.6 0 0 0 2.07 2.955 8.9 8.9 0 0 0-2.271 4.927 1 1 0 0 0 1.983.25 6.92 6.92 0 0 1 1.815-3.872A8.95 8.95 0 0 0 12 21a8.94 8.94 0 0 0 5.119-1.74 6.92 6.92 0 0 1 1.808 3.862 1 1 0 0 0 1.984-.247 8.9 8.9 0 0 0-2.261-4.919 10.6 10.6 0 0 0 2.082-2.965A3.5 3.5 0 0 0 24 11.5m-3.752 1.473a.99.99 0 0 0-1.117.651C18.215 16.223 15.13 19 12 19s-6.215-2.78-7.131-5.377a.994.994 0 0 0-1.117-.651A2 2 0 0 1 3.5 13a1.5 1.5 0 0 1-.27-2.972 1 1 0 0 0 .816-.879A7.96 7.96 0 0 1 8.13 3a4.1 4.1 0 0 0-.022 1.942 4 4 0 0 0 7.688.318A.978.978 0 0 0 14.85 4h-.15a.87.87 0 0 0-.806.631A2 2 0 1 1 12 2.001a7.98 7.98 0 0 1 7.954 7.15 1 1 0 0 0 .816.877 1.5 1.5 0 0 1-.27 2.973 2 2 0 0 1-.252-.027" />
            <Path d="M9.5 13a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
        </G>
        <Defs>
            <ClipPath id="enfants-clip">
                <Path fill="#fff" d="M0 0h24v24H0z" />
            </ClipPath>
        </Defs>
    </Svg>
);

export default EnfantsIcon;
