module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "SF Pro Display",
          "SF Pro Icons",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "SF Mono",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      colors: {
        bg: "rgb(var(--bg))",
        surface: "rgb(var(--surface))",
        text: "rgb(var(--text))",
        muted: "rgb(var(--muted))",
        accent: "rgb(var(--accent))",
        accent2: "rgb(var(--accent-2))",
        border: "rgb(var(--border))",
      },
      boxShadow: {
        soft: "0 20px 60px -40px rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [],
};
