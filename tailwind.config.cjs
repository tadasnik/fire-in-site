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
          50: '#fff6ed',
          100: '#ffead5',
          200: '#ffd2a8',
          300: '#ffb171',
          400: '#FF9447',
          500: '#FF8833',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12'
        }
      },
    }
  }
};

module.exports = config;
