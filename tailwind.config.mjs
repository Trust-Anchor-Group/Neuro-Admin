/** @type {import('tailwindcss').Config} */

const config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            colors: {
                neuroBlue: "#1E88E5",
                neuroBlueLight: "#BBDEFB",
                neuroGreen: "#00C853",
                neuroGreenLight: "#B9F6CA",
                neuroPink: "#E91E63",
                neuroPinkLight: "#F8BBD0",
                neuroGold: "#FFC107",
                neuroGoldLight: "#FFECB3",
                neuroGray: "#ECEFF1",
                neuroDarkGray: "#263238",
                neuroPurple: "#7C4DFF",
                neuroPurpleLight: "#D1C4E9",
                neuroPurpleDark:"#722FAD",
                backgroundDark: "#121212",
                backgroundLight: "#FAFAFA",
                activeGreen:"#085E50",
                obsoletedRed:"#A81123",
                aprovedPurple:"#8F40D4",
                figmaPurple: "#722fad",,
                neuroTextBlack:"#181F25",
                neuroOrange:"#F18334",
                neuroDarkOrange:"#A84700",
                neuroRed:"#F2495C"
            },
            boxShadow: {
                fancy: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
                glowing: "0 0 10px rgba(30, 136, 229, 0.8)",
            },
            fontFamily: {
                fancy: ['"Poppins"', "sans-serif"],
                mono: ["Roboto Mono", "monospace"],
                grotesk: ['Space Grotesk', 'sans-serif'],
            },
        },
    },
    plugins: [],
};

export default config;