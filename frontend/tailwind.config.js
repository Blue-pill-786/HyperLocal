module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF6B35",
        secondary: "#F7931E",
        dark: "#1A1A1A",
        light: "#F5F5F5",
        success: "#4CAF50",
        error: "#F44336",
        warning: "#FFC107",
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
