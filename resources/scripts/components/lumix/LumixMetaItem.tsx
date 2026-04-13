import React from 'react';
import tw from 'twin.macro';

export interface LumixMetaItemProps {
    label: string;
    children: React.ReactNode;
    className?: string;
}

/** Label + value cell for metadata grids inside Lumix cards. */
const LumixMetaItem: React.FC<LumixMetaItemProps> = ({ label, children, className }) => (
    <div className={className} css={tw`min-w-0`}>
        <p css={tw`text-2xs font-semibold uppercase tracking-wide text-lumix-muted`}>{label}</p>
        <div css={tw`mt-0.5 truncate text-sm text-[var(--lumix-text)]`}>{children}</div>
    </div>
);

export default LumixMetaItem;
