/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brown: {
          700: '#5c4033',
        },
      },
      width: {
        'lg': '1300px',
      },
      height: {
        'lg': '750px',
      },
      fontFamily: {
        'comic-sans': ['"Comic Sans MS"', 'cursive', 'sans-serif'], // Menambahkan font Comic Sans
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'spin-slow': { // Ini mungkin sudah ada dari kode awal Anda
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'spin-fast': { // Animasi putaran cepat untuk spinwheel saat awal
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(3600deg)' }, // Memutar 10 kali (360 * 10)
        },
      },
      animation: {
        'fade-in': 'fade-in 1s ease-out',
        'spin-slow': 'spin-slow 2s linear infinite',
        'spin-fast': 'spin-fast 2s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards', // Animasi cepat dengan easing khusus, "forwards" agar tetap di posisi akhir
      },
      transitionTimingFunction: {
        'ease-out-circ': 'cubic-bezier(0.075, 0.82, 0.165, 1)', // Fungsi easing "Circular Out" untuk berhenti halus
      },
      // Anda juga bisa menambahkan durasi transisi jika diperlukan, contoh:
      // transitionDuration: {
      //   '3000': '3000ms', // Untuk transisi 3 detik
      // },
      boxShadow: {
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.5)', // Jika Anda menggunakan shadow 3xl
      },
    },
  },
  plugins: [],
};