import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 主色：靛蓝 + 薄荷绿；点缀：珊瑚橙。经由 CSS 变量驱动明暗主题。
        brand: {
          50: "#eef7f4",
          100: "#d6ede6",
          200: "#aaddce",
          300: "#74c6b0",
          400: "#42ab90",
          500: "#1f8f74",
          600: "#14735d",
          700: "#125c4b",
          800: "#12493d",
          900: "#0f3c33",
        },
        accent: {
          400: "#ff9166",
          500: "#ff7a45",
          600: "#f06134",
        },
        ink: {
          50: "#f6f8fa",
          100: "#eceef1",
          200: "#dbe0e6",
          300: "#c1c9d2",
          400: "#9aa5b1",
          500: "#7b8794",
          600: "#616e7c",
          700: "#4a5568",
          800: "#323f4b",
          900: "#1f2933",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "PingFang SC",
          "Microsoft YaHei",
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)",
        float: "0 4px 12px rgba(16,24,40,0.08), 0 2px 4px rgba(16,24,40,0.04)",
        modal: "0 20px 40px rgba(16,24,40,0.16), 0 8px 16px rgba(16,24,40,0.08)",
      },
      spacing: {
        "18": "4.5rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 240ms ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
