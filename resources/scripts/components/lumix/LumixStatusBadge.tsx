import React from 'react';
import tw from 'twin.macro';

export type LumixBadgeTone = 'success' | 'warning' | 'danger' | 'neutral' | 'accent';

const toneStyles: Record<LumixBadgeTone, ReturnType<typeof tw>> = {
    success: tw`bg-emerald-500/15 text-emerald-300 ring-emerald-500/30`,
    warning: tw`bg-amber-500/15 text-amber-200 ring-amber-500/35`,
    danger: tw`bg-red-500/15 text-red-300 ring-red-500/35`,
    neutral: tw`bg-neutral-500/15 text-neutral-300 ring-neutral-500/25`,
    accent: tw`bg-indigo-500/15 text-indigo-200 ring-indigo-500/35`,
};

export interface LumixStatusBadgeProps {
    children: React.ReactNode;
    tone?: LumixBadgeTone;
    className?: string;
}

const LumixStatusBadge: React.FC<LumixStatusBadgeProps> = ({ children, tone = 'neutral', className }) => (
    <span
        className={className}
        css={[tw`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset`, toneStyles[tone]]}
    >
        {children}
    </span>
);

export default LumixStatusBadge;
