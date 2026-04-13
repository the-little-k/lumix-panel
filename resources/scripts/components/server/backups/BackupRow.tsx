import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArchive, faEllipsisH, faLock } from '@fortawesome/free-solid-svg-icons';
import { format, formatDistanceToNow } from 'date-fns';
import Spinner from '@/components/elements/Spinner';
import { bytesToString } from '@/lib/formatters';
import Can from '@/components/elements/Can';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import BackupContextMenu from '@/components/server/backups/BackupContextMenu';
import tw from 'twin.macro';
import getServerBackups from '@/api/swr/getServerBackups';
import { ServerBackup } from '@/api/server/types';
import { SocketEvent } from '@/components/server/events';
import LumixCard from '@/components/lumix/LumixCard';
import LumixStatusBadge from '@/components/lumix/LumixStatusBadge';
import LumixMetaItem from '@/components/lumix/LumixMetaItem';

interface Props {
    backup: ServerBackup;
    className?: string;
}

export default ({ backup, className }: Props) => {
    const { mutate } = getServerBackups();

    useWebsocketEvent(`${SocketEvent.BACKUP_COMPLETED}:${backup.uuid}` as SocketEvent, (data) => {
        try {
            const parsed = JSON.parse(data);

            mutate(
                (d) => ({
                    ...d,
                    items: d.items.map((b) =>
                        b.uuid !== backup.uuid
                            ? b
                            : {
                                  ...b,
                                  isSuccessful: parsed.is_successful || true,
                                  checksum: (parsed.checksum_type || '') + ':' + (parsed.checksum || ''),
                                  bytes: parsed.file_size || 0,
                                  completedAt: new Date(),
                              }
                    ),
                }),
                false
            );
        } catch (e) {
            console.warn(e);
        }
    });

    const inProgress = backup.completedAt === null;
    const statusBadge = inProgress ? (
        <LumixStatusBadge tone={'accent'}>In progress</LumixStatusBadge>
    ) : !backup.isSuccessful ? (
        <LumixStatusBadge tone={'danger'}>Failed</LumixStatusBadge>
    ) : (
        <LumixStatusBadge tone={'success'}>Completed</LumixStatusBadge>
    );

    const lockBadge =
        backup.completedAt !== null && backup.isSuccessful && backup.isLocked ? (
            <LumixStatusBadge tone={'warning'}>
                <FontAwesomeIcon icon={faLock} css={tw`mr-1`} />
                Locked
            </LumixStatusBadge>
        ) : null;

    return (
        <LumixCard noHover className={className} css={tw`p-4 sm:p-5`}>
            <div css={tw`flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between`}>
                <div css={tw`flex min-w-0 flex-1 gap-4`}>
                    <div
                        css={tw`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-400/20`}
                    >
                        {inProgress ? (
                            <Spinner size={'small'} />
                        ) : backup.isLocked && backup.isSuccessful ? (
                            <FontAwesomeIcon icon={faLock} className={'text-lg'} />
                        ) : (
                            <FontAwesomeIcon icon={faArchive} className={'text-lg'} />
                        )}
                    </div>
                    <div css={tw`min-w-0 flex-1`}>
                        <div css={tw`flex flex-wrap items-center gap-2`}>
                            <h3 css={tw`break-words text-lg font-semibold text-[var(--lumix-text)]`}>{backup.name}</h3>
                            {statusBadge}
                            {lockBadge}
                        </div>
                        {!inProgress && backup.isSuccessful && (
                            <p css={tw`mt-1 text-sm font-medium text-indigo-200/90`}>{bytesToString(backup.bytes)}</p>
                        )}
                        {backup.checksum ? (
                            <p
                                css={tw`mt-2 truncate font-mono text-2xs text-lumix-muted sm:max-w-2xl`}
                                title={backup.checksum}
                            >
                                {backup.checksum}
                            </p>
                        ) : null}
                        <div css={tw`mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2`}>
                            <LumixMetaItem label={'Created'}>
                                <span title={format(backup.createdAt, 'PPpp')} css={tw`text-xs`}>
                                    {formatDistanceToNow(backup.createdAt, { includeSeconds: true, addSuffix: true })}
                                </span>
                            </LumixMetaItem>
                            <LumixMetaItem label={'Finished'}>
                                {backup.completedAt ? (
                                    <span title={format(backup.completedAt, 'PPpp')} css={tw`text-xs`}>
                                        {formatDistanceToNow(backup.completedAt, {
                                            includeSeconds: true,
                                            addSuffix: true,
                                        })}
                                    </span>
                                ) : (
                                    <span css={tw`text-lumix-muted`}>—</span>
                                )}
                            </LumixMetaItem>
                        </div>
                    </div>
                </div>
                <Can action={['backup.download', 'backup.restore', 'backup.delete']} matchAny>
                    <div css={tw`flex shrink-0 justify-end lg:items-start`}>
                        {!backup.completedAt ? (
                            <div css={tw`p-2 text-transparent`} aria-hidden>
                                <FontAwesomeIcon icon={faEllipsisH} />
                            </div>
                        ) : (
                            <BackupContextMenu backup={backup} />
                        )}
                    </div>
                </Can>
            </div>
        </LumixCard>
    );
};
