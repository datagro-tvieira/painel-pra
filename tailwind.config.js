/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{html,js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        'primary': '#1A1F1A',
        'secondary': '#00C853',
        'background': '#1A1F1A',
        'tertiary': '#242b24',
        'quaternary': '#374237',
        'card-bg': '#2A3529',
        'card-text': '#FFFFFF',
        'text-bold-color':'#FFD700',
        'button-bg': '#394B74',
        'button-hover-bg': '#FFD700',
        'labels': '#F5F5DC',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

