import React, { useState } from 'react';
import { Schedule, Task } from '@/api/server/schedules/getServerSchedules';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowCircleDown,
    faClock,
    faCode,
    faFileArchive,
    faPencilAlt,
    faToggleOn,
    faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import deleteScheduleTask from '@/api/server/schedules/deleteScheduleTask';
import { httpErrorToHuman } from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import TaskDetailsModal from '@/components/server/schedules/TaskDetailsModal';
import Can from '@/components/elements/Can';
import useFlash from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import tw from 'twin.macro';
import ConfirmationModal from '@/components/elements/ConfirmationModal';
import Icon from '@/components/elements/Icon';
import LumixStatusBadge from '@/components/lumix/LumixStatusBadge';

interface Props {
    schedule: Schedule;
    task: Task;
}

const getActionDetails = (action: string): [string, any] => {
    switch (action) {
        case 'command':
            return ['Send command', faCode];
        case 'power':
            return ['Send power action', faToggleOn];
        case 'backup':
            return ['Create backup', faFileArchive];
        default:
            return ['Unknown action', faCode];
    }
};

export default ({ schedule, task }: Props) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { clearFlashes, addError } = useFlash();
    const [visible, setVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const appendSchedule = ServerContext.useStoreActions((actions) => actions.schedules.appendSchedule);

    const onConfirmDeletion = () => {
        setIsLoading(true);
        clearFlashes('schedules');
        deleteScheduleTask(uuid, schedule.id, task.id)
            .then(() =>
                appendSchedule({
                    ...schedule,
                    tasks: schedule.tasks.filter((t) => t.id !== task.id),
                })
            )
            .catch((error) => {
                console.error(error);
                setIsLoading(false);
                addError({ message: httpErrorToHuman(error), key: 'schedules' });
            });
    };

    const [title, icon] = getActionDetails(task.action);

    return (
        <div css={tw`p-4 sm:p-5`}>
            <SpinnerOverlay visible={isLoading} fixed size={'large'} />
            <TaskDetailsModal
                schedule={schedule}
                task={task}
                visible={isEditing}
                onModalDismissed={() => setIsEditing(false)}
            />
            <ConfirmationModal
                title={'Confirm task deletion'}
                buttonText={'Delete Task'}
                onConfirmed={onConfirmDeletion}
                visible={visible}
                onModalDismissed={() => setVisible(false)}
            >
                Are you sure you want to delete this task? This action cannot be undone.
            </ConfirmationModal>
            <div css={tw`flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between`}>
                <div css={tw`flex min-w-0 flex-1 gap-3`}>
                    <div
                        css={tw`mt-0.5 hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-200 ring-1 ring-indigo-400/25 sm:flex`}
                    >
                        <FontAwesomeIcon icon={icon} css={tw`text-sm`} />
                    </div>
                    <div css={tw`min-w-0 flex-1`}>
                        <div css={tw`flex flex-wrap items-center gap-2`}>
                            <p css={tw`text-sm font-semibold text-[var(--lumix-text)]`}>{title}</p>
                            {task.continueOnFailure && (
                                <LumixStatusBadge tone={'warning'}>
                                    <span css={tw`inline-flex items-center gap-1`}>
                                        <Icon icon={faArrowCircleDown} css={tw`h-3 w-3`} />
                                        Continues on failure
                                    </span>
                                </LumixStatusBadge>
                            )}
                            {task.sequenceId > 1 && task.timeOffset > 0 && (
                                <LumixStatusBadge tone={'neutral'}>
                                    <span css={tw`inline-flex items-center gap-1`}>
                                        <Icon icon={faClock} css={tw`h-3 w-3`} />
                                        +{task.timeOffset}s after prior
                                    </span>
                                </LumixStatusBadge>
                            )}
                        </div>
                        {task.payload && (
                            <div css={tw`mt-3`}>
                                {task.action === 'backup' && (
                                    <p css={tw`mb-1 text-2xs font-semibold uppercase tracking-wide text-lumix-muted`}>
                                        Ignored files & folders
                                    </p>
                                )}
                                <div
                                    css={tw`inline-block max-w-full rounded-lg border border-lumix-border/40 bg-black/25 px-3 py-2 font-mono text-xs leading-relaxed text-[var(--lumix-text)] whitespace-pre-wrap break-all`}
                                >
                                    {task.payload}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div css={tw`flex items-center justify-end gap-1 lg:shrink-0`}>
                    <Can action={'schedule.update'}>
                        <button
                            type={'button'}
                            aria-label={'Edit scheduled task'}
                            css={tw`rounded-lg p-2 text-lumix-muted transition-colors hover:bg-white/5 hover:text-[var(--lumix-text)]`}
                            onClick={() => setIsEditing(true)}
                        >
                            <FontAwesomeIcon icon={faPencilAlt} />
                        </button>
                    </Can>
                    <Can action={'schedule.update'}>
                        <button
                            type={'button'}
                            aria-label={'Delete scheduled task'}
                            css={tw`rounded-lg p-2 text-lumix-muted transition-colors hover:bg-red-500/10 hover:text-red-300`}
                            onClick={() => setVisible(true)}
                        >
                            <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                    </Can>
                </div>
            </div>
        </div>
    );
};
