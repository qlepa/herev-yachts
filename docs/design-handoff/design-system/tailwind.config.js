/** HEREV Design System — Tailwind preset
 *  tailwind.config.js:  module.exports = { presets: [require('./design-system/tailwind.config.js')] }
 *  Load the three font families (Fraunces, Inter, Space Mono) via @fontsource or a <link>.
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        ink: '#0F252E',
        paper: '#ECEFEE',
        teal: '#2C6E77',
        brass: '#94702F',
        gilt: '#C9A45E',
        mist: '#C6CDCC',
        line: 'rgba(15,37,46,0.14)',
        'line-strong': 'rgba(15,37,46,0.28)',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      fontSize: {
        hero: ['64px', { lineHeight: '1.02', letterSpacing: '-0.01em' }],
        h1: ['52px', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
        h2: ['36px', { lineHeight: '1.12', letterSpacing: '-0.01em' }],
        h3: ['24px', { lineHeight: '1.15' }],
        title: ['20px', { lineHeight: '1.1' }],
        lg: ['17px', { lineHeight: '1.6' }],
        body: ['15px', { lineHeight: '1.6' }],
        sm: ['14px', { lineHeight: '1.6' }],
        label: ['11px', { lineHeight: '1' }],
        micro: ['10px', { lineHeight: '1' }],
      },
      fontWeight: {
        'display-light': '340',
        'display-med': '450',
      },
      letterSpacing: {
        wordmark: '0.24em',
        label: '0.30em',
        mono: '0.16em',
      },
      spacing: {
        gutter: '44px',
        section: '70px',
      },
      borderRadius: {
        none: '0',
        cta: '2px',
        soft: '6px',
      },
      boxShadow: {
        card: '0 24px 60px -30px rgba(15,37,46,0.50)',
        panel: '0 30px 70px -34px rgba(15,37,46,0.55)',
      },
      transitionTimingFunction: {
        herev: 'cubic-bezier(.2,.6,.2,1)',
      },
    },
  },
};
