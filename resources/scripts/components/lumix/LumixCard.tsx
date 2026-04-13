import React from 'react';
import tw from 'twin.macro';

export type LumixCardProps = {
    /** When true, omits hover lift (e.g. for nested cards). */
    noHover?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Glass-style surface used across Lumix for panels and server cards.
 */
const LumixCard: React.FC<LumixCardProps> = ({ className, children, noHover, ...rest }) => (
    <div
        className={className}
        css={[
            tw`rounded-2xl border border-lumix-border/80 bg-lumix-surface/90 shadow-xl shadow-black/20 backdrop-blur-xl`,
            !noHover && tw`transition-all duration-200 hover:border-indigo-500/25 hover:shadow-indigo-500/5`,
        ]}
        {...rest}
    >
        {children}
    </div>
);

export default LumixCard;
