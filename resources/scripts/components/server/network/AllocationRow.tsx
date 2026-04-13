import React, { memo, useCallback, useState } from 'react';
import isEqual from 'react-fast-compare';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import InputSpinner from '@/components/elements/InputSpinner';
import { Textarea } from '@/components/elements/Input';
import Can from '@/components/elements/Can';
import { Button } from '@/components/elements/button/index';
import { Allocation } from '@/api/server/getServer';
import { debounce } from 'debounce';
import setServerAllocationNotes from '@/api/server/network/setServerAllocationNotes';
import { useFlashKey } from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import CopyOnClick from '@/components/elements/CopyOnClick';
import DeleteAllocationButton from '@/components/server/network/DeleteAllocationButton';
import setPrimaryServerAllocation from '@/api/server/network/setPrimaryServerAllocation';
import getServerAllocations from '@/api/swr/getServerAllocations';
import { ip } from '@/lib/formatters';
import Code from '@/components/elements/Code';
import LumixCard from '@/components/lumix/LumixCard';
import LumixMetaItem from '@/components/lumix/LumixMetaItem';
import LumixStatusBadge from '@/components/lumix/LumixStatusBadge';

interface Props {
    allocation: Allocation;
}

const AllocationRow = ({ allocation }: Props) => {
    const [loading, setLoading] = useState(false);
    const { clearFlashes, clearAndAddHttpError } = useFlashKey('server:network');
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { mutate } = getServerAllocations();

    const onNotesChanged = useCallback((id: number, notes: string) => {
        mutate((data) => data?.map((a) => (a.id === id ? { ...a, notes } : a)), false);
    }, []);

    const setAllocationNotes = debounce((notes: string) => {
        setLoading(true);
        clearFlashes();

        setServerAllocationNotes(uuid, allocation.id, notes)
            .then(() => onNotesChanged(allocation.id, notes))
            .catch((error) => clearAndAddHttpError(error))
            .then(() => setLoading(false));
    }, 750);

    const setPrimaryAllocation = () => {
        clearFlashes();
        mutate((data) => data?.map((a) => ({ ...a, isDefault: a.id === allocation.id })), false);

        setPrimaryServerAllocation(uuid, allocation.id).catch((error) => {
            clearAndAddHttpError(error);
            mutate();
        });
    };

    return (
        <LumixCard css={tw`overflow-hidden p-4 sm:p-5`}>
            <div css={tw`flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between`}>
                <div css={tw`flex min-w-0 flex-1 gap-4`}>
                    <div
                        css={tw`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400/20`}
                    >
                        <FontAwesomeIcon icon={faNetworkWired} className={'text-lg'} />
                    </div>
                    <div css={tw`grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`}>
                        <LumixMetaItem label={allocation.alias ? 'Hostname' : 'IP address'}>
                            {allocation.alias ? (
                                <CopyOnClick text={allocation.alias}>
                                    <Code dark className={'block truncate'}>
                                        {allocation.alias}
                                    </Code>
                                </CopyOnClick>
                            ) : (
                                <CopyOnClick text={ip(allocation.ip)}>
                                    <Code dark>{ip(allocation.ip)}</Code>
                                </CopyOnClick>
                            )}
                        </LumixMetaItem>
                        <LumixMetaItem label={'Port'}>
                            <Code dark>{allocation.port}</Code>
                        </LumixMetaItem>
                        <LumixMetaItem label={'Role'}>
                            {allocation.isDefault ? (
                                <LumixStatusBadge tone={'accent'}>Primary</LumixStatusBadge>
                            ) : (
                                <span css={tw`text-sm text-lumix-muted`}>Secondary</span>
                            )}
                        </LumixMetaItem>
                    </div>
                </div>
                <div
                    css={tw`flex shrink-0 flex-col gap-3 border-t border-lumix-border/30 pt-4 lg:w-56 lg:border-0 lg:pt-0 xl:w-60`}
                >
                    {allocation.isDefault ? (
                        <p css={tw`text-right text-xs leading-relaxed text-lumix-muted lg:text-left`}>
                            This is the default endpoint Wings and the panel use first.
                        </p>
                    ) : (
                        <div css={tw`flex flex-wrap items-center justify-end gap-2 lg:justify-start`}>
                            <Can action={'allocation.update'}>
                                <Button.Text size={Button.Sizes.Small} onClick={setPrimaryAllocation}>
                                    Make primary
                                </Button.Text>
                            </Can>
                            <Can action={'allocation.delete'}>
                                <DeleteAllocationButton allocation={allocation.id} />
                            </Can>
                        </div>
                    )}
                </div>
            </div>
            <div css={tw`mt-5`}>
                <p css={tw`text-2xs font-semibold uppercase tracking-wide text-lumix-muted`}>Notes</p>
                <InputSpinner visible={loading}>
                    <Textarea
                        className={
                            'mt-1.5 border-lumix-border/40 bg-black/20 hover:border-lumix-border/60 focus:border-indigo-500/40'
                        }
                        placeholder={'Optional notes for this allocation'}
                        defaultValue={allocation.notes || undefined}
                        onChange={(e) => setAllocationNotes(e.currentTarget.value)}
                    />
                </InputSpinner>
            </div>
        </LumixCard>
    );
};

export default memo(AllocationRow, isEqual);
