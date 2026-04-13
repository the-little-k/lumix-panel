import React from 'react';
import tw from 'twin.macro';

export interface LumixSectionHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    className?: string;
}

/**
 * Page section title + optional description and action slot (matches console/files hierarchy).
 */
const LumixSectionHeader: React.FC<LumixSectionHeaderProps> = ({ title, description, actions, className }) => (
    <div
        className={className}
        css={tw`mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between`}
    >
        <div css={tw`min-w-0`}>
            <h2 css={tw`text-lg font-semibold tracking-tight text-[var(--lumix-text)] sm:text-xl`}>{title}</h2>
            {description && <p css={tw`mt-1 max-w-2xl text-sm text-lumix-muted`}>{description}</p>}
        </div>
        {actions && <div css={tw`flex shrink-0 flex-wrap items-center gap-2`}>{actions}</div>}
    </div>
);

export default LumixSectionHeader;
