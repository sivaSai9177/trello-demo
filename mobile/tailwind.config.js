/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.2)',
          medium: 'rgba(255, 255, 255, 0.15)',
          dark: 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(255, 255, 255, 0.3)',
        },
        accent: {
          blue: '#4facfe',
          purple: '#764ba2',
          pink: '#f093fb',
        },
      },
    },
  },
  plugins: [],
};
