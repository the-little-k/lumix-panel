import React from 'react';
import tw from 'twin.macro';

const row = (even: boolean) => [
    tw`flex px-4 py-3 text-sm`,
    even ? tw`bg-white/[0.03]` : tw`bg-transparent`,
];

export default () => {
    return (
        <div css={tw`flex flex-col gap-4 md:flex-row`}>
            <div css={tw`min-w-0 flex-1 overflow-hidden rounded-xl border border-lumix-border/40`}>
                <h3 css={tw`border-b border-lumix-border/30 bg-black/15 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-lumix-muted`}>
                    Examples
                </h3>
                <div css={tw`flex flex-col`}>
                    <div css={row(true)}>
                        <div css={tw`w-1/2 font-mono text-[var(--lumix-text)]`}>{'*/5 * * * *'}</div>
                        <div css={tw`w-1/2 text-lumix-muted`}>Every 5 minutes</div>
                    </div>
                    <div css={row(false)}>
                        <div css={tw`w-1/2 font-mono text-[var(--lumix-text)]`}>{'0 */1 * * *'}</div>
                        <div css={tw`w-1/2 text-lumix-muted`}>Every hour</div>
                    </div>
                    <div css={row(true)}>
                        <div css={tw`w-1/2 font-mono text-[var(--lumix-text)]`}>0 8-12 * * *</div>
                        <div css={tw`w-1/2 text-lumix-muted`}>Hour range</div>
                    </div>
                    <div css={row(false)}>
                        <div css={tw`w-1/2 font-mono text-[var(--lumix-text)]`}>0 0 * * *</div>
                        <div css={tw`w-1/2 text-lumix-muted`}>Once a day</div>
                    </div>
                    <div css={row(true)}>
                        <div css={tw`w-1/2 font-mono text-[var(--lumix-text)]`}>0 0 * * MON</div>
                        <div css={tw`w-1/2 text-lumix-muted`}>Every Monday</div>
                    </div>
                </div>
            </div>
            <div css={tw`min-w-0 flex-1 overflow-hidden rounded-xl border border-lumix-border/40`}>
                <h3 css={tw`border-b border-lumix-border/30 bg-black/15 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-lumix-muted`}>
                    Special characters
                </h3>
                <div css={tw`flex flex-col`}>
                    <div css={row(true)}>
                        <div css={tw`w-1/2 font-mono text-[var(--lumix-text)]`}>*</div>
                        <div css={tw`w-1/2 text-lumix-muted`}>Any value</div>
                    </div>
                    <div css={row(false)}>
                        <div css={tw`w-1/2 font-mono text-[var(--lumix-text)]`}>,</div>
                        <div css={tw`w-1/2 text-lumix-muted`}>Value list separator</div>
                    </div>
                    <div css={row(true)}>
                        <div css={tw`w-1/2 font-mono text-[var(--lumix-text)]`}>-</div>
                        <div css={tw`w-1/2 text-lumix-muted`}>Range of values</div>
                    </div>
                    <div css={row(false)}>
                        <div css={tw`w-1/2 font-mono text-[var(--lumix-text)]`}>/</div>
                        <div css={tw`w-1/2 text-lumix-muted`}>Step values</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
