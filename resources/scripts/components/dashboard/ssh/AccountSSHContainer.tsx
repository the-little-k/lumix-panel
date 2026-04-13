import React, { useEffect } from 'react';
import ContentBox from '@/components/elements/ContentBox';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import PageContentBlock from '@/components/elements/PageContentBlock';
import tw from 'twin.macro';
import { useSSHKeys } from '@/api/account/ssh-keys';
import { useFlashKey } from '@/plugins/useFlash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import CreateSSHKeyForm from '@/components/dashboard/ssh/CreateSSHKeyForm';
import DeleteSSHKeyButton from '@/components/dashboard/ssh/DeleteSSHKeyButton';
import LumixSectionHeader from '@/components/lumix/LumixSectionHeader';
import LumixCard from '@/components/lumix/LumixCard';
import LumixEmptyState from '@/components/lumix/LumixEmptyState';
import LumixMetaItem from '@/components/lumix/LumixMetaItem';

export default () => {
    const { clearAndAddHttpError } = useFlashKey('account');
    const { data, isValidating, error } = useSSHKeys({
        revalidateOnMount: true,
        revalidateOnFocus: false,
    });

    useEffect(() => {
        clearAndAddHttpError(error);
    }, [error]);

    return (
        <PageContentBlock title={'SSH Keys'} showFlashKey={'account'}>
            <LumixSectionHeader
                title={'SSH public keys'}
                description={
                    'Keys listed here can be authorized on supported instances. Remove a key if a device is lost or no longer trusted.'
                }
            />
            <div css={tw`md:flex md:flex-nowrap`}>
                <ContentBox title={'Add SSH Key'} css={tw`flex-none w-full md:w-1/2`}>
                    <CreateSSHKeyForm />
                </ContentBox>
                <ContentBox title={'Your keys'} css={tw`mt-8 flex-1 overflow-hidden md:mt-0 md:ml-8`}>
                    <SpinnerOverlay visible={!data && isValidating} />
                    {!data || !data.length ? (
                        !data ? (
                            <p css={tw`text-center text-sm text-lumix-muted`}>Loading…</p>
                        ) : (
                            <LumixEmptyState title={'No SSH keys'}>
                                Add a public key to use with servers that support key-based access.
                            </LumixEmptyState>
                        )
                    ) : (
                        <div css={tw`flex flex-col gap-3`}>
                            {data.map((key) => (
                                <LumixCard key={key.fingerprint} noHover css={tw`flex items-center gap-4 p-4`}>
                                    <div
                                        css={tw`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/25`}
                                    >
                                        <FontAwesomeIcon icon={faKey} />
                                    </div>
                                    <div css={tw`min-w-0 flex-1`}>
                                        <p css={tw`break-words text-sm font-medium text-[var(--lumix-text)]`}>
                                            {key.name}
                                        </p>
                                        <div css={tw`mt-2 grid gap-2 sm:grid-cols-2`}>
                                            <LumixMetaItem label={'Fingerprint'}>
                                                <span css={tw`truncate font-mono text-xs`}>SHA256:{key.fingerprint}</span>
                                            </LumixMetaItem>
                                            <LumixMetaItem label={'Added'}>
                                                <span css={tw`text-xs`}>
                                                    {format(key.createdAt, 'MMM d, yyyy HH:mm')}
                                                </span>
                                            </LumixMetaItem>
                                        </div>
                                    </div>
                                    <DeleteSSHKeyButton name={key.name} fingerprint={key.fingerprint} />
                                </LumixCard>
                            ))}
                        </div>
                    )}
                </ContentBox>
            </div>
        </PageContentBlock>
    );
};
