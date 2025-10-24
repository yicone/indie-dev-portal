import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["JetBrains Mono", "Inconsolata", "ui-monospace", "SFMono-Regular"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        blue: "hsl(var(--blue))",
        lavender: "hsl(var(--lavender))",
        sky: "hsl(var(--sky))",
        teal: "hsl(var(--teal))",
        green: "hsl(var(--green))",
        yellow: "hsl(var(--yellow))",
        peach: "hsl(var(--peach))",
        maroon: "hsl(var(--maroon))",
        red: "hsl(var(--red))",
        mauve: "hsl(var(--mauve))",
        pink: "hsl(var(--pink))",
        surface0: "hsl(var(--surface0))",
        surface1: "hsl(var(--surface1))",
        surface2: "hsl(var(--surface2))",
        overlay0: "hsl(var(--overlay0))",
        overlay1: "hsl(var(--overlay1))",
        overlay2: "hsl(var(--overlay2))",
      },
      boxShadow: {
        glow: "0 20px 45px -20px rgba(87, 82, 123, 0.45)",
      },
      transitionDuration: {
        400: "400ms",
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
        xl: "var(--radius-xl)",
      },
    },
  },
  plugins: [],
};

export default config;
