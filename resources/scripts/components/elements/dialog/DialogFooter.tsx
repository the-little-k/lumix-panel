import React, { useContext } from 'react';
import { DialogContext } from './';
import { useDeepCompareEffect } from '@/plugins/useDeepCompareEffect';
import tw from 'twin.macro';

export default ({ children }: { children: React.ReactNode }) => {
    const { setFooter } = useContext(DialogContext);

    useDeepCompareEffect(() => {
        setFooter(
            <div
                css={tw`flex flex-col items-stretch gap-3 border-t border-lumix-border/40 bg-black/20 px-4 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-end sm:px-6`}
            >
                {children}
            </div>
        );
    }, [children]);

    return null;
};
