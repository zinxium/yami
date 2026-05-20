/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        burgundy:      { DEFAULT: '#800020', dark: '#4D0013', light: 'rgba(128,0,32,0.08)' },
        mustard:       { DEFAULT: '#FFDB58', light: 'rgba(255,219,88,0.15)' },
        cream:         '#FAF7F2',
        graphite:      '#222222',
        'dust-grey':   '#CFCFCF',
        'border-soft': '#E8E4DC',
      },
      fontFamily: {
        headline: ['LibreCaslon'],
        body:     ['PlusJakartaSans'],
        mono:     ['SpaceMono'],
      },
      borderRadius: {
        card:   '12px',
        button: '8px',
        pill:   '9999px',
        modal:  '16px',
      },
    },
  },
  plugins: [],
};
