import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
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
          50: "hsl(221.2, 83.2%, 96.8%)",
          100: "hsl(221.2, 83.2%, 93.5%)",
          200: "hsl(221.2, 83.2%, 87%)",
          300: "hsl(221.2, 83.2%, 78.4%)",
          400: "hsl(221.2, 83.2%, 65.7%)",
          500: "hsl(var(--primary))",
          600: "hsl(221.2, 83.2%, 46.1%)",
          700: "hsl(221.2, 83.2%, 36.7%)",
          800: "hsl(221.2, 83.2%, 29.4%)",
          900: "hsl(221.2, 83.2%, 23.1%)",
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
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(142.1, 76.2%, 36.3%)",
          foreground: "hsl(355.7, 100%, 97.3%)",
        },
        warning: {
          DEFAULT: "hsl(32.5, 94.6%, 43.7%)",
          foreground: "hsl(210, 40%, 2%)",
        },
        info: {
          DEFAULT: "hsl(199.4, 89.1%, 48.3%)",
          foreground: "hsl(355.7, 100%, 97.3%)",
        },
        // Web3 specific colors
        web3: {
          purple: "hsl(262.1, 83.3%, 57.8%)",
          blue: "hsl(217.2, 91.2%, 59.8%)",
          green: "hsl(142.1, 70.6%, 45.3%)",
          orange: "hsl(25.7, 95%, 53.1%)",
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-web3': 'linear-gradient(135deg, hsl(262.1, 83.3%, 57.8%) 0%, hsl(217.2, 91.2%, 59.8%) 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.8)' },
        },
      },
      boxShadow: {
        'web3': '0 4px 20px rgba(59, 130, 246, 0.15)',
        'web3-lg': '0 10px 40px rgba(59, 130, 246, 0.2)',
        'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
        'inner-web3': 'inset 0 2px 4px rgba(59, 130, 246, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} satisfies Config;

