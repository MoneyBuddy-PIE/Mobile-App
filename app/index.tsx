import { useEffect, useRef, useState } from 'react';
import { useFonts } from "expo-font";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, Easing, Animated } from "react-native";
import { router } from "expo-router";
import { useAuthContext } from "@/contexts/AuthContext";
import { typography } from "@/styles/typography";
import Svg, { Path } from 'react-native-svg';
import Reanimated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function Index() {
	const { isLoading, isAuthenticated } = useAuthContext();
	const [showSplash, setShowSplash] = useState(true);
	const [contentAnim] = useState(new Animated.Value(0));

	// Animation pour le cercle qui grandit
	const [circleScale] = useState(new Animated.Value(0));
	const [circleOpacity] = useState(new Animated.Value(1));
	const [splashBackgroundColor] = useState(new Animated.Value(0));

	useEffect(() => {
		if (!isLoading) {
			if (isAuthenticated) {
				router.replace("/(app)/accounts");
			} else {
				const timer = setTimeout(() => {
					Animated.timing(circleScale, {
						toValue: 1,
						duration: 1200,
						easing: Easing.out(Easing.cubic),
						useNativeDriver: true,
					}).start(() => {
						Animated.timing(splashBackgroundColor, {
							toValue: 1,
							duration: 500,
							useNativeDriver: false,
						}).start(() => {
							setShowSplash(false);
							Animated.timing(contentAnim, {
								toValue: 1,
								duration: 500,
								useNativeDriver: true,
							}).start();
						});
					});
				}, 500);

				return () => clearTimeout(timer);
			}
		}
	}, [isLoading, isAuthenticated]);

	if (isLoading || showSplash) {
		const finalSize = Math.sqrt(width * width + height * height) * 2;
		
		const backgroundColorInterpolated = splashBackgroundColor.interpolate({
			inputRange: [0, 1],
			outputRange: ['#FFFFFF', '#F5F5F5']
		});
		
		return (
			<Animated.View style={[styles.splashContainer, { backgroundColor: backgroundColorInterpolated }]}>
				<Animated.View 
					style={[
						styles.backgroundFill,
						{
							width: finalSize,
							height: finalSize,
							borderRadius: finalSize / 2,
							left: width / 2 - finalSize / 2,
							top: height / 2 - finalSize / 2,
							transform: [{ scale: circleScale }],
							opacity: circleOpacity,
						}
					]} 
				/>
			</Animated.View>
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
			{/* <Animated.View style={[styles.svgBox, { opacity: contentAnim }]}>
				<View style={styles.svgContainer}>
					<Svg
						width={width * 0.8}
						height={height * 0.4}
						viewBox="0 0 100 100"
						style={styles.svgStyle}
					>
						<Path
							d="M50 5C27.9 5 10 22.9 10 45C10 67.1 27.9 85 50 85C72.1 85 90 67.1 90 45C90 22.9 72.1 5 50 5ZM50 75C32.3 75 20 62.7 20 45C20 27.3 32.3 15 50 15C67.7 15 80 27.3 80 45C80 62.7 67.7 75 50 75Z"
							fill="#fff"
						/>
					</Svg>
				</View>
			</Animated.View> */}

			<Animated.View style={[styles.content, { opacity: contentAnim }]}>
				<View>
					<Text style={typography.titleSplash}>Money Buddy</Text>
					<Text style={typography.bodySplash}>Construisez l'avenir financier de votre enfant, 5 minutes par jour !</Text>
				</View>
				<View style={styles.buttonContainer}>
					<TouchableOpacity style={[styles.primaryButton, styles.buttonGlobal]} onPress={navigateToLogin}>
						<Text style={[styles.primaryButtonText]}>Se connecter</Text>
					</TouchableOpacity>

					<TouchableOpacity style={[styles.secondaryButton, styles.buttonGlobal]} onPress={navigateToSignUp}>
						<Text style={[styles.secondaryButtonText]}>Je m'inscris</Text>
					</TouchableOpacity>
				</View>
				<View>
					<Text style={typography.subtitleSplash}>
						En continuant, vous acceptez nos <Text style={{ textDecorationLine: 'underline', cursor: 'pointer' }}>Conditions d'utilisation</Text> et notre <Text style={{ textDecorationLine: 'underline', cursor: 'pointer' }}>Politique de confidentialité</Text>.
					</Text>
				</View>
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	splashContainer: {
		flex: 1,
		position: 'relative',
	},
	backgroundFill: {
		position: 'absolute',
		backgroundColor: '#846DED',
	},

	container: {
		flex: 1,
		backgroundColor: '#846DED',
		position: 'relative',
	},
	content: {
		flex: 1,
		justifyContent: 'space-between',
		paddingHorizontal: 24,
		paddingBottom: 48,
		paddingTop: height * 0.4,
		zIndex: 1,
	},


	svgBox: {
		
	},
	svgContainer: {
		marginVertical: 20,
	},
	svgStyle: {
		overflow: 'visible',
	},

	buttonContainer: {
		gap: 16,
	},
	buttonGlobal: {
		borderRadius: 8,
		borderWidth: 2,
		alignItems: 'center',
		paddingVertical: 20,
		paddingHorizontal: 24,
	},
	primaryButton: {
		backgroundColor: '#FFFFFF',
		borderColor: 'transparent',
		alignItems: 'center',
		shadowColor: "#CEC5F8",
		shadowOffset: {
			width: 0,
			height: 3.89,
		},
		shadowOpacity: 1,
		shadowRadius: 0,
	},
	primaryButtonText: {
		color: '#333',
		fontSize: 18,
		fontWeight: '600',
	},
	secondaryButton: {
		backgroundColor: 'transparent',
		borderColor: '#FFFFFF',
		alignItems: 'center',
	},
	secondaryButtonText: {
		color: '#333',
		fontSize: 18,
		fontWeight: '600',
	},
});
