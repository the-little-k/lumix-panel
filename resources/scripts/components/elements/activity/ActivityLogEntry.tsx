import React from 'react';
import { Link } from 'react-router-dom';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Translate from '@/components/elements/Translate';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { ActivityLog } from '@definitions/user';
import ActivityLogMetaButton from '@/components/elements/activity/ActivityLogMetaButton';
import { FolderOpenIcon, TerminalIcon } from '@heroicons/react/solid';
import Avatar from '@/components/Avatar';
import useLocationHash from '@/plugins/useLocationHash';
import { getObjectKeys, isObject } from '@/lib/objects';
import tw from 'twin.macro';

interface Props {
    activity: ActivityLog;
    children?: React.ReactNode;
}

function wrapProperties(value: unknown): any {
    if (value === null || typeof value === 'string' || typeof value === 'number') {
        return `<strong>${String(value)}</strong>`;
    }

    if (isObject(value)) {
        return getObjectKeys(value).reduce((obj, key) => {
            if (key === 'count' || (typeof key === 'string' && key.endsWith('_count'))) {
                return { ...obj, [key]: value[key] };
            }
            return { ...obj, [key]: wrapProperties(value[key]) };
        }, {} as Record<string, unknown>);
    }

    if (Array.isArray(value)) {
        return value.map(wrapProperties);
    }

    return value;
}

export default ({ activity, children }: Props) => {
    const { pathTo } = useLocationHash();
    const actor = activity.relationships.actor;
    const properties = wrapProperties(activity.properties);

    return (
        <div
            css={tw`group grid grid-cols-10 gap-2 border-b border-lumix-border/30 py-4 last:border-b-0`}
        >
            <div css={tw`hidden select-none sm:col-span-1 sm:flex sm:items-center sm:justify-center`}>
                <div
                    css={tw`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white/10 ring-1 ring-lumix-border/40`}
                >
                    <Avatar name={actor?.uuid || 'system'} />
                </div>
            </div>
            <div css={tw`col-span-10 flex sm:col-span-9`}>
                <div css={tw`min-w-0 flex-1 px-2 sm:px-0`}>
                    <div css={tw`flex flex-wrap items-center text-[var(--lumix-text)]`}>
                        <Tooltip placement={'top'} content={actor?.email || 'System User'}>
                            <span css={tw`font-medium`}>{actor?.username || 'System'}</span>
                        </Tooltip>
                        <span css={tw`text-lumix-muted`}>&nbsp;&mdash;&nbsp;</span>
                        <Link
                            to={`#${pathTo({ event: activity.event })}`}
                            css={tw`transition-colors duration-75 hover:text-indigo-300 active:text-indigo-400`}
                        >
                            {activity.event}
                        </Link>
                        <div
                            css={tw`ml-2 flex space-x-1 text-lumix-muted transition-colors duration-100 group-hover:text-[var(--lumix-text)]`}
                        >
                            {activity.isApi && (
                                <Tooltip placement={'top'} content={'Using API Key'}>
                                    <span css={tw`inline-flex`}>
                                        <TerminalIcon css={tw`h-5 w-auto cursor-help px-1 py-px hover:text-indigo-200`} />
                                    </span>
                                </Tooltip>
                            )}
                            {activity.event.startsWith('server:sftp.') && (
                                <Tooltip placement={'top'} content={'Using SFTP'}>
                                    <span css={tw`inline-flex`}>
                                        <FolderOpenIcon
                                            css={tw`h-5 w-auto cursor-help px-1 py-px hover:text-indigo-200`}
                                        />
                                    </span>
                                </Tooltip>
                            )}
                            {children}
                        </div>
                    </div>
                    <p
                        css={tw`mt-1 line-clamp-2 break-words pr-4 text-sm leading-snug text-lumix-muted [&_strong]:break-all [&_strong]:font-semibold [&_strong]:text-[var(--lumix-text)]`}
                    >
                        <Translate ns={'activity'} values={properties} i18nKey={activity.event.replace(':', '.')} />
                    </p>
                    <div css={tw`mt-1.5 flex flex-wrap items-center gap-x-1 text-sm text-lumix-muted`}>
                        {activity.ip && (
                            <>
                                <span css={tw`font-mono text-xs text-[var(--lumix-text)]`}>{activity.ip}</span>
                                <span css={tw`text-lumix-muted`}>|</span>
                            </>
                        )}
                        <Tooltip placement={'right'} content={format(activity.timestamp, 'MMM do, yyyy H:mm:ss')}>
                            <span css={tw`text-xs`}>
                                {formatDistanceToNowStrict(activity.timestamp, { addSuffix: true })}
                            </span>
                        </Tooltip>
                    </div>
                </div>
                {activity.hasAdditionalMetadata && <ActivityLogMetaButton meta={activity.properties} />}
            </div>
        </div>
    );
};
