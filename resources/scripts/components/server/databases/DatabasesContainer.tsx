import React, { useEffect, useState } from 'react';
import getServerDatabases from '@/api/server/databases/getServerDatabases';
import { ServerContext } from '@/state/server';
import { httpErrorToHuman } from '@/api/http';
import DatabaseRow from '@/components/server/databases/DatabaseRow';
import Spinner from '@/components/elements/Spinner';
import CreateDatabaseButton from '@/components/server/databases/CreateDatabaseButton';
import Can from '@/components/elements/Can';
import useFlash from '@/plugins/useFlash';
import tw from 'twin.macro';
import Fade from '@/components/elements/Fade';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { useDeepMemoize } from '@/plugins/useDeepMemoize';
import LumixSectionHeader from '@/components/lumix/LumixSectionHeader';
import LumixEmptyState from '@/components/lumix/LumixEmptyState';

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const databaseLimit = ServerContext.useStoreState((state) => state.server.data!.featureLimits.databases);

    const { addError, clearFlashes } = useFlash();
    const [loading, setLoading] = useState(true);

    const databases = useDeepMemoize(ServerContext.useStoreState((state) => state.databases.data));
    const setDatabases = ServerContext.useStoreActions((state) => state.databases.setDatabases);

    useEffect(() => {
        setLoading(!databases.length);
        clearFlashes('databases');

        getServerDatabases(uuid)
            .then((rows) => setDatabases(rows))
            .catch((error) => {
                console.error(error);
                addError({ key: 'databases', message: httpErrorToHuman(error) });
            })
            .then(() => setLoading(false));
    }, []);

    const quota =
        databaseLimit > 0 ? (
            <p css={tw`text-sm text-lumix-muted`}>
                <span css={tw`font-medium text-[var(--lumix-text)]`}>{databases.length}</span> of {databaseLimit}{' '}
                databases used
            </p>
        ) : null;

    return (
        <ServerContentBlock title={'Databases'} showFlashKey={'databases'}>
            <LumixSectionHeader
                title={'MySQL databases'}
                description={
                    'Connection details, users, and endpoints for this server. Open a database to view passwords and JDBC strings.'
                }
                actions={
                    <Can action={'database.create'}>
                        {databaseLimit > 0 &&
                        databaseLimit !== databases.length &&
                        databases.length === 0 ? (
                            <CreateDatabaseButton />
                        ) : null}
                    </Can>
                }
            />
            {!databases.length && loading ? (
                <div css={tw`flex justify-center py-16`}>
                    <Spinner size={'large'} />
                </div>
            ) : (
                <Fade timeout={150}>
                    <>
                        {databases.length > 0 ? (
                            <div css={tw`flex flex-col gap-3`}>
                                {databases.map((database) => (
                                    <DatabaseRow key={database.id} database={database} />
                                ))}
                            </div>
                        ) : databaseLimit > 0 ? (
                            <LumixEmptyState title={'No databases yet'}>
                                Create your first database to get connection credentials. You can allow remote hosts or
                                leave connections open to any address.
                            </LumixEmptyState>
                        ) : (
                            <LumixEmptyState title={'Databases are disabled for this server'}>
                                The database limit for this server is set to zero. Contact your host if you need
                                databases enabled.
                            </LumixEmptyState>
                        )}
                        <Can action={'database.create'}>
                            {databaseLimit > 0 && databases.length > 0 && (
                                <div
                                    css={tw`mt-8 flex flex-col items-stretch justify-end gap-3 border-t border-lumix-border/30 pt-6 sm:flex-row sm:items-center`}
                                >
                                    {quota}
                                    {databaseLimit !== databases.length ? <CreateDatabaseButton /> : null}
                                </div>
                            )}
                        </Can>
                    </>
                </Fade>
            )}
        </ServerContentBlock>
    );
};
