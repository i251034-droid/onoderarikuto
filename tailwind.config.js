/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Deep purple/violet theme
                cosmic: {
                    900: '#0f0a1f',
                    800: '#1a0a2e',
                    700: '#2d1b4e',
                    600: '#3d2660',
                    500: '#4c3575',
                },
                // Rose gold / Pink
                rose: {
                    50: '#fff1f2',
                    100: '#ffe4e6',
                    200: '#fecdd3',
                    300: '#fda4af',
                    400: '#fb7185',
                    500: '#f43f5e',
                    600: '#e11d48',
                },
                // Neon pink
                neon: {
                    pink: '#ff6b9d',
                    purple: '#a855f7',
                    blue: '#818cf8',
                },
                // Glass colors
                glass: {
                    light: 'rgba(255, 255, 255, 0.1)',
                    dark: 'rgba(15, 10, 31, 0.7)',
                }
            },
            fontFamily: {
                'rounded': ['"M PLUS Rounded 1c"', 'sans-serif'],
            },
            boxShadow: {
                'glow': '0 0 20px rgba(236, 72, 153, 0.6), 0 0 40px rgba(168, 85, 247, 0.4)',
                'glow-lg': '0 0 30px rgba(236, 72, 153, 0.6), 0 0 60px rgba(168, 85, 247, 0.4)',
                'glow-pink': '0 0 20px rgba(236, 72, 153, 0.5)',
                'glow-purple': '0 0 20px rgba(168, 85, 247, 0.5)',
                'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
                'neon': '0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor',
            },
            backgroundImage: {
                'gradient-cosmic': 'linear-gradient(135deg, #0f0a1f 0%, #1a0a2e 25%, #2d1b4e 50%, #1a0a2e 75%, #0f0a1f 100%)',
                'gradient-glow': 'linear-gradient(135deg, #ec4899, #a855f7, #818cf8)',
                'gradient-warm': 'linear-gradient(135deg, #f472b6, #fb7185, #fdba74)',
                'gradient-card': 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2))',
            },
            animation: {
                'float': 'float 3s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'shimmer': 'shimmer 2s infinite',
                'twinkle': 'twinkle 3s ease-in-out infinite',
                'gradient': 'gradient-shift 3s ease infinite',
                'heart-beat': 'heart-beat 1.5s ease-in-out infinite',
                'spin-slow': 'spin-slow 20s linear infinite',
            },
            backdropBlur: {
                'xs': '2px',
            }
        },
    },
    plugins: [],
}
