import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import getServerSchedule from '@/api/server/schedules/getServerSchedule';
import Spinner from '@/components/elements/Spinner';
import FlashMessageRender from '@/components/FlashMessageRender';
import EditScheduleModal from '@/components/server/schedules/EditScheduleModal';
import NewTaskButton from '@/components/server/schedules/NewTaskButton';
import DeleteScheduleButton from '@/components/server/schedules/DeleteScheduleButton';
import Can from '@/components/elements/Can';
import useFlash from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import ScheduleTaskRow from '@/components/server/schedules/ScheduleTaskRow';
import isEqual from 'react-fast-compare';
import { format } from 'date-fns';
import ScheduleCronRow from '@/components/server/schedules/ScheduleCronRow';
import RunScheduleButton from '@/components/server/schedules/RunScheduleButton';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import LumixSectionHeader from '@/components/lumix/LumixSectionHeader';
import LumixCard from '@/components/lumix/LumixCard';
import LumixStatusBadge from '@/components/lumix/LumixStatusBadge';
import LumixMetaItem from '@/components/lumix/LumixMetaItem';
import LumixEmptyState from '@/components/lumix/LumixEmptyState';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

interface Params {
    id: string;
}

const CronFieldBox = ({ title, value }: { title: string; value: string }) => (
    <div css={tw`rounded-xl border border-lumix-border/40 bg-black/20 px-3 py-3`}>
        <p css={tw`text-2xs font-semibold uppercase tracking-wide text-lumix-muted`}>{title}</p>
        <p css={tw`mt-1 font-mono text-sm font-medium text-[var(--lumix-text)]`}>{value}</p>
    </div>
);

