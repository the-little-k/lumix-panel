import React, { useEffect, useState } from 'react';
import { ActivityLogFilters, useActivityLogs } from '@/api/account/activity';
import { useFlashKey } from '@/plugins/useFlash';
import PageContentBlock from '@/components/elements/PageContentBlock';
import PaginationFooter from '@/components/elements/table/PaginationFooter';
import { DesktopComputerIcon, XCircleIcon } from '@heroicons/react/solid';
import Spinner from '@/components/elements/Spinner';
import ActivityLogEntry from '@/components/elements/activity/ActivityLogEntry';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import useLocationHash from '@/plugins/useLocationHash';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import LumixSectionHeader from '@/components/lumix/LumixSectionHeader';
import LumixEmptyState from '@/components/lumix/LumixEmptyState';
import LumixCard from '@/components/lumix/LumixCard';

export default () => {
    const { hash } = useLocationHash();
    const { clearAndAddHttpError } = useFlashKey('account');
    const [filters, setFilters] = useState<ActivityLogFilters>({ page: 1, sorts: { timestamp: -1 } });
    const { data, isValidating, error } = useActivityLogs(filters, {
        revalidateOnMount: true,
        revalidateOnFocus: false,
    });

    useEffect(() => {
        setFilters((value) => ({ ...value, filters: { ip: hash.ip, event: hash.event } }));
    }, [hash]);

    useEffect(() => {
        clearAndAddHttpError(error);
    }, [error]);

    return (
        <PageContentBlock title={'Account Activity Log'} showFlashKey={'account'}>
            <LumixSectionHeader
                title={'Account activity'}
                description={
                    'Security and account events across the panel. Click an event name to filter the list; clear filters to reset.'
                }
                actions={
                    (filters.filters?.event || filters.filters?.ip) && (
                        <Button.Text
                            type={'button'}
                            className={'inline-flex items-center gap-2'}
                            onClick={() => setFilters((value) => ({ ...value, filters: {} }))}
                        >
                            Clear filters
                            <XCircleIcon className={'h-4 w-4'} />
                        </Button.Text>
                    )
                }
            />
            {!data && isValidating ? (
                <div css={tw`flex justify-center py-16`}>
                    <Spinner size={'large'} centered />
                </div>
            ) : !data?.items.length ? (
                <LumixEmptyState title={'No activity logged'}>
                    Actions on your account will show up here as they happen.
                </LumixEmptyState>
            ) : (
                <LumixCard noHover css={tw`overflow-hidden px-2 sm:px-4`}>
                    {data?.items.map((activity) => (
                        <ActivityLogEntry key={activity.id} activity={activity}>
                            {typeof activity.properties.useragent === 'string' && (
                                <Tooltip content={activity.properties.useragent} placement={'top'}>
                                    <span>
                                        <DesktopComputerIcon />
                                    </span>
                                </Tooltip>
                            )}
                        </ActivityLogEntry>
                    ))}
                </LumixCard>
            )}
            {data && (
                <PaginationFooter
                    className={'mt-4'}
                    pagination={data.pagination}
                    onPageSelect={(page) => setFilters((value) => ({ ...value, page }))}
                />
            )}
        </PageContentBlock>
    );
};
