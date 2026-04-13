import React from 'react';
import { ServerContext } from '@/state/server';
import { useStoreState } from 'easy-peasy';
import RenameServerBox from '@/components/server/settings/RenameServerBox';
import Can from '@/components/elements/Can';
import ReinstallServerBox from '@/components/server/settings/ReinstallServerBox';
import tw from 'twin.macro';
import Input from '@/components/elements/Input';
import Label from '@/components/elements/Label';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import isEqual from 'react-fast-compare';
import CopyOnClick from '@/components/elements/CopyOnClick';
import { ip } from '@/lib/formatters';
import { Button } from '@/components/elements/button/index';
import LumixSectionHeader from '@/components/lumix/LumixSectionHeader';
import LumixCard from '@/components/lumix/LumixCard';
import LumixMetaItem from '@/components/lumix/LumixMetaItem';

export default () => {
    const username = useStoreState((state) => state.user.data!.username);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const node = ServerContext.useStoreState((state) => state.server.data!.node);
    const sftp = ServerContext.useStoreState((state) => state.server.data!.sftpDetails, isEqual);

    return (
        <ServerContentBlock title={'Settings'} showFlashKey={'settings'}>
            <LumixSectionHeader
                title={'Server settings'}
                description={
                    'Connection details, identifiers, and maintenance actions for this instance. Destructive steps require explicit confirmation.'
                }
            />
            <div css={tw`flex flex-col gap-6 xl:flex-row xl:items-start`}>
                <div css={tw`min-w-0 flex-1 space-y-6`}>
                    <Can action={'file.sftp'}>
                        <LumixCard noHover css={tw`overflow-hidden`}>
                            <div
                                css={tw`border-b border-lumix-border/30 bg-black/10 px-4 py-3 sm:px-5`}
                            >
                                <h3 css={tw`text-sm font-semibold text-[var(--lumix-text)]`}>SFTP access</h3>
                                <p css={tw`mt-0.5 text-xs text-lumix-muted`}>
                                    Use these credentials with any SFTP client. The password matches your panel login.
                                </p>
                            </div>
                            <div css={tw`space-y-5 p-4 sm:p-5`}>
                                <div>
                                    <Label>Server address</Label>
                                    <CopyOnClick text={`sftp://${ip(sftp.ip)}:${sftp.port}`}>
                                        <Input type={'text'} value={`sftp://${ip(sftp.ip)}:${sftp.port}`} readOnly />
                                    </CopyOnClick>
                                </div>
                                <div>
                                    <Label>Username</Label>
                                    <CopyOnClick text={`${username}.${id}`}>
                                        <Input type={'text'} value={`${username}.${id}`} readOnly />
                                    </CopyOnClick>
                                </div>
                                <div
                                    css={tw`flex flex-col gap-4 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between`}
                                >
                                    <p css={tw`text-sm leading-relaxed text-lumix-muted`}>
                                        Your SFTP password is the same as the password you use to sign in to this panel.
                                    </p>
                                    <a
                                        href={`sftp://${username}.${id}@${ip(sftp.ip)}:${sftp.port}`}
                                        css={tw`shrink-0`}
                                    >
                                        <Button.Text variant={Button.Variants.Secondary}>Launch SFTP</Button.Text>
                                    </a>
                                </div>
                            </div>
                        </LumixCard>
                    </Can>
                    <LumixCard noHover css={tw`overflow-hidden`}>
                        <div css={tw`border-b border-lumix-border/30 bg-black/10 px-4 py-3 sm:px-5`}>
                            <h3 css={tw`text-sm font-semibold text-[var(--lumix-text)]`}>Debug identifiers</h3>
                            <p css={tw`mt-0.5 text-xs text-lumix-muted`}>
                                Useful when working with support or tracing this server in logs.
                            </p>
                        </div>
                        <div css={tw`grid gap-4 p-4 sm:grid-cols-2 sm:p-5`}>
                            <LumixMetaItem label={'Node'}>
                                <code
                                    css={tw`rounded-lg border border-lumix-border/40 bg-black/30 px-2 py-1 font-mono text-xs text-[var(--lumix-text)]`}
                                >
                                    {node}
                                </code>
                            </LumixMetaItem>
                            <CopyOnClick text={uuid}>
                                <LumixMetaItem label={'Server UUID'}>
                                    <code
                                        css={tw`block max-w-full truncate rounded-lg border border-lumix-border/40 bg-black/30 px-2 py-1 font-mono text-xs text-[var(--lumix-text)]`}
                                    >
                                        {uuid}
                                    </code>
                                </LumixMetaItem>
                            </CopyOnClick>
                        </div>
                    </LumixCard>
                </div>
                <div css={tw`min-w-0 flex-1 space-y-6 xl:max-w-xl`}>
                    <Can action={'settings.rename'}>
                        <RenameServerBox />
                    </Can>
                    <Can action={'settings.reinstall'}>
                        <ReinstallServerBox />
                    </Can>
                </div>
            </div>
        </ServerContentBlock>
    );
};
