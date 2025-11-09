import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const Check = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path
            d="M7.75 20.663c-.682 0-1.335-.27-1.817-.753l-5.49-5.488a1.513 1.513 0 0 1 2.14-2.14l5.166 5.166L21.417 3.78a1.513 1.513 0 0 1 2.14 2.14L9.565 19.91a2.56 2.56 0 0 1-1.816.753"
            fill="#fff"
        />
    </Svg>
);
export default Check;
