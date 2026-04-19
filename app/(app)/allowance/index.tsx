import AllowanceForm from "@/components/forms/AllowanceForm"
import { router, useLocalSearchParams } from "expo-router"
import { StyleSheet, SafeAreaView, View, TouchableOpacity, Text} from "react-native"



const Allowance = () =>{
    const params = useLocalSearchParams()
    const childId = params.childId as string
    

    return (
        <>
        <SafeAreaView style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
                    <Text style={styles.title}>Argent de poche régulier</Text>
					<TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
						<Text style={styles.closeButtonText}>✕</Text>
					</TouchableOpacity>
				</View>

                {/* Content */}
                <AllowanceForm childId={childId} />

        </SafeAreaView>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
		flex: 1,
		backgroundColor: "#f8f9fa",
	},
    header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingTop: 10,
		paddingBottom: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},
    title: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		flex: 1,
	},
    closeButton: {
		width: 32,
		height: 32,
		backgroundColor: "#333",
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	closeButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
})

export default Allowance