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
        milho: {
          primary: '#FFD700',
          secondary: '#FFA500',
          accent: '#228B22',
        },
        leite: {
          primary: '#ADD8E6',
          secondary: '#FFFFFF',
          accent: '#228B22',
        },
        etanol: {
          primary: '#1A1F1A',
          secondary: '#FFFFFF',
          accent: '#228B22',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

