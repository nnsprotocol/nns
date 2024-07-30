/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        body: ["Geist", "sans-serif"],
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1200px",
        "2xl": "1512px",
      },
      colors: {
        textPrimary: "#04030F",
        textSecondary: "#828187",
        textInverse: "#FFFFFF",
        textBrandLavender: "#C496FF",
        textBrandAquamarine: "#86F9E4",
        surfacePrimary: "#04030F",
        surfaceSecondary: "#11101B",
        surfaceInverse: "#FFFFFF",
        surfaceBrandBlue: "#C496FF",
        surfaceBrandMauve: "#86F9E4",
        borderPrimary: "#11101B",
        borderSecondary: "#36353F",
        borderBrandLavender: "#C496FF",
      },
      spacing: {
        none: "0px",
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
      },
      borderRadius: {
        "32": "32px",
        "48": "48px",
        "128": "128px",
      },
      backdropBlur: {
        "1xl": "32px",
      },
      fontSize: {
        xs: ["12px", "12px"],
        sm: ["14px", "14px"],
        base: ["16px", "16px"],
        lg: ["18px", "18px"],
        xl: ["20px", "20px"],
        "2xl": ["24px", "24px"],
        "2.5xl": ["32px", "32px"],
        "3xl": ["48px", "48px"],
        "6.5xl": ["64px", "64px"],
      },
      backgroundImage: {
        'surfacePrimaryGradient': 'linear-gradient(114deg, rgba(17, 16, 27, 0.90) 6.66%, #04030F 96.07%)',
        'cardSurfaceGradient': 'linear-gradient(122deg, rgba(17, 16, 27, 0.01) 8.53%, #04030F 93.04%)',
        'badgeLavenderGradient': 'linear-gradient(269deg, #765A99 0.98%, #C496FF 99.51%)',
        'cardPrimaryGradient': 'linear-gradient(90deg, rgba(17, 16, 27, 0.50) 4.96%, #04030F 100%)',
      },
    },
  },
  plugins: [],
};
