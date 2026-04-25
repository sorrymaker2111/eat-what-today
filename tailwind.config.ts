import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        neon: "0 0 30px rgba(255, 75, 63, 0.28)",
        ink: "10px 10px 0 rgba(28, 22, 18, 0.18)"
      },
      fontFamily: {
        display: ["KaiTi", "STKaiti", "serif"],
        sans: ["Microsoft YaHei", "PingFang SC", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
