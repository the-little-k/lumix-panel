import React from 'react';
import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';
import Spinner from '@/components/elements/Spinner';

interface Props {
    isLoading?: boolean;
    size?: 'xsmall' | 'small' | 'large' | 'xlarge';
    color?: 'green' | 'red' | 'primary' | 'grey';
    isSecondary?: boolean;
}

const focusRing = tw`focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950`;

const ButtonStyle = styled.button<Omit<Props, 'isLoading'>>`
    ${tw`relative inline-flex items-center justify-center rounded-lg border font-semibold transition-all duration-150`};
    ${focusRing};

    ${(props) =>
        props.size === 'xlarge'
            ? tw`text-base normal-case tracking-normal`
            : tw`text-sm uppercase tracking-wide`};

    ${(props) =>
        ((!props.isSecondary && !props.color) || props.color === 'primary') &&
        css<Props>`
            ${(props) =>
                !props.isSecondary &&
                tw`border-indigo-500/45 bg-indigo-600 text-white shadow-sm shadow-black/15`};

            ${(props) =>
                !props.isSecondary &&
                css`
                    &:hover:not(:disabled) {
                        ${tw`border-indigo-400/55 bg-indigo-500`};
                    }
                `};
        `};

    ${(props) =>
        props.color === 'grey' &&
        css`
            ${tw`border-lumix-border/60 bg-white/10 text-[var(--lumix-text)]`};

            &:hover:not(:disabled) {
                ${tw`border-lumix-border bg-white/[0.14]`};
            }
        `};

    ${(props) =>
        props.color === 'green' &&
        css<Props>`
            ${(props) => !props.isSecondary && tw`border-emerald-500/45 bg-emerald-600 text-white shadow-sm`};

            ${(props) =>
                !props.isSecondary &&
                css`
                    &:hover:not(:disabled) {
                        ${tw`border-emerald-400/55 bg-emerald-500`};
                    }
                `};

            ${(props) =>
                props.isSecondary &&
                css`
                    &:active:not(:disabled) {
                        ${tw`bg-emerald-600 border-emerald-500/50`};
                    }
                `};
        `};

    ${(props) =>
        props.color === 'red' &&
        css<Props>`
            ${(props) => !props.isSecondary && tw`border-red-500/45 bg-red-600 text-white shadow-sm`};

            ${(props) =>
                !props.isSecondary &&
                css`
                    &:hover:not(:disabled) {
                        ${tw`border-red-400/55 bg-red-500`};
                    }
                `};

            ${(props) =>
                props.isSecondary &&
                css`
                    &:active:not(:disabled) {
                        ${tw`bg-red-600 border-red-500/50`};
                    }
                `};
        `};

    ${(props) => props.size === 'xsmall' && tw`px-2 py-1 text-xs`};
    ${(props) => (!props.size || props.size === 'small') && tw`px-4 py-2`};
    ${(props) => props.size === 'large' && tw`px-5 py-3 text-sm`};
    ${(props) => props.size === 'xlarge' && tw`w-full px-4 py-3`};

    ${(props) =>
        props.isSecondary &&
        css<Props>`
            ${tw`border-lumix-border/55 bg-transparent text-lumix-muted shadow-none`};

            &:hover:not(:disabled) {
                ${tw`border-lumix-border bg-white/[0.04] text-[var(--lumix-text)]`};
                ${(props) => props.color === 'red' && tw`border-red-500/35 bg-red-500/10 text-red-200`};
                ${(props) =>
                    (!props.color || props.color === 'primary') &&
                    tw`border-indigo-500/30 bg-indigo-500/10 text-indigo-100`};
                ${(props) => props.color === 'green' && tw`border-emerald-500/35 bg-emerald-500/10 text-emerald-100`};
            }
        `};

    &:disabled {
        ${tw`cursor-not-allowed opacity-55`};
    }
`;

type ComponentProps = Omit<JSX.IntrinsicElements['button'], 'ref' | keyof Props> & Props;

const Button: React.FC<ComponentProps> = ({ children, isLoading, ...props }) => (
    <ButtonStyle {...props}>
        {isLoading && (
            <div css={tw`absolute left-0 top-0 flex h-full w-full items-center justify-center`}>
                <Spinner size={'small'} />
            </div>
        )}
        <span css={isLoading ? tw`text-transparent` : undefined}>{children}</span>
    </ButtonStyle>
);

type LinkProps = Omit<JSX.IntrinsicElements['a'], 'ref' | keyof Props> & Props;

const LinkButton: React.FC<LinkProps> = (props) => <ButtonStyle as={'a'} {...props} />;

export { LinkButton, ButtonStyle };
export default Button;
