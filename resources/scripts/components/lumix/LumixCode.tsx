import React from 'react';
import tw from 'twin.macro';

export type LumixCodeProps = {
    /** `block` for multiline / preformatted snippets. */
    variant?: 'inline' | 'block';
    /** Stronger contrast (e.g. on tinted backgrounds). */
    dark?: boolean;
} & React.HTMLAttributes<HTMLElement>;

/**
 * Inline or block monospace snippet surface aligned with Lumix panels.
 */
const LumixCode: React.FC<LumixCodeProps> = ({
    variant = 'inline',
    dark,
    className,
    children,
    ...rest
}) => (
    <code
        className={className}
        css={[
            tw`font-mono text-sm`,
            variant === 'block' &&
                tw`block w-full max-w-full overflow-x-auto rounded-xl border border-lumix-border/40 bg-black/30 p-3 text-[var(--lumix-text)]`,
            variant === 'inline' &&
                !dark &&
                tw`rounded-md border border-lumix-border/35 bg-black/25 px-1.5 py-px text-[var(--lumix-text)]`,
            variant === 'inline' &&
                dark &&
                tw`rounded-md border border-lumix-border/50 bg-black/40 px-1.5 py-px text-gray-100`,
        ]}
        {...rest}
    >
        {children}
    </code>
);

export default LumixCode;
