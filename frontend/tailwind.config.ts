import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: {
          DEFAULT: "#0a0a0a",
          elevated: "#141414",
          glass: "rgba(20, 20, 20, 0.8)",
        },
        border: {
          DEFAULT: "#1f1f1f",
          subtle: "rgba(255, 255, 255, 0.05)",
        },
        primary: {
          DEFAULT: "#0066ff",
          hover: "#0052cc",
          glow: "rgba(0, 102, 255, 0.4)",
        },
        accent: {
          DEFAULT: "#00d4ff",
          glow: "rgba(0, 212, 255, 0.3)",
        },
        text: {
          primary: "#ffffff",
          secondary: "rgba(255, 255, 255, 0.7)",
          tertiary: "rgba(255, 255, 255, 0.4)",
        },
        success: "#00c853",
        warning: "#ffab00",
        error: "#ff3d00",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        shimmer: "shimmer 3s infinite linear",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 20px rgba(0, 102, 255, 0.4), 0 0 40px rgba(0, 102, 255, 0.2)" 
          },
          "50%": { 
            boxShadow: "0 0 30px rgba(0, 102, 255, 0.5), 0 0 60px rgba(0, 102, 255, 0.3)" 
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, #0066ff 0%, #00d4ff 100%)",
        "gradient-dark": "linear-gradient(135deg, #0a0a0a 0%, #141414 100%)",
      },
      boxShadow: {
        "glow-sm": "0 0 15px rgba(0, 102, 255, 0.3)",
        "glow-md": "0 0 30px rgba(0, 102, 255, 0.4)",
        "glow-lg": "0 0 50px rgba(0, 102, 255, 0.5)",
        "glow-accent": "0 0 30px rgba(0, 212, 255, 0.4)",
        "card": "0 4px 24px rgba(0, 0, 0, 0.4)",
        "card-hover": "0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 102, 255, 0.1)",
      },
      borderRadius: {
        "xl": "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      backdropBlur: {
        "xs": "4px",
      },
    },
  },
  plugins: [],
};

export default config;