/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          red: '#B91C1C',       // Đỏ đô hành chính
          gold: '#F59E0B',      // Vàng kim
          goldDark: '#D97706',
          blue: '#1D4ED8',      // Xanh dương dịch vụ công
          blueDark: '#1E40AF',
          cream: '#FFFBEB',
          bg: '#F8FAFC'
        }
      },
      screens: {
        'xs': '380px',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
