import * as React from "react";
import Svg, { G, Path, Defs, ClipPath, SvgProps } from "react-native-svg";

const ClothingIcon = (props: SvgProps) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <G clipPath="url(#a)">
            <Path
                d="m22.751 17.41-9.108-6.47c2.639-2.165 3.844-3.16 3.175-6.086a4.93 4.93 0 0 0-3.684-3.684c-1.514-.345-3.068 0-4.259.952A4.95 4.95 0 0 0 7 6.012a1 1 0 0 0 2 0c0-.91.409-1.758 1.122-2.327.724-.578 1.635-.78 2.568-.565a2.95 2.95 0 0 1 2.179 2.179c.383 1.678.148 1.927-2.505 4.106l-.968.799L1.222 17.43A3.12 3.12 0 0 0 0 19.898 3.106 3.106 0 0 0 3.102 23h17.796A3.106 3.106 0 0 0 24 19.898c0-.961-.457-1.884-1.249-2.487M20.898 21H3.102a1.103 1.103 0 0 1-.695-1.958L12 12.227l9.565 6.795A1.103 1.103 0 0 1 20.898 21"
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

export default ClothingIcon;
