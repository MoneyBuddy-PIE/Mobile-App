import * as React from "react";
import Svg, { G, Path, Defs, ClipPath, SvgProps } from "react-native-svg";

const MealIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <G clipPath="url(#a)">
            <Path
                d="M19 12h-2.614l.54-4.331A3.016 3.016 0 0 0 14 4.017h-2.37c.11-.771.044-2.007 1.135-2.012H16a1 1 0 1 0 0-2h-3.235A3 3 0 0 0 9.79 2.633l-.173 1.384H3A3.02 3.02 0 0 0 .059 7.572L1.572 19.63a5.005 5.005 0 0 0 4.959 4.376L19 23.994a5 5 0 0 0 5-5V17a5 5 0 0 0-5-5m3 5H10a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3M14 6.016a1.01 1.01 0 0 1 .96 1.31L14.873 8h-3.74l.248-1.986zM2.224 6.39A1 1 0 0 1 3 6.016h6.367L9.117 8H2.125l-.1-.77a1 1 0 0 1 .2-.84m1.332 12.992L2.376 10h12.247l-.251 2H13a5 5 0 0 0-5 5c-.042 1.634-.1 3.74 1.036 5.01H6.53a3 3 0 0 1-2.975-2.628M19 22h-6a3 3 0 0 1-3-3h3.7c.387.186 2.875 2.11 3.3 2 .416.118 2.93-1.823 3.3-2H22a3 3 0 0 1-3 3"
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

export default MealIcon;
