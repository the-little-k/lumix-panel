import React from 'react';
import FlashMessageRender from '@/components/FlashMessageRender';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import tw from 'twin.macro';
import LumixCard from '@/components/lumix/LumixCard';

type Props = Readonly<
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        title?: string;
        borderColor?: string;
        showFlashes?: string | boolean;
        showLoadingOverlay?: boolean;
    }
>;

const ContentBox = ({ title, borderColor, showFlashes, showLoadingOverlay, children, ...props }: Props) => (
    <div {...props}>
        {title && (
            <h2 css={tw`mb-3 text-lg font-semibold tracking-tight text-[var(--lumix-text)] sm:mb-4 sm:text-xl`}>
                {title}
            </h2>
        )}
        {showFlashes && (
            <FlashMessageRender
                byKey={typeof showFlashes === 'string' ? showFlashes : undefined}
                css={tw`mb-4`}
            />
        )}
        <LumixCard
            noHover
            css={tw`relative overflow-hidden p-4 sm:p-5`}
            style={borderColor ? { borderTop: `4px solid ${borderColor}` } : undefined}
        >
            <SpinnerOverlay visible={showLoadingOverlay || false} />
            {children}
        </LumixCard>
    </div>
);

export default ContentBox;
