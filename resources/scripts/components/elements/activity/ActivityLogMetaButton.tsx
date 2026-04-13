import React, { useState } from 'react';
import { ClipboardListIcon } from '@heroicons/react/outline';
import { Dialog } from '@/components/elements/dialog';
import { Button } from '@/components/elements/button/index';
import tw from 'twin.macro';

export default ({ meta }: { meta: Record<string, unknown> }) => {
    const [open, setOpen] = useState(false);

    return (
        <div css={tw`self-center md:px-4`}>
            <Dialog open={open} onClose={() => setOpen(false)} hideCloseIcon title={'Metadata'}>
                <pre
                    css={tw`overflow-x-auto whitespace-pre-wrap rounded-xl border border-lumix-border/40 bg-black/40 p-3 font-mono text-sm leading-relaxed text-[var(--lumix-text)]`}
                >
                    {JSON.stringify(meta, null, 2)}
                </pre>
                <Dialog.Footer>
                    <Button.Text type={'button'} onClick={() => setOpen(false)}>
                        Close
                    </Button.Text>
                </Dialog.Footer>
            </Dialog>
            <button
                type={'button'}
                aria-describedby={'View additional event metadata'}
                css={tw`rounded-lg p-2 text-lumix-muted transition-colors duration-100 hover:bg-white/5 hover:text-[var(--lumix-text)] group-hover:text-[var(--lumix-text)]`}
                onClick={() => setOpen(true)}
            >
                <ClipboardListIcon className={'h-5 w-5'} />
            </button>
        </div>
    );
};
