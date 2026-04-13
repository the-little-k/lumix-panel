import React from 'react';
import tw from 'twin.macro';
import LumixCard from '@/components/lumix/LumixCard';

export interface LumixEmptyStateProps {
    title: string;
    children?: React.ReactNode;
    className?: string;
}

/**
 * Dashed premium empty state for server lists.
 */
const LumixEmptyState: React.FC<LumixEmptyStateProps> = ({ title, children, className }) => (
    <LumixCard noHover className={className} css={tw`border-dashed border-lumix-border/50 px-6 py-14 text-center`}>
        <p css={tw`text-sm font-medium text-[var(--lumix-text)]`}>{title}</p>
        {children && <div css={tw`mt-2 text-sm leading-relaxed text-lumix-muted`}>{children}</div>}
    </LumixCard>
);

export default LumixEmptyState;
