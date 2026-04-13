import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import Modal from '@/components/elements/Modal';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import FlashMessageRender from '@/components/FlashMessageRender';
import useFlash from '@/plugins/useFlash';
import { SocketEvent } from '@/components/server/events';
import { useStoreState } from 'easy-peasy';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import LumixCode from '@/components/lumix/LumixCode';

const PIDLimitModalFeature = () => {
    const [visible, setVisible] = useState(false);
    const [loading] = useState(false);

    const status = ServerContext.useStoreState((state) => state.status.value);
    const { clearFlashes } = useFlash();
    const { connected, instance } = ServerContext.useStoreState((state) => state.socket);
    const isAdmin = useStoreState((state) => state.user.data!.rootAdmin);

    useEffect(() => {
        if (!connected || !instance || status === 'running') return;

        const errors = [
            'pthread_create failed',
            'failed to create thread',
            'unable to create thread',
            'unable to create native thread',
            'unable to create new native thread',
            'exception in thread "craft async scheduler management thread"',
        ];

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
        clearFlashes('feature:pidLimit');
    }, []);

    return (
        <Modal
            visible={visible}
            onDismissed={() => setVisible(false)}
            closeOnBackground={false}
            showSpinnerOverlay={loading}
        >
            <FlashMessageRender key={'feature:pidLimit'} css={tw`mb-4`} />
            {isAdmin ? (
                <>
                    <div css={tw`flex gap-4`}>
                        <FontAwesomeIcon
                            css={tw`shrink-0 text-amber-400`}
                            icon={faExclamationTriangle}
                            size={'3x'}
                        />
                        <div css={tw`min-w-0`}>
                            <h2 css={tw`text-xl font-semibold tracking-tight text-[var(--lumix-text)]`}>
                                Process or memory limit reached
                            </h2>
                            <p css={tw`mt-3 text-sm leading-relaxed text-lumix-muted`}>
                                This server hit the maximum process or memory limit enforced on the node.
                            </p>
                            <p css={tw`mt-3 text-sm leading-relaxed text-lumix-muted`}>
                                On Wings, consider raising{' '}
                                <LumixCode>container_pid_limit</LumixCode> in <LumixCode>config.yml</LumixCode>.
                                Restart Wings after changes.
                            </p>
                            <p css={tw`mt-3 text-sm font-medium text-amber-200/90`}>
                                Note: Wings must be restarted for configuration changes to take effect.
                            </p>
                        </div>
                    </div>
                    <div css={tw`mt-8 flex justify-end`}>
                        <Button onClick={() => setVisible(false)} css={tw`w-full border-transparent sm:w-auto`}>
                            Close
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <div css={tw`flex gap-4`}>
                        <FontAwesomeIcon
                            css={tw`shrink-0 text-amber-400`}
                            icon={faExclamationTriangle}
                            size={'3x'}
                        />
                        <div css={tw`min-w-0`}>
                            <h2 css={tw`text-xl font-semibold tracking-tight text-[var(--lumix-text)]`}>
                                Possible resource limit reached
                            </h2>
                            <p css={tw`mt-3 text-sm leading-relaxed text-lumix-muted`}>
                                This server may be out of memory or hitting process limits. Contact your administrator
                                with the error below.
                            </p>
                            <LumixCode variant={'block'} className={'mt-3 text-xs'}>
                                pthread_create failed, Possibly out of memory or process/resource limits reached
                            </LumixCode>
                        </div>
                    </div>
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

export default PIDLimitModalFeature;
