import { ReactElement } from "react"
import { Image, View, Text, StyleSheet } from "react-native"

type IProps = {
    value: string
}

const GuessCashFromValue = ({value}: IProps): ReactElement => {
    let imageUrl = null
    let v = null
    let currency = null

    switch (value) {
        case "10000":
        case "5000":
        case "2000":
        case "1000":
        case "500":
            imageUrl = require('@/assets/images/money/cash.png')
            v = Number(value) / 100
            break

        case "200":
        case "100":
            imageUrl = require('@/assets/images/money/big_coin.png')
            v = Number(value) / 100
            currency = "€"
            break

        case "50":
        case "20":
        case "10":
        case "5":
        case "2":
        case "1":
            imageUrl = require('@/assets/images/money/lil_coin.png')
            v = Number(value)
            currency = "c"
            break

        default:
            break
    }

    return (
        <View style={styles.container}>
            <Image
                source={imageUrl}
                style={styles.image}
                resizeMode="contain"
            />

            <Text style={styles.text}>
                {currency ? v + currency : v}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
    },

    image: {
        width: 100,
        height: 100,
    },

    text: {
        position: "absolute",
        fontSize: 32,
        fontWeight: 800,
        color: "#FFFFFF",
    },
})

export default GuessCashFromValue