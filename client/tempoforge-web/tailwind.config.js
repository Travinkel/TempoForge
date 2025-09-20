/** @type {import('tailwindcss').Config} */
const themes = require('daisyui/src/theming/themes')

const baseLight = themes.light
const baseDark = themes.dark
const baseDracula = themes.dracula

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
  primary: '#d4af37',
  'primary-focus': '#b38728',
  'primary-content': '#120a05',
  secondary: '#8b5a2b',
  'secondary-content': '#fdf2c3',
  accent: '#f97316',
  'accent-content': '#130a04',
  neutral: '#2c1b12',
  'neutral-content': '#fcefd9',
  'base-100': '#110805',
  'base-200': '#1b100b',
  'base-300': '#23150f',
  'base-content': '#fcefd9',
  '--grain-overlay': 'rgba(38, 24, 12, 0.22)',
  info: '#38bdf8',
  'info-content': '#082f49',
  success: '#22c55e',
  'success-content': '#052e16',
  warning: '#fbbf24',
  'warning-content': '#120805',
  error: '#ef4444',
  'error-content': '#220606',
})

const darkTheme = withShared(baseDark, {
  primary: '#0ea5e9',
  'primary-focus': '#0284c7',
  'primary-content': '#04121a',
  secondary: '#38bdf8',
  'secondary-content': '#04121a',
  accent: '#22d3ee',
  'accent-content': '#061017',
  neutral: '#1f2933',
  'neutral-content': '#f3f4f6',
  'base-100': '#111827',
  'base-200': '#0f172a',
  'base-300': '#0b1220',
  'base-content': '#e2e8f0',
  '--grain-overlay': 'rgba(8, 47, 73, 0.22)',
  info: '#38bdf8',
  'info-content': '#082f49',
  success: '#22c55e',
  'success-content': '#052e16',
  warning: '#f59e0b',
  'warning-content': '#120805',
  error: '#ef4444',
  'error-content': '#220606',
})

const lightTheme = withShared(baseLight, {
  primary: '#2563eb',
  'primary-focus': '#1d4ed8',
  'primary-content': '#f8faff',
  secondary: '#0ea5e9',
  'secondary-content': '#f8faff',
  accent: '#0891b2',
  'accent-content': '#ecfeff',
  neutral: '#334155',
  'neutral-content': '#f8f4e8',
  'base-100': '#f9f4e8',
  'base-200': '#efe5d3',
  'base-300': '#e1d4ba',
  'base-content': '#1f2937',
  '--grain-overlay': 'rgba(255, 255, 255, 0.45)',
  info: '#2563eb',
  'info-content': '#0b1f50',
  success: '#16a34a',
  'success-content': '#052e16',
  warning: '#f59e0b',
  'warning-content': '#422006',
  error: '#dc2626',
  'error-content': '#450a0a',
})

const draculaTheme = withShared(baseDracula, {
  primary: '#7c3aed',
  'primary-focus': '#5b21b6',
  'primary-content': '#f5f3ff',
  secondary: '#22d3ee',
  'secondary-content': '#04121a',
  accent: '#84cc16',
  'accent-content': '#071008',
  neutral: '#221433',
  'neutral-content': '#f3e8ff',
  'base-100': '#1b102b',
  'base-200': '#25133b',
  'base-300': '#2d1849',
  'base-content': '#f3e8ff',
  '--grain-overlay': 'rgba(76, 29, 149, 0.22)',
  info: '#38bdf8',
  'info-content': '#082f49',
  success: '#22c55e',
  'success-content': '#052e16',
  warning: '#facc15',
  'warning-content': '#422006',
  error: '#f87171',
  'error-content': '#450a0a',
})

const lordOfTerrorTheme = withShared(baseDark, {
  primary: '#ef4444',
  'primary-focus': '#b91c1c',
  'primary-content': '#1b0404',
  secondary: '#f97316',
  'secondary-content': '#1b0404',
  accent: '#fbbf24',
  'accent-content': '#1c0a02',
  neutral: '#130505',
  'neutral-content': '#fef2f2',
  'base-100': '#140303',
  'base-200': '#1c0404',
  'base-300': '#260606',
  'base-content': '#fef2f2',
  '--grain-overlay': 'rgba(127, 29, 29, 0.24)',
  info: '#fb7185',
  'info-content': '#450a0a',
  success: '#facc15',
  'success-content': '#422006',
  warning: '#f97316',
  'warning-content': '#1f0a02',
  error: '#f43f5e',
  'error-content': '#4c0519',
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
