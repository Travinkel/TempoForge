/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        tempoforge: {
          primary: '#D4AF37',
          secondary: '#800000',
          'base-100': '#0D0D0D',
          neutral: '#1C1C1C',
        },
      },
      'dark',
    ],
    darkTheme: 'tempoforge',
  },
}
