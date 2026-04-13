import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import { breakpoint } from '@/theme';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

const Container = styled.div`
    ${breakpoint('sm')`
        ${tw`w-4/5 mx-auto`}
    `};

    ${breakpoint('md')`
        ${tw`p-10`}
    `};

    ${breakpoint('lg')`
        ${tw`w-3/5`}
    `};

    ${breakpoint('xl')`
        ${tw`w-full`}
        max-width: 700px;
    `};
`;

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => (
    <Container>
        {title && <h2 css={tw`py-4 text-center text-3xl font-medium text-[var(--lumix-text)]`}>{title}</h2>}
        <FlashMessageRender css={tw`mb-2 px-1`} />
        <Form {...props} ref={ref}>
            <div
                css={tw`mx-1 flex w-full flex-col overflow-hidden rounded-2xl border border-lumix-border/70 bg-lumix-surface/90 p-6 shadow-xl shadow-black/25 backdrop-blur-xl md:flex-row md:pl-0`}
            >
                <div css={tw`mb-6 flex flex-none select-none flex-col items-center justify-center self-center md:mb-0 md:w-52`}>
                    <div
                        css={tw`bg-gradient-to-br from-indigo-200 via-violet-200 to-indigo-400 bg-clip-text px-4 text-center font-header text-3xl font-bold tracking-tight text-transparent md:text-4xl`}
                    >
                        Lumix Panel
                    </div>
                    <p css={tw`mt-2 px-4 text-center text-xs text-lumix-muted`}>Luminous Hosting</p>
                </div>
                <div css={tw`flex-1 md:border-l md:border-lumix-border/50 md:pl-6`}>{props.children}</div>
            </div>
        </Form>
        <p css={tw`mt-4 text-center text-xs text-lumix-muted`}>
            &copy; {new Date().getFullYear()}&nbsp;
            <a
                rel={'noopener nofollow noreferrer'}
                href={'https://luminoushost.net'}
                target={'_blank'}
                css={tw`font-medium text-lumix-muted no-underline transition-colors hover:text-indigo-300`}
            >
                Luminous Hosting
            </a>
        </p>
    </Container>
));
