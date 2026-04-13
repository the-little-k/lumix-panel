import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEthernet, faHdd, faMemory, faMicrochip, faServer } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerPowerState, ServerStats } from '@/api/server/getServerResourceUsage';
import sendServerPowerSignal from '@/api/server/sendServerPower';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import tw from 'twin.macro';
import Spinner from '@/components/elements/Spinner';
import styled from 'styled-components/macro';
import isEqual from 'react-fast-compare';
import LumixCard from '@/components/lumix/LumixCard';
import LumixStatusBadge, { LumixBadgeTone } from '@/components/lumix/LumixStatusBadge';
import { useFlashKey } from '@/plugins/useFlash';

const isAlarmState = (current: number, limit: number): boolean => limit > 0 && current / (limit * 1024 * 1024) >= 0.9;

const Icon = memo(
    styled(FontAwesomeIcon)<{ $alarm: boolean }>`
        ${(props) => (props.$alarm ? tw`text-red-400` : tw`text-lumix-muted`)};
    `,
    isEqual
);

const IconDescription = styled.p<{ $alarm: boolean }>`
    ${tw`ml-2 text-sm`};
    ${(props) => (props.$alarm ? tw`text-red-100` : tw`text-lumix-muted`)};
`;

function isAllowed(perms: string[], action: string): boolean {
    return perms.includes('*') || perms.includes(action);
}

type Timer = ReturnType<typeof setInterval>;

const powerTone = (status: ServerPowerState | undefined): { label: string; tone: LumixBadgeTone } => {
    if (!status || status === 'offline') {
        return { label: 'Offline', tone: 'danger' };
    }
    if (status === 'running') {
        return { label: 'Online', tone: 'success' };
    }
    if (status === 'starting') {
        return { label: 'Starting', tone: 'warning' };
    }
    if (status === 'stopping') {
        return { label: 'Stopping', tone: 'warning' };
    }
    return { label: 'Unknown', tone: 'neutral' };
};

