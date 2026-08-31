/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#FFF1EF',
          100: '#FFE1DD',
          200: '#FFC7BF',
          300: '#FFA294',
          400: '#FF7D6C',
          500: '#FF5C4D', // base — Primary
          600: '#F23D2C',
          700: '#CC2E1F',
          800: '#A6281C',
          900: '#7A1F17',
        },
        secondary: {
          50:  '#E8ECEA',
          100: '#C7D1CC',
          200: '#A0AFA8',
          300: '#748C81',
          400: '#4D6B5E',
          500: '#2E4A3D',
          600: '#1A2E26', // base — Secondary
          700: '#14241D',
          800: '#0F1A15',
          900: '#0A120E',
        },
        tertiary: {
          50:  '#FFF8E1',
          100: '#FFECB3',
          200: '#FFDF80',
          300: '#FFD24D',
          400: '#FFC826',
          500: '#FFB800', // base — Tertiary
          600: '#E6A600',
          700: '#B38100',
          800: '#805C00',
          900: '#4D3700',
        },
        neutral: {
          50:  '#FDFCF8', // base — Neutral
          100: '#F5F4EF',
          200: '#E8E6DE',
          300: '#D1CFC5',
          400: '#A8A599',
          500: '#7D7A6E',
          600: '#57544A',
          700: '#38362E',
          800: '#211F1A',
          900: '#0F0E0C',
        },
      },
      fontFamily: {
        heading: ['Montserrat', 'ui-sans-serif', 'sans-serif'],
        sans: ['Poppins', 'ui-sans-serif', 'sans-serif'],
      },
      fontSize: {
        xs:   ['0.75rem',  { lineHeight: '1rem' }],     // 12px
        sm:   ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        base: ['1rem',     { lineHeight: '1.5rem' }],   // 16px
        lg:   ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        xl:   ['1.25rem',  { lineHeight: '1.75rem' }],  // 20px
        '2xl':  ['1.5rem',   { lineHeight: '2rem' }],      // 24px
        '3xl':  ['1.875rem', { lineHeight: '2.25rem' }],   // 30px
        '4xl':  ['2.25rem',  { lineHeight: '2.5rem' }],    // 36px
        '5xl':  ['3rem',     { lineHeight: '1.1' }],       // 48px
        '6xl':  ['3.75rem',  { lineHeight: '1.1' }],       // 60px — Headline "Aa"
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}