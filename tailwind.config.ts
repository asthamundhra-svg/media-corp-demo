import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mc: {
          // Strictly blue / black / green - no red, orange, or yellow anywhere.
          bg: "#04070c",
          panel: "#0a1220",
          panel2: "#0e1729",
          border: "#1b2740",
          borderLight: "#263654",
          blue: "#3b82f6",
          blueBright: "#60a5fa",
          blueDeep: "#1d4ed8",
          cyan: "#22d3ee",
          green: "#10b981",
          greenDeep: "#059669",
          slate: "#64748b",
        },
      },
      backgroundImage: {
        "mc-radial":
          "radial-gradient(circle at 15% 0%, rgba(59,130,246,0.12), transparent 45%), radial-gradient(circle at 85% 100%, rgba(16,185,129,0.10), transparent 45%)",
      },
      boxShadow: {
        mc: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 1px 3px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
export default config;