export default ({ server, className }: { server: Server; className?: string }) => {
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const { clearAndAddHttpError } = useFlashKey('dashboard');
    const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');
    const [stats, setStats] = useState<ServerStats | null>(null);
    const [pendingPower, setPendingPower] = useState<'start' | 'stop' | 'restart' | null>(null);

    const perms = server.userPermissions || [];
    const lifecycleBlocksPower =
        server.isTransferring ||
        server.status === 'installing' ||
        server.status === 'restoring_backup';
    const showPower =
        !lifecycleBlocksPower &&
        (isAllowed(perms, 'control.start') ||
            isAllowed(perms, 'control.stop') ||
            isAllowed(perms, 'control.restart'));

    const getStats = useCallback(
        () =>
            getServerResourceUsage(server.uuid)
                .then((data) => setStats(data))
                .catch((error) => console.error(error)),
        [server.uuid]
    );

    useEffect(() => {
        setIsSuspended(stats?.isSuspended || server.status === 'suspended');
    }, [stats?.isSuspended, server.status]);

    useEffect(() => {
        if (isSuspended) return;

        getStats().then(() => {
            interval.current = setInterval(() => getStats(), 30000);
        });

        return () => {
            interval.current && clearInterval(interval.current);
        };
    }, [isSuspended, getStats]);

    const runPower = (signal: 'start' | 'stop' | 'restart') => {
        setPendingPower(signal);
        sendServerPowerSignal(server.uuid, signal)
            .then(() => {
                window.setTimeout(() => getStats(), 900);
            })
            .catch((error) => {
                clearAndAddHttpError(error);
            })
            .finally(() => setPendingPower(null));
    };

    const alarms = { cpu: false, memory: false, disk: false };
    if (stats) {
        alarms.cpu = server.limits.cpu === 0 ? false : stats.cpuUsagePercent >= server.limits.cpu * 0.9;
        alarms.memory = isAlarmState(stats.memoryUsageInBytes, server.limits.memory);
        alarms.disk = server.limits.disk === 0 ? false : isAlarmState(stats.diskUsageInBytes, server.limits.disk);
    }

    const diskLimit = server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : 'Unlimited';
    const memoryLimit = server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : 'Unlimited';
    const cpuLimit = server.limits.cpu !== 0 ? server.limits.cpu + ' %' : 'Unlimited';

    const status = stats?.status;
    const { label: statusLabel, tone: statusTone } = powerTone(status);
    const powerBusy = pendingPower !== null;

    return (
        <LumixCard className={className}>
            <div css={tw`relative z-10 flex flex-col gap-4 p-5`}>
                <div css={tw`flex flex-col gap-4 xl:flex-row xl:items-start`}>
                    <Link to={`/server/${server.id}`} css={tw`group flex min-w-0 flex-1 flex-col gap-2 no-underline`}>
                        <div css={tw`flex items-start gap-3`}>
                            <div
                                css={tw`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-200 ring-1 ring-indigo-400/20 transition group-hover:bg-indigo-500/20`}
                            >
                                <FontAwesomeIcon icon={faServer} />
                            </div>
                            <div css={tw`min-w-0 flex-1`}>
                                <div css={tw`flex flex-wrap items-center gap-2`}>
                                    <h3 css={tw`truncate text-lg font-semibold text-[var(--lumix-text)]`}>{server.name}</h3>
                                    {stats && !isSuspended && <LumixStatusBadge tone={statusTone}>{statusLabel}</LumixStatusBadge>}
                                </div>
                                {!!server.description && (
                                    <p css={tw`mt-1 line-clamp-2 text-sm text-lumix-muted`}>{server.description}</p>
                                )}
                                <div css={tw`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-lumix-muted`}>
                                    <FontAwesomeIcon icon={faEthernet} css={tw`text-indigo-300/80`} />
                                    <span>
                                        {server.allocations
                                            .filter((alloc) => alloc.isDefault)
                                            .map((allocation) => (
                                                <React.Fragment key={allocation.ip + allocation.port.toString()}>
                                                    {allocation.alias || ip(allocation.ip)}:{allocation.port}
                                                </React.Fragment>
                                            ))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {showPower && !isSuspended && (
                        <div
                            css={tw`flex shrink-0 flex-wrap items-center justify-end gap-2 xl:flex-col xl:items-stretch`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {isAllowed(perms, 'control.start') && (
                                <button
                                    type={'button'}
                                    disabled={powerBusy || status !== 'offline'}
                                    css={tw`rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-2xs font-semibold uppercase tracking-wide text-emerald-200 transition enabled:hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40`}
                                    onClick={() => runPower('start')}
                                >
                                    {pendingPower === 'start' ? '…' : 'Start'}
                                </button>
                            )}
                            {isAllowed(perms, 'control.restart') && (
                                <button
                                    type={'button'}
                                    disabled={powerBusy || !status || status === 'offline'}
                                    css={tw`rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-2xs font-semibold uppercase tracking-wide text-indigo-200 transition enabled:hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-40`}
                                    onClick={() => runPower('restart')}
                                >
                                    {pendingPower === 'restart' ? '…' : 'Restart'}
                                </button>
                            )}
                            {isAllowed(perms, 'control.stop') && (
                                <button
                                    type={'button'}
                                    disabled={
                                        powerBusy ||
                                        status === 'offline' ||
                                        !status ||
                                        status === 'stopping'
                                    }
                                    css={tw`rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-1.5 text-2xs font-semibold uppercase tracking-wide text-red-200 transition enabled:hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40`}
                                    onClick={() => runPower('stop')}
                                >
                                    {pendingPower === 'stop' ? '…' : 'Stop'}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div css={tw`rounded-xl border border-lumix-border/50 bg-black/20 px-4 py-3 sm:px-5`}>
                    {!stats || isSuspended ? (
                        isSuspended ? (
                            <div css={tw`flex justify-center`}>
                                <LumixStatusBadge tone={'danger'}>
                                    {server.status === 'suspended' ? 'Suspended' : 'Connection Error'}
                                </LumixStatusBadge>
                            </div>
                        ) : server.isTransferring || server.status ? (
                            <div css={tw`flex justify-center`}>
                                <LumixStatusBadge tone={'neutral'}>
                                    {server.isTransferring
                                        ? 'Transferring'
                                        : server.status === 'installing'
                                        ? 'Installing'
                                        : server.status === 'restoring_backup'
                                        ? 'Restoring Backup'
                                        : 'Unavailable'}
                                </LumixStatusBadge>
                            </div>
                        ) : (
                            <div css={tw`flex justify-center py-2`}>
                                <Spinner size={'small'} />
                            </div>
                        )
                    ) : (
                        <div css={tw`grid grid-cols-1 gap-4 sm:grid-cols-3`}>
                            <div css={tw`flex items-center justify-center sm:block`}>
                                <div css={tw`flex justify-center`}>
                                    <Icon icon={faMicrochip} $alarm={alarms.cpu} />
                                    <IconDescription $alarm={alarms.cpu}>
                                        {stats.cpuUsagePercent.toFixed(1)}%
                                    </IconDescription>
                                </div>
                                <p css={tw`mt-1 text-center text-2xs text-lumix-muted`}>CPU · {cpuLimit}</p>
                            </div>
                            <div css={tw`flex items-center justify-center sm:block`}>
                                <div css={tw`flex justify-center`}>
                                    <Icon icon={faMemory} $alarm={alarms.memory} />
                                    <IconDescription $alarm={alarms.memory}>
                                        {bytesToString(stats.memoryUsageInBytes)}
                                    </IconDescription>
                                </div>
                                <p css={tw`mt-1 text-center text-2xs text-lumix-muted`}>RAM · {memoryLimit}</p>
                            </div>
                            <div css={tw`flex items-center justify-center sm:block`}>
                                <div css={tw`flex justify-center`}>
                                    <Icon icon={faHdd} $alarm={alarms.disk} />
                                    <IconDescription $alarm={alarms.disk}>
                                        {bytesToString(stats.diskUsageInBytes)}
                                    </IconDescription>
                                </div>
                                <p css={tw`mt-1 text-center text-2xs text-lumix-muted`}>Disk · {diskLimit}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </LumixCard>
    );
};
