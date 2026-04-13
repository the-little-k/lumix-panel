import tw from 'twin.macro';
import { createGlobalStyle } from 'styled-components/macro';
// @ts-expect-error untyped font file
import font from '@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2';

export default createGlobalStyle`
    @font-face {
        font-family: 'IBM Plex Sans';
        font-style: normal;
        font-display: swap;
        font-weight: 100 700;
        src: url(${font}) format('woff2-variations');
        unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
    }

    :root,
    html[data-theme='dark'] {
        --lumix-bg: #050507;
        --lumix-surface: rgba(16, 18, 26, 0.78);
        --lumix-border: rgba(129, 140, 248, 0.14);
        --lumix-accent: #818cf8;
        --lumix-glow: #a78bfa;
        --lumix-glow-soft: rgba(129, 140, 248, 0.22);
        --lumix-muted: #9ca3af;
        --lumix-text: #e5e7eb;
        --lumix-text-subtle: #9ca3af;
    }

    html[data-theme='light'] {
        --lumix-bg: #f4f5f8;
        --lumix-surface: rgba(255, 255, 255, 0.88);
        --lumix-border: rgba(79, 70, 229, 0.12);
        --lumix-accent: #4f46e5;
        --lumix-glow: #6366f1;
        --lumix-glow-soft: rgba(79, 70, 229, 0.12);
        --lumix-muted: #64748b;
        --lumix-text: #0f172a;
        --lumix-text-subtle: #475569;
    }

    html {
        ${tw`antialiased`};
    }

    body {
        ${tw`font-sans`};
        background-color: var(--lumix-bg);
        background-image: radial-gradient(ellipse 140% 80% at 50% -30%, var(--lumix-glow-soft), transparent),
            radial-gradient(ellipse 80% 50% at 100% 100%, rgba(99, 102, 241, 0.06), transparent);
        color: var(--lumix-text);
        letter-spacing: 0.015em;
        min-height: 100vh;
    }

    h1, h2, h3, h4, h5, h6 {
        ${tw`font-medium tracking-normal font-header`};
        color: var(--lumix-text);
    }

    p {
        ${tw`leading-snug font-sans`};
        color: var(--lumix-text-subtle);
    }

    form {
        ${tw`m-0`};
    }

    textarea, select, input, button, button:focus, button:focus-visible {
        ${tw`outline-none`};
    }

    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
        margin: 0;
    }

    input[type=number] {
        -moz-appearance: textfield !important;
    }

    ::-webkit-scrollbar {
        background: none;
        width: 14px;
        height: 14px;
    }

    ::-webkit-scrollbar-thumb {
        border: solid 0 rgb(0 0 0 / 0%);
        border-right-width: 4px;
        border-left-width: 4px;
        -webkit-border-radius: 9px 4px;
        -webkit-box-shadow: inset 0 0 0 1px var(--lumix-border), inset 0 0 0 4px rgba(15, 23, 42, 0.35);
    }

    ::-webkit-scrollbar-track-piece {
        margin: 4px 0;
    }

    ::-webkit-scrollbar-thumb:horizontal {
        border-right-width: 0;
        border-left-width: 0;
        border-top-width: 4px;
        border-bottom-width: 4px;
        -webkit-border-radius: 4px 9px;
    }

    ::-webkit-scrollbar-corner {
        background: transparent;
    }
`;
