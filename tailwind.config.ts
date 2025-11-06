import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Inconsolata', 'ui-monospace', 'SFMono-Regular'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        'card-foreground': 'hsl(var(--card-foreground))',
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        'popover-foreground': 'hsl(var(--popover-foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        'primary-foreground': 'hsl(var(--primary-foreground))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        'secondary-foreground': 'hsl(var(--secondary-foreground))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        'muted-foreground': 'hsl(var(--muted-foreground))',
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        'accent-foreground': 'hsl(var(--accent-foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        'destructive-foreground': 'hsl(var(--destructive-foreground))',
        blue: 'hsl(var(--blue))',
        lavender: 'hsl(var(--lavender))',
        sky: 'hsl(var(--sky))',
        teal: 'hsl(var(--teal))',
        green: 'hsl(var(--green))',
        yellow: 'hsl(var(--yellow))',
        peach: 'hsl(var(--peach))',
        maroon: 'hsl(var(--maroon))',
        red: 'hsl(var(--red))',
        mauve: 'hsl(var(--mauve))',
        pink: 'hsl(var(--pink))',
        crust: 'hsl(var(--crust))',
        mantle: 'hsl(var(--mantle))',
        base: 'hsl(var(--base))',
        surface0: 'hsl(var(--surface0))',
        surface1: 'hsl(var(--surface1))',
        surface2: 'hsl(var(--surface2))',
        overlay0: 'hsl(var(--overlay0))',
        overlay1: 'hsl(var(--overlay1))',
        overlay2: 'hsl(var(--overlay2))',
        text: 'hsl(var(--text))',
        subtext0: 'hsl(var(--subtext0))',
        subtext1: 'hsl(var(--subtext1))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      boxShadow: {
        glow: '0 20px 45px -20px rgba(87, 82, 123, 0.45)',
      },
      transitionDuration: {
        '400': '400ms',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'var(--radius-xl)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
