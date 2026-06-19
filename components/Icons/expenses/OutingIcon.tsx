import * as React from "react";
import Svg, { G, Path, Defs, ClipPath, SvgProps } from "react-native-svg";

const OutingIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <G clipPath="url(#a)">
            <Path
                d="M22 11H5.45l16.054-4.17c1.053-.273 1.688-1.319 1.435-2.426l-.35-1.254C22.166.969 19.772-.49 17.643.138L2.973 4.06C.881 4.622-.394 6.79.136 8.908L1 12.131V19c0 2.757 2.243 5 5 5h13c2.757 0 5-2.243 5-5v-6c0-1.103-.897-2-2-2M11.444 3.866l-2.68 4.208-2.688.698 2.677-4.187zm5.813-1.553-2.645 4.242-3.007.781 2.698-4.234zm3.745 2.582-3.577.929 2.222-3.564c.024.013.05.018.073.032.473.287.797.743.928 1.339zM3.49 5.991l2.398-.641-2.66 4.161-.804.209-.353-1.312a2.01 2.01 0 0 1 1.42-2.417M22 19c0 1.654-1.346 3-3 3H6c-1.654 0-3-1.346-3-3v-6h19z"
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

export default OutingIcon;
