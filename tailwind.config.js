const colors = require('tailwindcss/colors');

const gray = {
    50: 'hsl(216, 33%, 97%)',
    100: 'hsl(214, 15%, 91%)',
    200: 'hsl(210, 16%, 82%)',
    300: 'hsl(211, 13%, 65%)',
    400: 'hsl(211, 10%, 53%)',
    500: 'hsl(211, 12%, 43%)',
    600: 'hsl(209, 14%, 37%)',
    700: 'hsl(209, 18%, 30%)',
    800: 'hsl(209, 20%, 25%)',
    900: 'hsl(210, 24%, 16%)',
};

module.exports = {
    content: [
        './resources/scripts/**/*.{js,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                header: ['"IBM Plex Sans"', '"Roboto"', 'system-ui', 'sans-serif'],
            },
            colors: {
                black: '#131a20',
                primary: colors.blue,
                gray: gray,
                neutral: gray,
                cyan: colors.cyan,
                lumix: {
                    bg: 'var(--lumix-bg)',
                    surface: 'var(--lumix-surface)',
                    border: 'var(--lumix-border)',
                    accent: 'var(--lumix-accent)',
                    glow: 'var(--lumix-glow)',
                    muted: 'var(--lumix-muted)',
                },
            },
            fontSize: {
                '2xs': '0.625rem',
            },
            transitionDuration: {
                250: '250ms',
            },
            borderColor: theme => ({
                default: theme('colors.neutral.400', 'currentColor'),
            }),
            boxShadow: {
                lumix: '0 0 40px -12px var(--lumix-glow-soft)',
            },
            backgroundImage: {
                'lumix-gradient':
                    'radial-gradient(1200px 600px at 10% -20%, var(--lumix-glow-soft), transparent 55%), radial-gradient(900px 500px at 100% 0%, rgba(99, 102, 241, 0.08), transparent 50%)',
            },
        },
    },
    plugins: [
        require('@tailwindcss/line-clamp'),
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
    ]
};
