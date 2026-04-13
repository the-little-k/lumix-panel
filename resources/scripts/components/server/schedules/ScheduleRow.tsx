import React from 'react';
import { Schedule } from '@/api/server/schedules/getServerSchedules';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faChevronRight, faTasks } from '@fortawesome/free-solid-svg-icons';
import { format, formatDistanceToNow } from 'date-fns';
import tw from 'twin.macro';
import ScheduleCronRow from '@/components/server/schedules/ScheduleCronRow';
import LumixStatusBadge from '@/components/lumix/LumixStatusBadge';
import LumixMetaItem from '@/components/lumix/LumixMetaItem';

export default ({ schedule }: { schedule: Schedule }) => {
    const taskCount = schedule.tasks?.length ?? 0;
    const statusBadge = schedule.isProcessing ? (
        <LumixStatusBadge tone={'warning'}>Processing</LumixStatusBadge>
    ) : schedule.isActive ? (
        <LumixStatusBadge tone={'success'}>Active</LumixStatusBadge>
    ) : (
        <LumixStatusBadge tone={'neutral'}>Inactive</LumixStatusBadge>
    );

    const nextRun =
        schedule.nextRunAt && schedule.isActive
            ? `${format(schedule.nextRunAt, "MMM d, yyyy 'at' h:mm a")} (${formatDistanceToNow(schedule.nextRunAt, {
                  addSuffix: true,
              })})`
            : schedule.isActive
            ? '—'
            : 'Paused';

    return (
        <div css={tw`flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between`}>
            <div css={tw`flex min-w-0 flex-1 gap-4`}>
                <div
                    css={tw`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-200 ring-1 ring-violet-400/20`}
                >
                    <FontAwesomeIcon icon={faCalendarAlt} className={'text-lg'} />
                </div>
                <div css={tw`min-w-0 flex-1`}>
                    <div css={tw`flex flex-wrap items-center gap-2`}>
                        <h3 css={tw`text-lg font-semibold text-[var(--lumix-text)]`}>{schedule.name}</h3>
                        {statusBadge}
                    </div>
                    <div css={tw`mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3`}>
                        <LumixMetaItem label={'Next run'}>
                            <span css={tw`text-xs leading-snug`}>{nextRun}</span>
                        </LumixMetaItem>
                        <LumixMetaItem label={'Last run'}>
                            {schedule.lastRunAt ? (
                                <span css={tw`text-xs`}>
                                    {format(schedule.lastRunAt, "MMM d, yyyy h:mm a")} (
                                    {formatDistanceToNow(schedule.lastRunAt, { addSuffix: true })})
                                </span>
                            ) : (
                                <span css={tw`text-lumix-muted`}>Never</span>
                            )}
                        </LumixMetaItem>
                        <LumixMetaItem label={'Tasks'}>
                            <span css={tw`inline-flex items-center gap-1.5`}>
                                <FontAwesomeIcon icon={faTasks} css={tw`text-xs text-indigo-300/80`} />
                                {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                            </span>
                        </LumixMetaItem>
                    </div>
                </div>
            </div>
            <div
                css={tw`flex flex-col gap-3 border-t border-lumix-border/30 pt-4 lg:w-72 lg:border-0 lg:pt-0 xl:w-80`}
            >
                <p css={tw`text-2xs font-semibold uppercase tracking-wide text-lumix-muted`}>Cron</p>
                <ScheduleCronRow cron={schedule.cron} />
            </div>
            <div css={tw`hidden items-center text-lumix-muted lg:flex`}>
                <FontAwesomeIcon icon={faChevronRight} css={tw`text-lg opacity-50`} />
            </div>
        </div>
    );
};
