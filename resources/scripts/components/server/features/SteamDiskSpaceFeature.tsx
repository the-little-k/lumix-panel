import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import Modal from '@/components/elements/Modal';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import FlashMessageRender from '@/components/FlashMessageRender';
import useFlash from '@/plugins/useFlash';
import { SocketEvent } from '@/components/server/events';
import { useStoreState } from 'easy-peasy';
import LumixCode from '@/components/lumix/LumixCode';

const SteamDiskSpaceFeature = () => {
    const [visible, setVisible] = useState(false);
    const [loading] = useState(false);

    const status = ServerContext.useStoreState((state) => state.status.value);
    const { clearFlashes } = useFlash();
    const { connected, instance } = ServerContext.useStoreState((state) => state.socket);
    const isAdmin = useStoreState((state) => state.user.data!.rootAdmin);

    useEffect(() => {
        if (!connected || !instance || status === 'running') return;

        const errors = ['steamcmd needs 250mb of free disk space to update', '0x202 after update job'];

        const listener = (line: string) => {
            if (errors.some((p) => line.toLowerCase().includes(p))) {
                setVisible(true);
            }
        };

        instance.addListener(SocketEvent.CONSOLE_OUTPUT, listener);

        return () => {
            instance.removeListener(SocketEvent.CONSOLE_OUTPUT, listener);
        };
    }, [connected, instance, status]);

    useEffect(() => {
        clearFlashes('feature:steamDiskSpace');
    }, []);

    return (
        <Modal
            visible={visible}
            onDismissed={() => setVisible(false)}
            closeOnBackground={false}
            showSpinnerOverlay={loading}
        >
            <FlashMessageRender key={'feature:steamDiskSpace'} css={tw`mb-4`} />
            {isAdmin ? (
                <>
                    <h2 css={tw`text-xl font-semibold tracking-tight text-[var(--lumix-text)]`}>
                        Out of disk space
                    </h2>
                    <p css={tw`mt-3 text-sm leading-relaxed text-lumix-muted`}>
                        This server cannot finish installing or updating because the node is out of free space.
                    </p>
                    <p css={tw`mt-3 text-sm leading-relaxed text-lumix-muted`}>
                        On the host machine, run <LumixCode>df -h</LumixCode> to inspect volumes. Free space or expand
                        storage, then retry.
                    </p>
                    <div css={tw`mt-8 flex justify-end`}>
                        <Button onClick={() => setVisible(false)} css={tw`w-full border-transparent sm:w-auto`}>
                            Close
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <h2 css={tw`text-xl font-semibold tracking-tight text-[var(--lumix-text)]`}>
                        Out of disk space
                    </h2>
                    <p css={tw`mt-3 text-sm leading-relaxed text-lumix-muted`}>
                        This server cannot finish installing or updating because disk space was exhausted. Please contact
                        your host.
                    </p>
                    <div css={tw`mt-8 flex justify-end`}>
                        <Button onClick={() => setVisible(false)} css={tw`w-full border-transparent sm:w-auto`}>
                            Close
                        </Button>
                    </div>
                </>
            )}
        </Modal>
    );
};

export default SteamDiskSpaceFeature;
