import React from "react";
import { View, StyleSheet } from "react-native";

type IProps = {
    showCard?: boolean;
    style?: object;
    children: React.ReactNode;
}

const Card = ({ showCard = true, style = {}, children }: IProps) => {
    if (!showCard) 
        return <View style={{...style}}>{children}</View>

    return (
      <View style={styles.shadowContainer}>
        <View style={{...style, ...styles.contentContainer}}>{children}</View>
      </View>
    );
};

const styles = StyleSheet.create({
    shadowContainer: {
      borderRadius: 4,
      shadowColor: "#BFD0EA",
      shadowOffset: { width: 0, height: 3.89 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
      backgroundColor: "transparent",
    },
    contentContainer: {
      overflow: "hidden",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#FFE5E5",
      backgroundColor: "#fff",
    },
});

export default Card;