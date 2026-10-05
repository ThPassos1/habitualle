import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
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
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        sand: {
          50: "#F8F4EF",
          100: "#F1E8DC",
          200: "#E6D5C3",
          300: "#D4BFA6",
          400: "#C4A882",
          500: "#B08D62",
          600: "#967552",
          700: "#6F5840",
          800: "#574633",
        },
        terracotta: {
          50: "#FBF4F0",
          100: "#F6E4DA",
          200: "#EBC7B4",
          300: "#D4A08A",
          400: "#C4846A",
          500: "#B56B52",
          600: "#8F5340",
        },
        sage: {
          50: "#F3F6F1",
          100: "#E3EADF",
          200: "#C9D4C2",
          300: "#A8B5A0",
          400: "#8A9A82",
          500: "#73856C",
          600: "#5C6B56",
          700: "#465242",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
