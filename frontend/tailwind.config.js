/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Arial",
          "sans-serif"
        ]
      },
      colors: {
        brand: {
          50: "#f0f7fd",
          100: "#dfedf9",
          200: "#c6e0f5",
          300: "#9eccee",
          400: "#70b1e4",
          500: "#4492d8",
          600: "#0064a7", // Azul Institucional Oficial UPLA
          700: "#00558f",
          800: "#044878",
          900: "#0a3d64",
          950: "#062642"
        },
        upla: {
          navy: "#0a192f",
          deep: "#07172b",
          blue: "#0064a7",
          sky: "#0077c8"
        }
      }
    }
  },
  plugins: []
};
