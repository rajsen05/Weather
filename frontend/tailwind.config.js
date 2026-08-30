/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        skyguard: {
          bg: "#0F172A",
          card: "#1E293B",
          accent: "#00F0FF",
          primary: "#0EA5E9",
          text: "#F8FAFC",
          muted: "#94A3B8",
          border: "#334155",
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
          purple: "#A855F7"
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.8)' }
        }
      }
    },
  },
  plugins: [],
}
