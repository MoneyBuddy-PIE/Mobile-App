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
  Easing as ReanimatedEasing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const AnimatedPath = Reanimated.createAnimatedComponent(Path);

export default function Index() {
	const { isLoading, isAuthenticated } = useAuthContext();
	const [showSplash, setShowSplash] = useState(true);
	const [contentAnim] = useState(new Animated.Value(0));

	const [circleScale] = useState(new Animated.Value(0));
	const [circleOpacity] = useState(new Animated.Value(1));
	const [splashBackgroundColor] = useState(new Animated.Value(0));

	const strokeDashoffset = useSharedValue(2000);
	const pathOpacity = useSharedValue(0);
	const fillOpacity = useSharedValue(0);

	const animatedStrokeProps = useAnimatedProps(() => {
		return {
			strokeDashoffset: strokeDashoffset.value,
			opacity: pathOpacity.value,
		};
	});

	const animatedFillProps = useAnimatedProps(() => {
		return {
			opacity: fillOpacity.value,
		};
	});

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
						useNativeDriver: false,
					}).start(() => {
						Animated.timing(splashBackgroundColor, {
							toValue: 1,
							duration: 100,
							useNativeDriver: false,
						}).start(() => {
							setShowSplash(false);
							
							pathOpacity.value = withTiming(1, { 
								duration: 300,
								reduceMotion: 'never'
							});
							
							strokeDashoffset.value = withTiming(0, { 
								duration: 2500,
								easing: ReanimatedEasing.out(ReanimatedEasing.cubic),
								reduceMotion: 'never'
							});
							
							fillOpacity.value = withDelay(2000, withTiming(1, { 
								duration: 500,
								reduceMotion: 'never'
							}));
							
							setTimeout(() => {
								Animated.timing(contentAnim, {
									toValue: 1,
									duration: 800,
									useNativeDriver: false,
								}).start();
							}, 2200);
						});
					});
				}, 500);

				return () => clearTimeout(timer);
			}
		}
	}, [isLoading, isAuthenticated, strokeDashoffset, pathOpacity, fillOpacity, contentAnim, circleScale, splashBackgroundColor]);

	if (isLoading || showSplash) {
		const finalSize = Math.sqrt(width * width + height * height) * 2;
		
		const backgroundColorInterpolated = splashBackgroundColor.interpolate({
			inputRange: [0, 1],
			outputRange: ['#FFFFFF', '#846DED'],
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
			<Animated.View style={ styles.svgBox }>
				<Svg
					width={width * 1.1}
					height={height * 0.4}
					viewBox="0 0 390 327"
					style={styles.svgStyle}
				>
					<AnimatedPath
						d="M301.344 26.7278C320.565 42.6737 333.155 65.7198 335.255 95.2011C341.104 177.318 276.67 235.918 194.378 255.331C174.913 259.923 154.312 262.382 133.181 262.49C180.884 302.418 264.456 324.262 392.703 292.757L397.633 311.045C250.798 347.116 154.69 316.542 103.838 261.134C44.0651 255.307 -17.641 230.51 -68.1946 182.042L-54.1771 168.718C-12.2672 208.899 37.7628 231.553 87.3077 239.89C52.8711 187.206 53.7419 121.47 84.2684 75.183C118.621 23.095 178.379 -1.63838 230.92 1.15233C257.261 2.55139 282.266 10.9 301.344 26.7278ZM113.76 243.005C73.5737 194.467 72.1124 129.059 101.008 85.244C131.337 39.2567 184.09 17.578 229.821 20.007C252.618 21.2178 273.188 28.387 288.369 40.9812C303.407 53.4573 313.757 71.7372 315.519 96.4822C320.5 166.402 266.106 218.958 189.633 236.999C165.806 242.619 140.073 244.786 113.76 243.005Z"
						fill="none"
						stroke="#FFFFFF"
						strokeWidth="3"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeDasharray={2000}
						animatedProps={animatedStrokeProps}
					/>
					
					<AnimatedPath
						d="M301.344 26.7278C320.565 42.6737 333.155 65.7198 335.255 95.2011C341.104 177.318 276.67 235.918 194.378 255.331C174.913 259.923 154.312 262.382 133.181 262.49C180.884 302.418 264.456 324.262 392.703 292.757L397.633 311.045C250.798 347.116 154.69 316.542 103.838 261.134C44.0651 255.307 -17.641 230.51 -68.1946 182.042L-54.1771 168.718C-12.2672 208.899 37.7628 231.553 87.3077 239.89C52.8711 187.206 53.7419 121.47 84.2684 75.183C118.621 23.095 178.379 -1.63838 230.92 1.15233C257.261 2.55139 282.266 10.9 301.344 26.7278ZM113.76 243.005C73.5737 194.467 72.1124 129.059 101.008 85.244C131.337 39.2567 184.09 17.578 229.821 20.007C252.618 21.2178 273.188 28.387 288.369 40.9812C303.407 53.4573 313.757 71.7372 315.519 96.4822C320.5 166.402 266.106 218.958 189.633 236.999C165.806 242.619 140.073 244.786 113.76 243.005Z"
						fill="#BFD0EA"
						fillOpacity={0.3}
						stroke="none"
						animatedProps={animatedFillProps}
					/>
				</Svg>
			</Animated.View>

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
		zIndex: 1,
	},
	svgBox: {
		paddingVertical: 48,
		width: width * 1.1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	svgStyle: {
		position: 'relative',
		left: -width * 0.03,
		overflow: 'visible',
		paddingVertical: 6,
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
		color: '#2F2F2F',
		fontSize: 18,
		fontWeight: '600',
	},
	secondaryButton: {
		backgroundColor: 'transparent',
		borderColor: '#FFFFFF',
		alignItems: 'center',
	},
	secondaryButtonText: {
		color: '#FFFFFF',
		fontSize: 18,
		fontWeight: '600',
	},

});
