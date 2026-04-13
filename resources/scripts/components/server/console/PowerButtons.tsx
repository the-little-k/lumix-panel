import React, { useEffect, useState } from 'react';
import { Button } from '@/components/elements/button/index';
import Can from '@/components/elements/Can';
import { ServerContext } from '@/state/server';
import { PowerAction } from '@/components/server/console/ServerConsoleContainer';
import { Dialog } from '@/components/elements/dialog';
import classNames from 'classnames';

interface PowerButtonProps {
    className?: string;
    /** Compact toolbar style for the server header. */
    variant?: 'default' | 'compact';
}

export default ({ className, variant = 'default' }: PowerButtonProps) => {
    const [open, setOpen] = useState(false);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);

    const killable = status === 'stopping';
    const compact = variant === 'compact';
    const btnSize = compact ? Button.Sizes.Small : undefined;

    const onButtonClick = (
        action: PowerAction | 'kill-confirmed',
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ): void => {
        e.preventDefault();
        if (action === 'kill') {
            return setOpen(true);
        }

        if (instance) {
            setOpen(false);
            instance.send('set state', action === 'kill-confirmed' ? 'kill' : action);
        }
    };

    useEffect(() => {
        if (status === 'offline') {
            setOpen(false);
        }
    }, [status]);

    return (
        <div className={classNames(compact ? 'flex flex-wrap items-center gap-2' : 'flex space-x-2', className)}>
            <Dialog.Confirm
                open={open}
                hideCloseIcon
                onClose={() => setOpen(false)}
                title={'Forcibly Stop Process'}
                confirm={'Continue'}
                onConfirmed={onButtonClick.bind(null, 'kill-confirmed')}
            >
                Forcibly stopping a server can lead to data corruption.
            </Dialog.Confirm>
            <Can action={'control.start'}>
                <Button
                    className={compact ? 'min-w-[4.5rem]' : 'flex-1'}
                    size={btnSize}
                    disabled={status !== 'offline'}
                    onClick={onButtonClick.bind(null, 'start')}
                >
                    Start
                </Button>
            </Can>
            <Can action={'control.restart'}>
                <Button.Text
                    className={compact ? 'min-w-[4.5rem]' : 'flex-1'}
                    size={btnSize}
                    disabled={!status}
                    onClick={onButtonClick.bind(null, 'restart')}
                >
                    Restart
                </Button.Text>
            </Can>
            <Can action={'control.stop'}>
                <Button.Danger
                    className={compact ? 'min-w-[4.5rem]' : 'flex-1'}
                    size={btnSize}
                    disabled={status === 'offline'}
                    onClick={onButtonClick.bind(null, killable ? 'kill' : 'stop')}
                >
                    {killable ? 'Kill' : 'Stop'}
                </Button.Danger>
            </Can>
        </div>
    );
};
