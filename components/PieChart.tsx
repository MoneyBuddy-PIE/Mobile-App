import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors, typography } from "@/styles";

interface PieChartProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    progressColor?: string;
    backgroundColor?: string;
}

export default function PieChart({
    percentage,
    size = 106,
    strokeWidth = 14,
    progressColor = colors.pink[100],
    backgroundColor = colors.carbon[10],
}: PieChartProps) {
    // Limiter le pourcentage entre 0 et 100
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    // Calculer les propriétés du cercle
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

    // Centre du cercle
    const center = size / 2;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size}>
                {/* Cercle de fond (gris) */}
                <Circle cx={center} cy={center} r={radius} stroke={backgroundColor} strokeWidth={strokeWidth} fill="transparent" />
                {/* Cercle de progression (rose) */}
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={progressColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${center}, ${center}`}
                />
            </Svg>
            {/* Pourcentage au centre */}
            <View style={styles.textContainer}>
                <Text style={styles.percentageText}>
                    <Text style={[typography.xl, { color: colors.carbon[100] }]}>{Math.round(clampedPercentage)}</Text>
                    <Text style={[typography.xs, { color: colors.carbon[100] }]}>%</Text>
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
    },
    textContainer: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
    },
    percentageText: {
        textAlign: "center",
    },
});
