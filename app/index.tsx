import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Image, Easing } from "react-native";
import { DMSans_900Black, DMSans_400Regular } from "@expo-google-fonts/dm-sans";
import { router } from "expo-router";
import { useAuthContext } from "@/contexts/AuthContext";

const { width, height } = Dimensions.get('window');

export default function Index() {
	const { isLoading, isAuthenticated } = useAuthContext();
	const [showSplash, setShowSplash] = useState(true);
	const [contentAnim] = useState(new Animated.Value(0));

	const [diagonalTopMargin] = useState(new Animated.Value(-110));
	const [diagonalBottomMargin] = useState(new Animated.Value(-110));
	const [diagonalTop2Margin] = useState(new Animated.Value(0));
	const [diagonalBottom2Margin] = useState(new Animated.Value(0));
	const [diagonalTop2Opacity] = useState(new Animated.Value(1));
	const [diagonalBottom2Opacity] = useState(new Animated.Value(1));

	const [fontsLoaded] = useFonts({
		DMSans_900Black,
		DMSans_400Regular
	});

	const fontStylesTitle = fontsLoaded ? { fontFamily: "DMSans_900Black" } : {};
	const fontStylesRegular = fontsLoaded ? { fontFamily: "DMSans_400Regular" } : {};

	useEffect(() => {
		if (!isLoading) {
			if (isAuthenticated) {
				router.replace("/(app)/accounts");
			} else {
				const timer = setTimeout(() => {
					Animated.parallel([
						Animated.timing(diagonalTopMargin, {
							toValue: -280,
							duration: 800,
							easing: Easing.elastic(2.5),
							useNativeDriver: false,
						}),
						Animated.timing(diagonalBottomMargin, {
							toValue: -280,
							duration: 800,
							easing: Easing.elastic(2.5),
							useNativeDriver: false,
						}),
					]).start(() => {
						Animated.parallel([
							Animated.timing(diagonalTop2Margin, {
								toValue: -500,
								duration: 800,
								easing: Easing.back(1),
								useNativeDriver: false,
							}),
							Animated.timing(diagonalBottom2Margin, {
								toValue: -500,
								duration: 800,
								easing: Easing.back(1),	
								useNativeDriver: false,
							}),
						]).start(() => {
							Animated.parallel([
								Animated.timing(diagonalTop2Opacity, {
									toValue: 0,
									duration: 200,
									useNativeDriver: true,
								}),
								Animated.timing(diagonalBottom2Opacity, {
									toValue: 0,
									duration: 200,
									useNativeDriver: true,
								}),
							]).start(() => {
								setShowSplash(false);
								Animated.timing(contentAnim, {
									toValue: 1,
									duration: 500,
									useNativeDriver: true,
								}).start();
							});
						});
					});
				}, 1500);

				return () => clearTimeout(timer);
			}
		}
	}, [isLoading, isAuthenticated]);

	if (isLoading || showSplash) {
		return (
			<View style={styles.splashContainer}>
				<Animated.View style={[
					styles.diagonalTop2,
					{
						marginTop: diagonalTop2Margin,
						opacity: diagonalTop2Opacity,
					}
				]} />
				<Animated.View style={[
					styles.diagonalTop,
					{
						marginTop: diagonalTopMargin,
					}
				]} />
				<Animated.View style={[
					styles.diagonalBottom2,
					{
						marginBottom: diagonalBottom2Margin,
						opacity: diagonalBottom2Opacity,
					}
				]} />
				<Animated.View style={[
					styles.diagonalBottom,
					{
						marginBottom: diagonalBottomMargin,
					}
				]} />
			</View>
		);
	}

	const navigateToLogin = () => {
		router.replace("/(auth)/login");
	};

	const navigateToSignUp = () => {
		router.replace("/(auth)/register");
	};

	return (
		<View style={styles.container}>
			<View style={styles.diagonalTopMain} />
			<View style={styles.diagonalBottomMain} />

			<Animated.View style={[styles.content, { opacity: contentAnim }]}>
				<View style={styles.header}>
					<Text style={styles.welcome}>
						<Text style={[styles.welcomeText, fontStylesTitle]}>Welcome </Text>
						<Text style={[styles.welcomeTextLittle, fontStylesTitle]}>to </Text>
					</Text>
					<Text style={styles.title}>
						<Text style={[styles.titleMoney, fontStylesTitle]}>Money</Text>
						<Text style={[styles.titleBuddy, fontStylesTitle]}>Buddy</Text>
					</Text>
				</View>

				<View style={styles.dragonContainer}>
					<Image
						source={require('@/assets/indexPage/helloMoneyBuddy.png')}
						style={styles.dragonImage}
						resizeMode="contain"
					/>
				</View>

				<View style={styles.buttonContainer}>
					<TouchableOpacity style={styles.primaryButton} onPress={navigateToLogin}>
						<Text style={[styles.primaryButtonText, fontStylesRegular]}>Se Connecter</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.secondaryButton} onPress={navigateToSignUp}>
						<Text style={[styles.secondaryButtonText, fontStylesRegular]}>Créer un Compte</Text>
					</TouchableOpacity>
				</View>
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	splashContainer: {
		flex: 1,
		position: 'relative',
		backgroundColor: '#F5F5F5',
	},
	diagonalTop: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: width * 2,
		height: height * 0.6,
		backgroundColor: '#62F0BF',
		transform: [{ rotate: '-30deg' }],
		marginLeft: -width * 0.9,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 10,
		},
		shadowOpacity: 0.25,
		shadowRadius: 30,
		elevation: 24,
	},
	diagonalTop2: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: width * 2.5,
		height: height * 0.6,
		backgroundColor: '#009174',
		transform: [{ rotate: '-30deg' }],
		marginLeft: -width * 0.9,
	},
	diagonalBottom: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		width: width * 2,
		height: height * 0.6,
		backgroundColor: '#62F0BF',
		transform: [{ rotate: '-30deg' }],
		marginRight: -width * 0.9,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: -10,
		},
		shadowOpacity: 0.25,
		shadowRadius: 30,
		elevation: 24,
	},
	diagonalBottom2: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		width: width * 2.5,
		height: height * 0.6,
		backgroundColor: '#009174',
		transform: [{ rotate: '-30deg' }],
		marginRight: -width * 0.9,
	},

	container: {
		flex: 1,
		backgroundColor: '#F5F5F5',
		position: 'relative',
	},
	diagonalTopMain: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: width * 2,
		height: height * 0.6,
		backgroundColor: '#62F0BF',
		transform: [{ rotate: '-30deg' }],
		marginTop: -280,
		marginLeft: -width * 0.9,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 10,
		},
		shadowOpacity: 0.25,
		shadowRadius: 30,
		elevation: 24,
	},
	diagonalTopMain2: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: width * 2,
		height: height * 0.6,
		backgroundColor: '#009174',
		transform: [{ rotate: '-30deg' }],
		marginTop: -190,
		marginLeft: -width * 0.9,
	},
	diagonalBottomMain: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		width: width * 2,
		height: height * 0.6,
		backgroundColor: '#62F0BF',
		transform: [{ rotate: '-30deg' }],
		marginBottom: -280,
		marginRight: -width * 0.9,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: -10,
		},
		shadowOpacity: 0.25,
		shadowRadius: 30,
		elevation: 24,
	},
	diagonalBottomMain2: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		width: width * 2,
		height: height * 0.6,
		backgroundColor: '#009174',
		transform: [{ rotate: '-30deg' }],
		marginBottom: -190,
		marginRight: -width * 0.9,
	},
	content: {
		flex: 1,
		justifyContent: 'space-between',
		paddingHorizontal: 40,
		paddingTop: 200,
		paddingBottom: 200,
		zIndex: 1,
	},
	header: {
		fontFamily: "DMSans_900Bold",
		alignItems: 'flex-start',
	},
	welcome: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	welcomeText: {
		fontSize: 32,
		fontWeight: '900',
		color: '#333',
		marginBottom: 8,
		fontFamily: "DMSans_900Bold",
	},
	welcomeTextLittle: {
		fontSize: 18,
		fontWeight: '900',
		color: '#333',
		marginBottom: 8,
		marginLeft: 4,
		fontFamily: "DMSans_900Bold",
	},
	title: {
		fontSize: 32,
		fontWeight: '900',
	},
	titleMoney: {
		color: '#4ECDC4',
		fontFamily: "DMSans_900Bold",
	},
	titleBuddy: {
		color: '#333',
		fontFamily: "DMSans_900Bold",
	},
	dragonContainer: {
		position: 'absolute',
		right: 0,
		top: 90,
	},
	dragonImage: {
		width: 75,
		height: 150,
	},
	buttonContainer: {
		gap: 16,
		fontFamily: "DMSans_400Regular",
	},
	primaryButton: {
		backgroundColor: '#62F0BF',
		paddingVertical: 16,
		paddingHorizontal: 32,
		borderRadius: 16,
		borderWidth: 2,
		borderColor: 'transparent',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.25,
		shadowRadius: 0,
		elevation: 5,
	},
	primaryButtonText: {
		color: '#333',
		fontSize: 18,
		fontWeight: '600',
	},
	secondaryButton: {
		backgroundColor: 'transparent',
		paddingVertical: 16,
		paddingHorizontal: 32,
		borderRadius: 16,
		borderWidth: 2,
		borderColor: '#62F0BF',
		alignItems: 'center',
	},
	secondaryButtonText: {
		color: '#333',
		fontSize: 18,
		fontWeight: '600',
	},
});