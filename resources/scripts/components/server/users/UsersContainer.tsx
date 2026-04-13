import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import { Actions, useStoreActions, useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import Spinner from '@/components/elements/Spinner';
import AddSubuserButton from '@/components/server/users/AddSubuserButton';
import UserRow from '@/components/server/users/UserRow';
import getServerSubusers from '@/api/server/users/getServerSubusers';
import { httpErrorToHuman } from '@/api/http';
import Can from '@/components/elements/Can';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import tw from 'twin.macro';
import LumixSectionHeader from '@/components/lumix/LumixSectionHeader';
import LumixEmptyState from '@/components/lumix/LumixEmptyState';

export default () => {
    const [loading, setLoading] = useState(true);

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const subusers = ServerContext.useStoreState((state) => state.subusers.data);
    const setSubusers = ServerContext.useStoreActions((actions) => actions.subusers.setSubusers);

    const permissions = useStoreState((state: ApplicationStore) => state.permissions.data);
    const getPermissions = useStoreActions((actions: Actions<ApplicationStore>) => actions.permissions.getPermissions);
    const { addError, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    useEffect(() => {
        clearFlashes('users');
        getServerSubusers(uuid)
            .then((subusers) => {
                setSubusers(subusers);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                addError({ key: 'users', message: httpErrorToHuman(error) });
            });
    }, []);

    useEffect(() => {
        getPermissions().catch((error) => {
            addError({ key: 'users', message: httpErrorToHuman(error) });
            console.error(error);
        });
    }, []);

    if (!subusers.length && (loading || !Object.keys(permissions).length)) {
        return (
            <ServerContentBlock title={'Users'} showFlashKey={'users'}>
                <div css={tw`flex justify-center py-16`}>
                    <Spinner size={'large'} />
                </div>
            </ServerContentBlock>
        );
    }

    return (
        <ServerContentBlock title={'Users'} showFlashKey={'users'}>
            <LumixSectionHeader
                title={'Subusers'}
                description={
                    'Invite teammates with their own login. Each subuser gets only the permissions you grant—use edit to review the full matrix.'
                }
                actions={
                    <Can action={'user.create'}>
                        <AddSubuserButton />
                    </Can>
                }
            />
            {!subusers.length ? (
                <LumixEmptyState title={'No subusers yet'}>
                    Invite someone by email to share this server. They sign in with their own account and only see what
                    you allow.
                </LumixEmptyState>
            ) : (
                <div css={tw`flex flex-col gap-3`}>
                    {subusers.map((subuser) => (
                        <UserRow key={subuser.uuid} subuser={subuser} />
                    ))}
                </div>
            )}
            <Can action={'user.create'}>
                {subusers.length > 0 && (
                    <div
                        css={tw`mt-8 flex flex-col items-stretch justify-end gap-3 border-t border-lumix-border/30 pt-6 sm:flex-row sm:items-center`}
                    >
                        <p css={tw`text-sm text-lumix-muted`}>
                            <span css={tw`font-medium text-[var(--lumix-text)]`}>{subusers.length}</span> subuser
                            {subusers.length === 1 ? '' : 's'} on this server
                        </p>
                        <AddSubuserButton />
                    </div>
                )}
            </Can>
        </ServerContentBlock>
    );
};
