
/** @type {import('tailwindcss').Config} */
const themes = require('daisyui/src/theming/themes')

const baseLight = themes['[data-theme=light]']
const baseDark = themes['[data-theme=dark]']
const baseDracula = themes['[data-theme=dracula]']

const sharedTokens = {
  '--rounded-box': '1.25rem',
  '--rounded-btn': '0.75rem',
  '--rounded-badge': '0.85rem',
  '--btn-text-case': 'uppercase',
  '--tab-radius': '0.75rem',
}

const withShared = (base, overrides) => ({
  ...base,
  ...sharedTokens,
  ...overrides,
})

const tempoforgeTheme = withShared(baseDark, {
  primary: '#D4AF37',
  'primary-focus': '#B38F23',
  'primary-content': '#130D06',
  secondary: '#5B1A1A',
  accent: '#F97316',
  neutral: '#20160F',
  'base-100': '#0F0A07',
  'base-200': '#170E09',
  'base-300': '#1F1510',
  info: '#2563EB',
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#DC2626',
  '--surface-color': '#0F0A07',
  '--surface-bg': 'radial-gradient(circle at 20% -15%, rgba(249, 115, 22, 0.16), transparent 60%)',
  '--card-bg': 'linear-gradient(180deg, rgba(19, 10, 6, 0.96), rgba(12, 6, 3, 0.94))',
  '--card-border': 'rgba(212, 175, 55, 0.35)',
  '--card-shadow': '0 32px 48px rgba(212, 175, 55, 0.2)',
  '--card-border-hover': 'rgba(255, 198, 109, 0.75)',
  '--card-shadow-hover': '0 36px 60px rgba(249, 115, 22, 0.28)',
  '--text-glow': 'rgba(249, 115, 22, 0.35)',
})

const darkTheme = withShared(baseDark, {
  primary: '#B22222',
  secondary: '#FF4500',
  accent: '#8B0000',
  neutral: '#0B0B0B',
  'base-100': '#1A0000',
  'base-200': '#140000',
  'base-300': '#0D0000',
  '--rounded-box': '0.5rem',
  '--rounded-btn': '0.375rem',
  '--surface-color': '#1A0000',
  '--surface-bg': 'radial-gradient(circle at 40% -20%, rgba(255, 69, 0, 0.18), transparent 60%)',
  '--card-bg': 'linear-gradient(180deg, rgba(24, 4, 4, 0.96), rgba(10, 1, 1, 0.92))',
  '--card-border': 'rgba(255, 69, 0, 0.4)',
  '--card-shadow': '0 30px 54px rgba(178, 34, 34, 0.28)',
  '--card-border-hover': 'rgba(255, 140, 0, 0.55)',
  '--card-shadow-hover': '0 36px 68px rgba(255, 69, 0, 0.32)',
  '--text-glow': 'rgba(255, 160, 122, 0.38)',
})

const lightTheme = withShared(baseLight, {
  '--surface-color': '#f8fafc',
  '--surface-bg': 'radial-gradient(circle at 30% -20%, rgba(59, 130, 246, 0.12), transparent 65%)',
  '--card-bg': 'linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(241, 245, 249, 0.94))',
  '--card-border': 'rgba(15, 23, 42, 0.12)',
  '--card-shadow': '0 25px 50px rgba(15, 23, 42, 0.15)',
  '--card-border-hover': 'rgba(15, 23, 42, 0.22)',
  '--card-shadow-hover': '0 32px 60px rgba(15, 23, 42, 0.2)',
  '--text-glow': 'rgba(59, 130, 246, 0.35)',
})

const draculaTheme = withShared(baseDracula, {
  '--surface-color': '#0f0820',
  '--surface-bg': 'radial-gradient(circle at 45% -20%, rgba(168, 85, 247, 0.18), transparent 65%)',
  '--card-bg': 'linear-gradient(180deg, rgba(26, 16, 43, 0.95), rgba(20, 12, 34, 0.92))',
  '--card-border': 'rgba(168, 85, 247, 0.35)',
  '--card-shadow': '0 30px 60px rgba(126, 34, 206, 0.25)',
  '--card-border-hover': 'rgba(168, 85, 247, 0.55)',
  '--card-shadow-hover': '0 36px 70px rgba(168, 85, 247, 0.32)',
  '--text-glow': 'rgba(192, 132, 252, 0.4)',
})

const lordOfTerrorTheme = withShared(baseDark, {
  primary: '#f87171',
  'primary-focus': '#dc2626',
  'primary-content': '#1c0503',
  secondary: '#991b1b',
  accent: '#ea580c',
  neutral: '#1E0A0A',
  'base-100': '#160202',
  'base-200': '#1f0505',
  'base-300': '#240606',
  info: '#fbbf24',
  success: '#22c55e',
  warning: '#f97316',
  error: '#ef4444',
  '--surface-color': '#130200',
  '--surface-bg': 'radial-gradient(circle at 50% -20%, rgba(220, 38, 38, 0.2), transparent 65%)',
  '--card-bg': 'linear-gradient(180deg, rgba(30, 4, 4, 0.96), rgba(18, 2, 2, 0.94))',
  '--card-border': 'rgba(239, 68, 68, 0.45)',
  '--card-shadow': '0 32px 52px rgba(239, 68, 68, 0.22)',
  '--card-border-hover': 'rgba(248, 113, 113, 0.65)',
  '--card-shadow-hover': '0 38px 72px rgba(248, 113, 113, 0.28)',
  '--text-glow': 'rgba(248, 113, 113, 0.4)',
})

module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      { tempoforge: tempoforgeTheme },
      { dark: darkTheme },
      { light: lightTheme },
      { dracula: draculaTheme },
      { 'lord-of-terror': lordOfTerrorTheme },
    ],
  },
}
