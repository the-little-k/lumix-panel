import React, { useEffect, useState } from 'react';
import ContentBox from '@/components/elements/ContentBox';
import CreateApiKeyForm from '@/components/dashboard/forms/CreateApiKeyForm';
import getApiKeys, { ApiKey } from '@/api/account/getApiKeys';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import deleteApiKey from '@/api/account/deleteApiKey';
import { format } from 'date-fns';
import PageContentBlock from '@/components/elements/PageContentBlock';
import tw from 'twin.macro';
import { Dialog } from '@/components/elements/dialog';
import { useFlashKey } from '@/plugins/useFlash';
import Code from '@/components/elements/Code';
import LumixSectionHeader from '@/components/lumix/LumixSectionHeader';
import LumixCard from '@/components/lumix/LumixCard';
import LumixEmptyState from '@/components/lumix/LumixEmptyState';
import LumixMetaItem from '@/components/lumix/LumixMetaItem';

export default () => {
    const [deleteIdentifier, setDeleteIdentifier] = useState('');
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const { clearAndAddHttpError } = useFlashKey('account');

    useEffect(() => {
        getApiKeys()
            .then((keys) => setKeys(keys))
            .then(() => setLoading(false))
            .catch((error) => clearAndAddHttpError(error));
    }, []);

    const doDeletion = (identifier: string) => {
        setLoading(true);

        clearAndAddHttpError();
        deleteApiKey(identifier)
            .then(() => setKeys((s) => [...(s || []).filter((key) => key.identifier !== identifier)]))
            .catch((error) => clearAndAddHttpError(error))
            .then(() => {
                setLoading(false);
                setDeleteIdentifier('');
            });
    };

    return (
        <PageContentBlock title={'Account API'} showFlashKey={'account'}>
            <LumixSectionHeader
                title={'API keys'}
                description={
                    'Create keys for automation and integrations. Treat them like passwords—anyone with a key can act as you within its scope.'
                }
            />
            <div css={tw`md:flex md:flex-nowrap`}>
                <ContentBox title={'Create API Key'} css={tw`flex-none w-full md:w-1/2`}>
                    <CreateApiKeyForm onKeyCreated={(key) => setKeys((s) => [...s!, key])} />
                </ContentBox>
                <ContentBox title={'Your keys'} css={tw`mt-8 flex-1 overflow-hidden md:mt-0 md:ml-8`}>
                    <SpinnerOverlay visible={loading} />
                    <Dialog.Confirm
                        title={'Delete API Key'}
                        confirm={'Delete Key'}
                        open={!!deleteIdentifier}
                        onClose={() => setDeleteIdentifier('')}
                        onConfirmed={() => doDeletion(deleteIdentifier)}
                    >
                        All requests using the <Code>{deleteIdentifier}</Code> key will be invalidated.
                    </Dialog.Confirm>
                    {keys.length === 0 ? (
                        loading ? (
                            <p css={tw`text-center text-sm text-lumix-muted`}>Loading…</p>
                        ) : (
                            <LumixEmptyState title={'No API keys yet'}>
                                Create a key on the left. You can revoke access here at any time.
                            </LumixEmptyState>
                        )
                    ) : (
                        <div css={tw`flex flex-col gap-3`}>
                            {keys.map((key) => (
                                <LumixCard key={key.identifier} noHover css={tw`flex items-center gap-4 p-4`}>
                                    <div
                                        css={tw`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/25`}
                                    >
                                        <FontAwesomeIcon icon={faKey} />
                                    </div>
                                    <div css={tw`min-w-0 flex-1`}>
                                        <p css={tw`break-words text-sm font-medium text-[var(--lumix-text)]`}>
                                            {key.description}
                                        </p>
                                        <div css={tw`mt-2 grid gap-2 sm:grid-cols-2`}>
                                            <LumixMetaItem label={'Last used'}>
                                                <span css={tw`text-xs`}>
                                                    {key.lastUsedAt
                                                        ? format(key.lastUsedAt, 'MMM d, yyyy HH:mm')
                                                        : 'Never'}
                                                </span>
                                            </LumixMetaItem>
                                            <LumixMetaItem label={'Identifier'}>
                                                <code
                                                    css={tw`font-mono text-xs text-[var(--lumix-text)]`}
                                                >
                                                    <span css={tw`hidden md:inline`}>{key.identifier}</span>
                                                    <span css={tw`md:hidden`}>{key.identifier.slice(0, 12)}…</span>
                                                </code>
                                            </LumixMetaItem>
                                        </div>
                                    </div>
                                    <button
                                        type={'button'}
                                        aria-label={'Delete API key'}
                                        css={tw`shrink-0 rounded-lg p-2 text-lumix-muted transition-colors hover:bg-red-500/10 hover:text-red-300`}
                                        onClick={() => setDeleteIdentifier(key.identifier)}
                                    >
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </button>
                                </LumixCard>
                            ))}
                        </div>
                    )}
                </ContentBox>
            </div>
        </PageContentBlock>
    );
};
