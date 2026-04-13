import styled from 'styled-components/macro';
import tw from 'twin.macro';

/**
 * Legacy list row — Lumix-aligned for any remaining callers / upstream merges.
 */
export default styled.div<{ $hoverable?: boolean }>`
    ${tw`flex items-center overflow-hidden rounded-xl border border-lumix-border/50 bg-lumix-surface/80 p-4 text-[var(--lumix-text)] no-underline shadow-sm shadow-black/10 backdrop-blur-xl transition-colors duration-150`};

    ${(props) => props.$hoverable !== false && tw`hover:border-indigo-500/30 hover:bg-white/[0.03]`};

    & .icon {
        ${tw`flex w-16 items-center justify-center rounded-xl bg-white/10 p-3 ring-1 ring-lumix-border/40`};
    }
`;
