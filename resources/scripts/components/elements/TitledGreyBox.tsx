import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import tw from 'twin.macro';
import isEqual from 'react-fast-compare';

interface Props {
    icon?: IconProp;
    title: string | React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

/**
 * Legacy section panel — styled to match Lumix surfaces for upstream parity.
 */
const TitledGreyBox = ({ icon, title, children, className }: Props) => (
    <div
        css={tw`overflow-hidden rounded-2xl border border-lumix-border/80 bg-lumix-surface/90 shadow-lg shadow-black/20 backdrop-blur-xl`}
        className={className}
    >
        <div css={tw`border-b border-lumix-border/30 bg-black/15 px-4 py-3 sm:px-5`}>
            {typeof title === 'string' ? (
                <p css={tw`text-sm font-semibold uppercase tracking-wide text-[var(--lumix-text)]`}>
                    {icon && <FontAwesomeIcon icon={icon} css={tw`mr-2 text-lumix-muted`} />}
                    {title}
                </p>
            ) : (
                title
            )}
        </div>
        <div css={tw`p-4 sm:p-5`}>{children}</div>
    </div>
);

export default memo(TitledGreyBox, isEqual);
