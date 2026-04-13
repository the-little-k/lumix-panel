import React, { memo } from 'react';
import { ServerContext } from '@/state/server';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import isEqual from 'react-fast-compare';
import Spinner from '@/components/elements/Spinner';
import Features from '@feature/Features';
import Console from '@/components/server/console/Console';
import StatGraphs from '@/components/server/console/StatGraphs';
import ServerDetailsBlock from '@/components/server/console/ServerDetailsBlock';
import LumixCard from '@/components/lumix/LumixCard';
import tw from 'twin.macro';

const ServerConsoleContainer = () => {
    const eggFeatures = ServerContext.useStoreState((state) => state.server.data!.eggFeatures, isEqual);

    return (
        <ServerContentBlock title={'Console'} bare>
            <div css={tw`flex min-h-0 flex-col gap-4`}>
                <LumixCard noHover css={tw`flex min-h-[min(70vh,calc(100vh-15rem))] flex-col overflow-hidden p-0`}>
                    <Spinner.Suspense>
                        <Console />
                    </Spinner.Suspense>
                </LumixCard>
                <LumixCard css={tw`p-4 sm:p-5`}>
                    <ServerDetailsBlock />
                </LumixCard>
                <div css={tw`grid grid-cols-1 gap-4 md:grid-cols-3`}>
                    <Spinner.Suspense>
                        <StatGraphs />
                    </Spinner.Suspense>
                </div>
            </div>
            <Features enabled={eggFeatures} />
        </ServerContentBlock>
    );
};

export default memo(ServerConsoleContainer, isEqual);
