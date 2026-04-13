import React from 'react';
import { Schedule } from '@/api/server/schedules/getServerSchedules';
import classNames from 'classnames';
import tw from 'twin.macro';
import { SerializedStyles } from '@emotion/react';

interface Props {
    cron: Schedule['cron'];
    className?: string;
    css?: SerializedStyles | SerializedStyles[];
}

const cell = tw`min-w-0 text-center`;

const ScheduleCronRow = ({ cron, className, css: cssProp }: Props) => (
    <div
        className={classNames('flex flex-wrap justify-between gap-3 sm:justify-start sm:gap-4', className)}
        css={cssProp}
    >
        <div css={cell}>
            <p css={tw`font-mono text-sm font-medium text-[var(--lumix-text)]`}>{cron.minute}</p>
            <p css={tw`text-2xs uppercase tracking-wide text-lumix-muted`}>Minute</p>
        </div>
        <div css={cell}>
            <p css={tw`font-mono text-sm font-medium text-[var(--lumix-text)]`}>{cron.hour}</p>
            <p css={tw`text-2xs uppercase tracking-wide text-lumix-muted`}>Hour</p>
        </div>
        <div css={cell}>
            <p css={tw`font-mono text-sm font-medium text-[var(--lumix-text)]`}>{cron.dayOfMonth}</p>
            <p css={tw`text-2xs uppercase tracking-wide text-lumix-muted`}>Day</p>
        </div>
        <div css={cell}>
            <p css={tw`font-mono text-sm font-medium text-[var(--lumix-text)]`}>{cron.month}</p>
            <p css={tw`text-2xs uppercase tracking-wide text-lumix-muted`}>Month</p>
        </div>
        <div css={cell}>
            <p css={tw`font-mono text-sm font-medium text-[var(--lumix-text)]`}>{cron.dayOfWeek}</p>
            <p css={tw`text-2xs uppercase tracking-wide text-lumix-muted`}>Weekday</p>
        </div>
    </div>
);

export default ScheduleCronRow;
