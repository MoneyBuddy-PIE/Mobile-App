import { StyleSheet } from "react-native";

export const typography = StyleSheet.create({
	// Polices de bases
	regular: {
		fontFamily: "DMSans_400Regular",
	},
	semiBold: {
		fontFamily: "DMSans_600SemiBold",
	},
	bold: {
		fontFamily: "DMSans_700Bold",
	},
	regularTitleSplash: {
		fontFamily: "Corben_400Regular",
	},
	regularBodySplash: {
		fontFamily: "PlusJakartaSans_400Regular",
	},

	// Tailles
	xs: { fontSize: 12 },
	sm: { fontSize: 14 },
	md: { fontSize: 16 },
	lg: { fontSize: 18 },
	xl: { fontSize: 20 },
	"2xl": { fontSize: 24 },
	"3xl": { fontSize: 32 },
    xxxxl: { fontSize: 40 },
    "5xl": { fontSize: 48 },

	// Couleurs courantes
	primary: { color: "#333" },
	secondary: { color: "#666" },
	accent: { color: "#6C5CE7" },
	muted: { color: "#999" },
	white: { color: "#fff" },

	// Styles combinés les plus courants
	titleSplash: {
		fontFamily: "Corben_400Regular",
		fontSize: 40,
		color: "#fff",
		textAlign: "center",
		lineHeight: 64,
	},
	bodySplash: {
		fontFamily: "PlusJakartaSans_400Regular",
		fontSize: 20,
		color: "#fff",
		textAlign: "center",
	},
	subtitleSplash: {
		fontFamily: "PlusJakartaSans_400Regular",
		fontSize: 12,
		color: "#fff",
		textAlign: "center",
	},
	title: {
		fontFamily: "DMSans_700Bold",
		fontSize: 32,
		color: "#333",
	},
	subtitle: {
		fontFamily: "DMSans_400Regular",
		fontSize: 16,
		color: "#666",
		lineHeight: 22,
	},
	heading: {
		fontFamily: "DMSans_700Bold",
		fontSize: 24,
		color: "#2F2F2F",
	},
	subheading: {
		fontFamily: "DMSans_600SemiBold",
		fontSize: 18,
		color: "#333",
	},
	body: {
		fontFamily: "DMSans_400Regular",
		fontSize: 16,
		color: "#333",
	},
	caption: {
		fontFamily: "DMSans_400Regular",
		fontSize: 12,
		color: "#666",
	},
	button: {
		fontFamily: "DMSans_600SemiBold",
		fontSize: 16,
	},
	buttonSmall: {
		fontFamily: "DMSans_600SemiBold",
		fontSize: 14,
	},
	greeting: {
		fontFamily: "DMSans_400Regular",
		fontSize: 18,
		color: "#666",
	},
	roleText: {
		fontFamily: "DMSans_600SemiBold",
		fontSize: 14,
		color: "#fff",
	},
});
