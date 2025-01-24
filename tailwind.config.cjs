const config = {
  content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],

  plugins: [require('flowbite/plugin')],

  darkMode: 'class',

  theme: {
    extend: {
      fontSize: {
        xxs: ['0.7rem', {
          lineHeight: '0.6rem',
          letterSpacing: '-0.03em',
          fontWeight: '500'
        }],
      },

      spacing: { 100: '26rem', 120: '30rem' },
      minWidth: { 100: '26rem', 120: '30rem' },
      colors: {
        // flowbite-svelte
        primary: {
          50: '#FFC499',
          100: '#FFB885',
          200: '#FFAC70',
          300: '#FFA05C',
          400: '#FF9447',
          500: '#FF8833',
          600: '#FF7C1F',
          700: '#FF700A',
          800: '#566000',
          900: '#CF5700'
        }
      },
    }
  }
};

module.exports = config;
