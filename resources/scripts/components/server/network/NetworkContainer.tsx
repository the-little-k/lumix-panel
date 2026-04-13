import React, { useEffect, useState } from 'react';
import Spinner from '@/components/elements/Spinner';
import { useFlashKey } from '@/plugins/useFlash';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { ServerContext } from '@/state/server';
import AllocationRow from '@/components/server/network/AllocationRow';
import { Button } from '@/components/elements/button/index';
import createServerAllocation from '@/api/server/network/createServerAllocation';
import tw from 'twin.macro';
import Can from '@/components/elements/Can';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import getServerAllocations from '@/api/swr/getServerAllocations';
import isEqual from 'react-fast-compare';
import { useDeepCompareEffect } from '@/plugins/useDeepCompareEffect';
import LumixSectionHeader from '@/components/lumix/LumixSectionHeader';
import LumixEmptyState from '@/components/lumix/LumixEmptyState';

const NetworkContainer = () => {
    const [loading, setLoading] = useState(false);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const allocationLimit = ServerContext.useStoreState((state) => state.server.data!.featureLimits.allocations);
    const allocations = ServerContext.useStoreState((state) => state.server.data!.allocations, isEqual);
    const setServerFromState = ServerContext.useStoreActions((actions) => actions.server.setServerFromState);

    const { clearFlashes, clearAndAddHttpError } = useFlashKey('server:network');
    const { data, error, mutate } = getServerAllocations();

    useEffect(() => {
        mutate(allocations);
    }, []);

    useEffect(() => {
        clearAndAddHttpError(error);
    }, [error]);

    useDeepCompareEffect(() => {
        if (!data) return;

        setServerFromState((state) => ({ ...state, allocations: data }));
    }, [data]);

    const onCreateAllocation = () => {
        clearFlashes();

        setLoading(true);
        createServerAllocation(uuid)
            .then((allocation) => {
                setServerFromState((s) => ({ ...s, allocations: s.allocations.concat(allocation) }));
                return mutate(data?.concat(allocation), false);
            })
            .catch((error) => clearAndAddHttpError(error))
            .then(() => setLoading(false));
    };

    const quota =
        allocationLimit > 0 && data ? (
            <p css={tw`text-sm text-lumix-muted`}>
                <span css={tw`font-medium text-[var(--lumix-text)]`}>{data.length}</span> of {allocationLimit}{' '}
                allocations used
            </p>
        ) : null;

    const createControl =
        allocationLimit > 0 && data && allocationLimit > data.length ? (
            <>
                <SpinnerOverlay visible={loading} />
                <Button type={'button'} onClick={onCreateAllocation}>
                    Create allocation
                </Button>
            </>
        ) : null;

    return (
        <ServerContentBlock showFlashKey={'server:network'} title={'Network'}>
            {!data ? (
                <Spinner size={'large'} centered />
            ) : (
                <>
                    <LumixSectionHeader
                        title={'Allocations'}
                        description={
                            'Each allocation binds an address and port to this server. The primary allocation is shown to players first. Notes save automatically as you type.'
                        }
                        actions={
                            <Can action={'allocation.create'}>
                                {allocationLimit > 0 && data.length === 0 ? createControl : null}
                            </Can>
                        }
                    />
                    {data.length === 0 ? (
                        <LumixEmptyState title={'No allocations yet'}>
                            {allocationLimit > 0 ? (
                                <>
                                    Create an allocation to attach an IP and port. Your plan allows up to{' '}
                                    {allocationLimit}.
                                </>
                            ) : (
                                'This server does not have any allocations yet.'
                            )}
                        </LumixEmptyState>
                    ) : (
                        <div css={tw`flex flex-col gap-3`}>
                            {data.map((allocation) => (
                                <AllocationRow key={`${allocation.ip}:${allocation.port}`} allocation={allocation} />
                            ))}
                        </div>
                    )}
                    <Can action={'allocation.create'}>
                        {allocationLimit > 0 && data.length > 0 && (
                            <div
                                css={tw`mt-8 flex flex-col items-stretch justify-end gap-3 border-t border-lumix-border/30 pt-6 sm:flex-row sm:items-center`}
                            >
                                {quota}
                                {createControl}
                            </div>
                        )}
                    </Can>
                </>
            )}
        </ServerContentBlock>
    );
};

export default NetworkContainer;
