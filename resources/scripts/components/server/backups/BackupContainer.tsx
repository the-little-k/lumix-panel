import React, { useContext, useEffect, useState } from 'react';
import Spinner from '@/components/elements/Spinner';
import useFlash from '@/plugins/useFlash';
import Can from '@/components/elements/Can';
import CreateBackupButton from '@/components/server/backups/CreateBackupButton';
import tw from 'twin.macro';
import getServerBackups, { Context as ServerBackupContext } from '@/api/swr/getServerBackups';
import { ServerContext } from '@/state/server';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Pagination from '@/components/elements/Pagination';
import BackupRow from '@/components/server/backups/BackupRow';
import LumixSectionHeader from '@/components/lumix/LumixSectionHeader';
import LumixEmptyState from '@/components/lumix/LumixEmptyState';

const BackupContainer = () => {
    const { page, setPage } = useContext(ServerBackupContext);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { data: backups, error, isValidating } = getServerBackups();

    const backupLimit = ServerContext.useStoreState((state) => state.server.data!.featureLimits.backups);

    useEffect(() => {
        if (!error) {
            clearFlashes('backups');

            return;
        }

        clearAndAddHttpError({ error, key: 'backups' });
    }, [error]);

    if (!backups || (error && isValidating)) {
        return (
            <ServerContentBlock title={'Backups'}>
                <div css={tw`flex justify-center py-16`}>
                    <Spinner size={'large'} />
                </div>
            </ServerContentBlock>
        );
    }

    const quota =
        backupLimit > 0 && backups.backupCount > 0 ? (
            <p css={tw`text-sm text-lumix-muted`}>
                <span css={tw`font-medium text-[var(--lumix-text)]`}>{backups.backupCount}</span> of {backupLimit}{' '}
                backups stored
            </p>
        ) : null;

    return (
        <ServerContentBlock title={'Backups'} showFlashKey={'backups'}>
            <LumixSectionHeader
                title={'Server backups'}
                description={
                    'Snapshots of your server files. Completed backups can be downloaded, restored, or locked against deletion.'
                }
                actions={
                    <Can action={'backup.create'}>
                        {backupLimit > 0 &&
                        backupLimit > backups.backupCount &&
                        backups.backupCount === 0 ? (
                            <CreateBackupButton />
                        ) : null}
                    </Can>
                }
            />
            <Pagination data={backups} onPageSelect={setPage}>
                {({ items }) =>
                    !items.length ? (
                        !backupLimit ? null : page > 1 ? (
                            <LumixEmptyState title={'No more backups on this page'}>
                                Try going back a page or create a new backup.
                            </LumixEmptyState>
                        ) : (
                            <LumixEmptyState title={'No backups yet'}>
                                Create a backup to capture your server files. Locked backups stay safe from automatic
                                cleanup.
                            </LumixEmptyState>
                        )
                    ) : (
                        <div css={tw`flex flex-col gap-3`}>
                            {items.map((backup) => (
                                <BackupRow key={backup.uuid} backup={backup} />
                            ))}
                        </div>
                    )
                }
            </Pagination>
            {backupLimit === 0 && (
                <LumixEmptyState title={'Backups disabled'} className={'mt-4'}>
                    The backup limit for this server is set to zero. Your host can raise it if backups are available on
                    your plan.
                </LumixEmptyState>
            )}
            <Can action={'backup.create'}>
                {backupLimit > 0 && backups.backupCount > 0 && (
                    <div
                        css={tw`mt-8 flex flex-col items-stretch justify-end gap-3 border-t border-lumix-border/30 pt-6 sm:flex-row sm:items-center`}
                    >
                        {quota}
                        {backupLimit > backups.backupCount ? <CreateBackupButton /> : null}
                    </div>
                )}
            </Can>
        </ServerContentBlock>
    );
};

export default () => {
    const [page, setPage] = useState<number>(1);
    return (
        <ServerBackupContext.Provider value={{ page, setPage }}>
            <BackupContainer />
        </ServerBackupContext.Provider>
    );
};
