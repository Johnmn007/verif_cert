/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#0f172a",
        mist: "#f8fafc",
        civic: {
          DEFAULT: "#1b365d", // Azul Marino Institucional
          hover: "#10233f",
          light: "#e8eff7",
          subtle: "#d2e1f2",
        },
        signal: "#b45309",
        danger: "#b91c1c",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