export default () => {
    const history = useHistory();
    const { id: scheduleId } = useParams<Params>();

    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [isLoading, setIsLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);

    const schedule = ServerContext.useStoreState(
        (st) => st.schedules.data.find((s) => s.id === Number(scheduleId)),
        isEqual
    );
    const appendSchedule = ServerContext.useStoreActions((actions) => actions.schedules.appendSchedule);

    useEffect(() => {
        if (schedule?.id === Number(scheduleId)) {
            setIsLoading(false);
            return;
        }

        clearFlashes('schedules');
        getServerSchedule(uuid, Number(scheduleId))
            .then((schedule) => appendSchedule(schedule))
            .catch((error) => {
                console.error(error);
                clearAndAddHttpError({ error, key: 'schedules' });
            })
            .then(() => setIsLoading(false));
    }, [scheduleId]);

    const toggleEditModal = useCallback(() => {
        setShowEditModal((s) => !s);
    }, []);

    const statusBadge = !schedule
        ? null
        : schedule.isProcessing ? (
              <LumixStatusBadge tone={'warning'}>
                  <span css={tw`inline-flex items-center gap-1.5`}>
                      <Spinner css={tw`h-3! w-3!`} />
                      Processing
                  </span>
              </LumixStatusBadge>
          ) : schedule.isActive ? (
              <LumixStatusBadge tone={'success'}>Active</LumixStatusBadge>
          ) : (
              <LumixStatusBadge tone={'neutral'}>Inactive</LumixStatusBadge>
          );

    return (
        <ServerContentBlock title={'Schedules'} showFlashKey={'schedules'}>
            <FlashMessageRender byKey={'schedules'} css={tw`mb-4`} />
            {!schedule || isLoading ? (
                <Spinner size={'large'} centered />
            ) : (
                <>
                    <div css={tw`mb-6`}>
                        <Button.Text
                            type={'button'}
                            className={'inline-flex items-center gap-2'}
                            onClick={() => history.push(`/server/${id}/schedules`)}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} css={tw`text-xs opacity-70`} />
                            All schedules
                        </Button.Text>
                    </div>
                    <LumixSectionHeader
                        title={schedule.name}
                        description={'Cron timing, power rules, and the ordered task chain for this schedule.'}
                        actions={
                            <Can action={'schedule.update'}>
                                <div css={tw`flex flex-wrap items-center gap-2`}>
                                    <Button.Text type={'button'} onClick={toggleEditModal}>
                                        Edit schedule
                                    </Button.Text>
                                    <NewTaskButton schedule={schedule} />
                                </div>
                            </Can>
                        }
                    />
                    <LumixCard noHover css={tw`mb-6 overflow-hidden`}>
                        <div
                            css={tw`flex flex-col gap-4 border-b border-lumix-border/30 bg-black/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5`}
                        >
                            <div css={tw`flex items-start gap-3`}>
                                <div
                                    css={tw`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-200 ring-1 ring-violet-400/20`}
                                >
                                    <FontAwesomeIcon icon={faCalendarAlt} />
                                </div>
                                <div css={tw`min-w-0`}>
                                    <div css={tw`flex flex-wrap items-center gap-2`}>
                                        <p css={tw`text-sm font-medium text-[var(--lumix-text)]`}>Status</p>
                                        {statusBadge}
                                    </div>
                                    <div
                                        css={tw`mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-2xl lg:grid-cols-2`}
                                    >
                                        <LumixMetaItem label={'Last run'}>
                                            {schedule.lastRunAt ? (
                                                <span css={tw`text-xs`}>
                                                    {format(schedule.lastRunAt, "MMM d, yyyy h:mm a")}
                                                </span>
                                            ) : (
                                                <span css={tw`text-lumix-muted`}>Never</span>
                                            )}
                                        </LumixMetaItem>
                                        <LumixMetaItem label={'Next run'}>
                                            {schedule.nextRunAt ? (
                                                <span css={tw`text-xs`}>
                                                    {format(schedule.nextRunAt, "MMM d, yyyy h:mm a")}
                                                </span>
                                            ) : (
                                                <span css={tw`text-lumix-muted`}>—</span>
                                            )}
                                        </LumixMetaItem>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div css={tw`p-4 sm:p-5`}>
                            <p css={tw`text-2xs font-semibold uppercase tracking-wide text-lumix-muted`}>
                                Cron expression
                            </p>
                            <ScheduleCronRow
                                cron={schedule.cron}
                                css={tw`mt-3 rounded-xl border border-lumix-border/40 bg-black/15 p-3 sm:hidden`}
                            />
                            <div
                                css={tw`mt-3 hidden grid-cols-2 gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-5`}
                            >
                                <CronFieldBox title={'Minute'} value={schedule.cron.minute} />
                                <CronFieldBox title={'Hour'} value={schedule.cron.hour} />
                                <CronFieldBox title={'Day (month)'} value={schedule.cron.dayOfMonth} />
                                <CronFieldBox title={'Month'} value={schedule.cron.month} />
                                <CronFieldBox title={'Day (week)'} value={schedule.cron.dayOfWeek} />
                            </div>
                        </div>
                    </LumixCard>
                    <LumixSectionHeader
                        title={'Tasks'}
                        description={
                            'Tasks run in order after the cron fires. Offsets wait between steps; failures can optionally continue the chain.'
                        }
                    />
                    {schedule.tasks.length === 0 ? (
                        <LumixEmptyState title={'No tasks yet'}>
                            Add a command, power action, or backup step. The first task ignores its offset; later tasks
                            honor the delay you set.
                        </LumixEmptyState>
                    ) : (
                        <LumixCard noHover css={tw`overflow-hidden`}>
                            <div css={tw`divide-y divide-lumix-border/30`}>
                                {schedule.tasks
                                    .sort((a, b) =>
                                        a.sequenceId === b.sequenceId ? 0 : a.sequenceId > b.sequenceId ? 1 : -1
                                    )
                                    .map((task) => (
                                        <ScheduleTaskRow
                                            key={`${schedule.id}_${task.id}`}
                                            task={task}
                                            schedule={schedule}
                                        />
                                    ))}
                            </div>
                        </LumixCard>
                    )}
                    <EditScheduleModal visible={showEditModal} schedule={schedule} onModalDismissed={toggleEditModal} />
                    <div
                        css={tw`mt-8 flex flex-col-reverse gap-3 border-t border-lumix-border/30 pt-6 sm:flex-row sm:justify-end sm:gap-2`}
                    >
                        <Can action={'schedule.delete'}>
                            <DeleteScheduleButton
                                scheduleId={schedule.id}
                                onDeleted={() => history.push(`/server/${id}/schedules`)}
                            />
                        </Can>
                        {schedule.tasks.length > 0 && (
                            <Can action={'schedule.update'}>
                                <RunScheduleButton schedule={schedule} />
                            </Can>
                        )}
                    </div>
                </>
            )}
        </ServerContentBlock>
    );
};
