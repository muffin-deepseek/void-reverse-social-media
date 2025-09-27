import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Terminal Colors
        terminal: {
          bg: "hsl(var(--terminal-bg))",
          surface: "hsl(var(--terminal-surface))",
          border: "hsl(var(--terminal-border))",
        },
        neon: {
          primary: "hsl(var(--neon-primary))",
          bright: "hsl(var(--neon-bright))",
          dim: "hsl(var(--neon-dim))",
          glow: "hsl(var(--neon-glow))",
        },
        text: {
          neon: "hsl(var(--text-neon))",
          dim: "hsl(var(--text-dim))",
          muted: "hsl(var(--text-muted))",
          white: "hsl(var(--text-white))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        'terminal': ['Courier Prime', 'Courier New', 'monospace'],
        'orbitron': ['Orbitron', 'Courier Prime', 'monospace'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "terminal-flicker": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "neon-pulse": {
          "0%, 100%": { 
            textShadow: "0 0 5px hsl(var(--neon-glow)), 0 0 10px hsl(var(--neon-glow))" 
          },
          "50%": { 
            textShadow: "0 0 2px hsl(var(--neon-glow)), 0 0 5px hsl(var(--neon-glow)), 0 0 8px hsl(var(--neon-glow))" 
          },
        },
        "glitch-shake": {
          "0%": { transform: "skew(0deg)" },
          "10%": { transform: "skew(-2deg)" },
          "20%": { transform: "skew(1deg)" },
          "30%": { transform: "skew(-1deg)" },
          "40%": { transform: "skew(2deg)" },
          "50%": { transform: "skew(0deg)" },
          "60%": { transform: "skew(-1deg)" },
          "70%": { transform: "skew(1deg)" },
          "80%": { transform: "skew(-2deg)" },
          "90%": { transform: "skew(2deg)" },
          "100%": { transform: "skew(0deg)" },
        },
        "delete-slide": {
          "0%": { transform: "translateX(0) scale(1)", opacity: "1" },
          "50%": { transform: "translateX(20px) scale(0.95)", opacity: "0.5" },
          "100%": { transform: "translateX(100%) scale(0.8)", opacity: "0" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "terminal-flicker": "terminal-flicker 2s ease-in-out infinite",
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
        "glitch": "glitch-shake 0.3s ease-in-out infinite alternate",
        "delete-slide": "delete-slide 0.3s ease-in-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
