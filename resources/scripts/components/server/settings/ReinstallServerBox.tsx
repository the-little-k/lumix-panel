import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import reinstallServer from '@/api/server/reinstallServer';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { httpErrorToHuman } from '@/api/http';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import { Dialog } from '@/components/elements/dialog';
import LumixCard from '@/components/lumix/LumixCard';
import LumixStatusBadge from '@/components/lumix/LumixStatusBadge';

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const [modalVisible, setModalVisible] = useState(false);
    const { addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const reinstall = () => {
        clearFlashes('settings');
        reinstallServer(uuid)
            .then(() => {
                addFlash({
                    key: 'settings',
                    type: 'success',
                    message: 'Your server has begun the reinstallation process.',
                });
            })
            .catch((error) => {
                console.error(error);

                addFlash({ key: 'settings', type: 'error', message: httpErrorToHuman(error) });
            })
            .then(() => setModalVisible(false));
    };

    useEffect(() => {
        clearFlashes();
    }, []);

    return (
        <LumixCard
            noHover
            css={tw`overflow-hidden ring-1 ring-inset ring-red-500/20`}
        >
            <Dialog.Confirm
                open={modalVisible}
                title={'Confirm server reinstallation'}
                confirm={'Yes, reinstall server'}
                onClose={() => setModalVisible(false)}
                onConfirmed={reinstall}
            >
                Your server will be stopped and some files may be deleted or modified during this process, are you sure
                you wish to continue?
            </Dialog.Confirm>
            <div
                css={tw`border-b border-red-500/20 bg-red-500/[0.06] px-4 py-3 sm:px-5`}
            >
                <div css={tw`flex flex-wrap items-center gap-2`}>
                    <h3 css={tw`text-sm font-semibold text-[var(--lumix-text)]`}>Reinstall server</h3>
                    <LumixStatusBadge tone={'danger'}>Destructive</LumixStatusBadge>
                </div>
                <p css={tw`mt-0.5 text-xs text-lumix-muted`}>
                    Stops the instance and re-runs the egg install script. Treat this like a factory reset.
                </p>
            </div>
            <div css={tw`space-y-4 p-4 sm:p-5`}>
                <p css={tw`text-sm leading-relaxed text-lumix-muted`}>
                    Reinstalling stops the server and executes the same provisioning flow that created it originally.{' '}
                    <strong css={tw`font-medium text-[var(--lumix-text)]`}>
                        Files may be deleted or overwritten. Back up anything you need before continuing.
                    </strong>
                </p>
                <div css={tw`flex flex-col gap-3 sm:flex-row sm:justify-end`}>
                    <Button.Danger variant={Button.Variants.Secondary} type={'button'} onClick={() => setModalVisible(true)}>
                        Reinstall server
                    </Button.Danger>
                </div>
            </div>
        </LumixCard>
    );
};
