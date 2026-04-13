import styled from 'styled-components/macro';
import tw from 'twin.macro';

const SubNavigation = styled.div`
    ${tw`w-full border-b border-lumix-border/50 bg-lumix-surface/60 backdrop-blur-md`};

    & > div {
        ${tw`mx-auto flex max-w-[1400px] items-center gap-1 px-3 py-0 text-sm sm:px-5`};

        & > a,
        & > div {
            ${tw`inline-block whitespace-nowrap rounded-lg px-4 py-3 text-lumix-muted no-underline transition-all duration-150`};

            &:not(:first-of-type) {
                ${tw`ml-1`};
            }

            &:hover {
                ${tw`text-lumix-text bg-white/5`};
            }

            &:active,
            &.active {
                ${tw`text-indigo-200`};
                box-shadow: inset 0 -2px var(--lumix-accent);
            }
        }
    }
`;

export default SubNavigation;
