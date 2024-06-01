// tailwind.config.js
import { createThemes } from 'tw-colors';

export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        fontSize: {
            'sm': '12px',
            'base': '14px',
            'xl': '16px',
            '2xl': '20px',
            '3xl': '28px',
            '4xl': '38px',
            '5xl': '50px',
        },
        extend: {
            fontFamily: {
                inter: ["'Inter'", "sans-serif"],
                gelasio: ["'Gelasio'", "serif"]
            },
            colors: {
                // Define custom colors here if needed
            },
            backgroundImage: {
                // Standard Tailwind way to define gradients
                // 'gradient-to-r-pink-purple': 'linear-gradient(to right, #8B46FF, #FF4E4E)',
                // 'gradient-to-r-dark-pink-purple': 'linear-gradient(to right, #582C8E, #991F1F)',
                'custom-gradient': 'linear-gradient(to top right, var(--tw-gradient-stops));'
            },
        },
    },
    plugins: [
        createThemes({
            light: {
                'white': '#ecfeff',
                'black': '#334155',
                'grey': '#e2e8f0',
                'dark-grey': '#6B6B6B',
                'red': '#FF4E4E',
                'transparent': 'transparent',
                'twitter': '#1DA1F2',
                'purple': '#7e22ce',
                
            },
            dark: {
                'white': '#242424',
                'black': '#cffafe',
                'grey': '#2A2A2A',
                'dark-grey': '#E7E7E7',
                'red': '#ef4444',
                'transparent': 'transparent',
                'twitter': '#0E71A8',
                'purple': '#e9d5ff',
            },
        })
    ],
};
