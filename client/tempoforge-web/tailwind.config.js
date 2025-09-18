/** @type {import(''tailwindcss'').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        tempoforge: {
          primary: '#D4AF37',
          'primary-focus': '#b38f23',
          secondary: '#5B1A1A',
          accent: '#F97316',
          neutral: '#1C1C1C',
          'base-100': '#0D0D0D',
          'base-200': '#151515',
          'base-300': '#1F1F1F',
          info: '#2563EB',
          success: '#16A34A',
          warning: '#F59E0B',
          error: '#DC2626',
        },
      },
      'light',
      'dark',
      'dracula',
    ],
  },
}
