import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHdd, faMemory, faMicrochip } from '@fortawesome/free-solid-svg-icons';
import { ServerContext, ServerStatus } from '@/state/server';
import Can from '@/components/elements/Can';
import PowerButtons from '@/components/server/console/PowerButtons';
import LumixStatusBadge, { LumixBadgeTone } from '@/components/lumix/LumixStatusBadge';
import { useServerResourceSummary } from '@/hooks/useServerWebsocketStats';
import tw from 'twin.macro';
import { capitalize } from '@/lib/strings';
import { Alert } from '@/components/elements/alert';
import classNames from 'classnames';

function badgeTone(status: ServerStatus): LumixBadgeTone {
    if (!status || status === 'offline') {
        return 'danger';
    }
    if (status === 'running') {
        return 'success';
    }
    return 'warning';
}

export default () => {
    const name = ServerContext.useStoreState((state) => state.server.data!.name);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const isNodeUnderMaintenance = ServerContext.useStoreState((state) => state.server.data!.isNodeUnderMaintenance);
    const isInstalling = ServerContext.useStoreState((state) => state.server.isInstalling);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data!.isTransferring);
    const { cpu, memory, disk, connected } = useServerResourceSummary();

    const badgeLabel =
        !connected && status !== 'offline'
            ? 'Connecting…'
            : status === null
            ? 'Unknown'
            : capitalize(status);

    return (
        <div css={tw`border-b border-lumix-border/40 bg-lumix-surface/70 px-3 py-4 backdrop-blur-xl sm:px-5`}>
            {(isNodeUnderMaintenance || isInstalling || isTransferring) && (
                <Alert type={'warning'} className={'mb-4'}>
                    {isNodeUnderMaintenance
                        ? 'This node is under maintenance; server actions may be unavailable.'
                        : isInstalling
                        ? 'Installation in progress; most actions are unavailable.'
                        : 'This server is being transferred; actions may be unavailable.'}
                </Alert>
            )}
            <div css={tw`flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between`}>
                <div css={tw`min-w-0 flex-1`}>
                    <div css={tw`flex flex-wrap items-center gap-3`}>
                        <h1 css={tw`truncate font-header text-xl font-semibold text-[var(--lumix-text)] sm:text-2xl`}>
                            {name}
                        </h1>
                        <LumixStatusBadge tone={badgeTone(status)}>
                            <span css={tw`flex items-center gap-1.5`}>
                                <span
                                    className={classNames(
                                        'h-2 w-2 rounded-full',
                                        connected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]' : 'bg-red-400'
                                    )}
                                />
                                {badgeLabel}
                            </span>
                        </LumixStatusBadge>
                    </div>
                    <div
                        css={tw`mt-3 grid max-w-3xl grid-cols-1 gap-2 text-sm text-lumix-muted sm:grid-cols-3`}
                    >
                        <div css={tw`flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2 ring-1 ring-lumix-border/30`}>
                            <FontAwesomeIcon icon={faMicrochip} css={tw`text-indigo-300/90`} />
                            <span css={tw`truncate`}>
                                <span css={tw`text-2xs uppercase tracking-wide text-lumix-muted`}>CPU</span>
                                <br />
                                <span css={tw`text-[var(--lumix-text)]`}>{cpu ?? '—'}</span>
                            </span>
                        </div>
                        <div css={tw`flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2 ring-1 ring-lumix-border/30`}>
                            <FontAwesomeIcon icon={faMemory} css={tw`text-indigo-300/90`} />
                            <span css={tw`truncate`}>
                                <span css={tw`text-2xs uppercase tracking-wide text-lumix-muted`}>RAM</span>
                                <br />
                                <span css={tw`text-[var(--lumix-text)]`}>{memory ?? '—'}</span>
                            </span>
                        </div>
                        <div css={tw`flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2 ring-1 ring-lumix-border/30`}>
                            <FontAwesomeIcon icon={faHdd} css={tw`text-indigo-300/90`} />
                            <span css={tw`min-w-0 truncate`}>
                                <span css={tw`text-2xs uppercase tracking-wide text-lumix-muted`}>Disk</span>
                                <br />
                                <span css={tw`text-[var(--lumix-text)]`}>{disk}</span>
                            </span>
                        </div>
                    </div>
                </div>
                <Can action={['control.start', 'control.stop', 'control.restart']} matchAny>
                    <PowerButtons variant={'compact'} className={'flex w-full flex-wrap justify-end gap-2 xl:w-auto'} />
                </Can>
            </div>
        </div>
    );
};
