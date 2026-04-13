import React, { useState } from 'react';
import { Subuser } from '@/state/server/subusers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faUnlockAlt, faUserLock, faUsers } from '@fortawesome/free-solid-svg-icons';
import RemoveSubuserButton from '@/components/server/users/RemoveSubuserButton';
import EditSubuserModal from '@/components/server/users/EditSubuserModal';
import Can from '@/components/elements/Can';
import { useStoreState } from 'easy-peasy';
import tw from 'twin.macro';
import LumixCard from '@/components/lumix/LumixCard';
import LumixMetaItem from '@/components/lumix/LumixMetaItem';
import LumixStatusBadge from '@/components/lumix/LumixStatusBadge';

interface Props {
    subuser: Subuser;
}

export default ({ subuser }: Props) => {
    const uuid = useStoreState((state) => state.user!.data!.uuid);
    const [visible, setVisible] = useState(false);
    const isSelf = subuser.uuid === uuid;
    const permissionCount = subuser.permissions.filter((permission) => permission !== 'websocket.connect').length;

    return (
        <LumixCard css={tw`overflow-hidden p-4 sm:p-5`}>
            <EditSubuserModal subuser={subuser} visible={visible} onModalDismissed={() => setVisible(false)} />
            <div css={tw`flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between`}>
                <div css={tw`flex min-w-0 flex-1 items-start gap-4`}>
                    <div
                        css={tw`h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/10 ring-1 ring-lumix-border/40`}
                    >
                        <img css={tw`h-full w-full object-cover`} src={`${subuser.image}?s=400`} alt={''} />
                    </div>
                    <div css={tw`min-w-0 flex-1`}>
                        <div css={tw`flex flex-wrap items-center gap-2`}>
                            <p css={tw`truncate text-sm font-semibold text-[var(--lumix-text)]`}>{subuser.email}</p>
                            {isSelf && <LumixStatusBadge tone={'accent'}>You</LumixStatusBadge>}
                        </div>
                        <div css={tw`mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-xl`}>
                            <LumixMetaItem label={'Two-factor'}>
                                <span css={tw`inline-flex items-center gap-1.5 text-sm`}>
                                    <FontAwesomeIcon
                                        icon={subuser.twoFactorEnabled ? faUserLock : faUnlockAlt}
                                        css={subuser.twoFactorEnabled ? tw`text-emerald-300/90` : tw`text-amber-300/90`}
                                    />
                                    {subuser.twoFactorEnabled ? 'Enabled' : 'Not enabled'}
                                </span>
                            </LumixMetaItem>
                            <LumixMetaItem label={'Permissions'}>
                                <span css={tw`inline-flex items-center gap-1.5 text-sm text-[var(--lumix-text)]`}>
                                    <FontAwesomeIcon icon={faUsers} css={tw`text-xs text-indigo-300/80`} />
                                    {permissionCount} granted
                                </span>
                            </LumixMetaItem>
                        </div>
                    </div>
                </div>
                {!isSelf && (
                    <div
                        css={tw`flex items-center justify-end gap-1 border-t border-lumix-border/30 pt-4 lg:border-0 lg:pt-0`}
                    >
                        <Can action={'user.update'}>
                            <button
                                type={'button'}
                                aria-label={'Edit subuser'}
                                css={tw`rounded-lg p-2 text-lumix-muted transition-colors hover:bg-white/5 hover:text-[var(--lumix-text)]`}
                                onClick={() => setVisible(true)}
                            >
                                <FontAwesomeIcon icon={faPencilAlt} />
                            </button>
                        </Can>
                        <Can action={'user.delete'}>
                            <RemoveSubuserButton subuser={subuser} />
                        </Can>
                    </div>
                )}
            </div>
        </LumixCard>
    );
};
