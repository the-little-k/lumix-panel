import * as React from 'react';
import tw, { TwStyle } from 'twin.macro';
import styled from 'styled-components/macro';

export type FlashMessageType = 'success' | 'info' | 'warning' | 'error';

interface Props {
    title?: string;
    children: string;
    type?: FlashMessageType;
}

const tone = (type?: FlashMessageType): TwStyle => {
    switch (type) {
        case 'error':
            return tw`border-red-500/35 bg-red-500/10 text-red-100 ring-red-500/20`;
        case 'info':
            return tw`border-indigo-500/35 bg-indigo-500/10 text-indigo-100 ring-indigo-500/20`;
        case 'success':
            return tw`border-emerald-500/35 bg-emerald-500/10 text-emerald-100 ring-emerald-500/20`;
        case 'warning':
            return tw`border-amber-500/40 bg-amber-500/10 text-amber-100 ring-amber-500/25`;
        default:
            return tw`border-lumix-border/50 bg-white/[0.04] text-[var(--lumix-text)] ring-lumix-border/30`;
    }
};

const titlePill = (type?: FlashMessageType): TwStyle => {
    switch (type) {
        case 'error':
            return tw`bg-red-500/25 text-red-100 ring-1 ring-inset ring-red-400/30`;
        case 'info':
            return tw`bg-indigo-500/25 text-indigo-100 ring-1 ring-inset ring-indigo-400/30`;
        case 'success':
            return tw`bg-emerald-500/25 text-emerald-100 ring-1 ring-inset ring-emerald-400/30`;
        case 'warning':
            return tw`bg-amber-500/25 text-amber-100 ring-1 ring-inset ring-amber-400/35`;
        default:
            return tw`bg-white/10 text-[var(--lumix-text)] ring-1 ring-inset ring-lumix-border/40`;
    }
};

const Container = styled.div<{ $type?: FlashMessageType }>`
    ${tw`flex w-full max-w-full items-start gap-3 rounded-xl border p-3 text-sm leading-snug ring-1 ring-inset backdrop-blur-sm`};
    ${(props) => tone(props.$type)};
`;
Container.displayName = 'MessageBox.Container';

const MessageBox = ({ title, children, type }: Props) => (
    <Container css={tw`lg:inline-flex lg:items-center`} $type={type} role={'alert'}>
        {title && (
            <span
                className={'title'}
                css={[
                    tw`shrink-0 rounded-full px-2.5 py-1 text-2xs font-bold uppercase tracking-wide`,
                    titlePill(type),
                ]}
            >
                {title}
            </span>
        )}
        <span css={tw`min-w-0 flex-1 text-left`}>{children}</span>
    </Container>
);
MessageBox.displayName = 'MessageBox';

export default MessageBox;
