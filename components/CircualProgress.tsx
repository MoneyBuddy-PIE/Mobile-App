import React, { ReactElement, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import Svg, { Circle } from "react-native-svg";


const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type IProps = {
    size?: number
    strokeWidth?: number
    progress?: number
    color?: string
    trackColor?: string
    children?: ReactElement
}

const CircularProgress = ({
    size = 88,
    strokeWidth = 9,
    progress = 0,
    color = "#F06C8A",
    trackColor = "#EBEBEB",
    children
  }: IProps) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const cx = size / 2;
    const cy = size / 2;
  
    const animOffset = useRef(new Animated.Value(circumference)).current;
  
    useEffect(() => {
      const clamped = Math.min(100, Math.max(0, progress));
      const targetOffset = circumference * (1 - clamped / 100);
  
      Animated.timing(animOffset, {
        toValue: targetOffset,
        duration: 900,
        delay: 100,
        useNativeDriver: false,
      }).start();
    }, [progress]);
  
    return (
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {/* Piste de fond */}
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Arc de progression — part du haut (−90°) */}
          <AnimatedCircle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={animOffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${cx}, ${cy}`}
          />
        </Svg>
  
        {/* Pourcentage centré */}
        <View style={[StyleSheet.absoluteFill, styles.percentCenter]}>
          {children
            ? children
            : <Text style={styles.percentText}>
                {Math.round(progress)}%
              </Text>
          }
        </View>
      </View>
    );
}

const styles = StyleSheet.create({
  percentCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  percentText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
})

export default CircularProgress