import PageContentBlock, { PageContentBlockProps } from '@/components/elements/PageContentBlock';
import React from 'react';
import { ServerContext } from '@/state/server';
import LumixCard from '@/components/lumix/LumixCard';
import tw from 'twin.macro';

interface Props extends PageContentBlockProps {
    title: string;
    /**
     * Skip the outer Lumix card (e.g. console uses full-bleed terminal + nested cards).
     */
    bare?: boolean;
}

const ServerContentBlock: React.FC<Props> = ({ title, children, bare, ...props }) => {
    const name = ServerContext.useStoreState((state) => state.server.data!.name);

    return (
        <PageContentBlock title={`${name} | ${title}`} {...props}>
            {bare ? (
                <div css={tw`space-y-4`}>{children}</div>
            ) : (
                <LumixCard css={tw`p-4 sm:p-6`}>{children}</LumixCard>
            )}
        </PageContentBlock>
    );
};

export default ServerContentBlock;
