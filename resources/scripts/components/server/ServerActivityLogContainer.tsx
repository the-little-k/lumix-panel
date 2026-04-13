import React, { useEffect, useState } from 'react';
import { useActivityLogs } from '@/api/server/activity';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { useFlashKey } from '@/plugins/useFlash';
import Spinner from '@/components/elements/Spinner';
import ActivityLogEntry from '@/components/elements/activity/ActivityLogEntry';
import PaginationFooter from '@/components/elements/table/PaginationFooter';
import { ActivityLogFilters } from '@/api/account/activity';
import { XCircleIcon } from '@heroicons/react/solid';
import useLocationHash from '@/plugins/useLocationHash';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import LumixSectionHeader from '@/components/lumix/LumixSectionHeader';
import LumixEmptyState from '@/components/lumix/LumixEmptyState';
import LumixCard from '@/components/lumix/LumixCard';

export default () => {
    const { hash } = useLocationHash();
    const { clearAndAddHttpError } = useFlashKey('server:activity');
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
        <ServerContentBlock title={'Activity Log'} showFlashKey={'server:activity'}>
            <LumixSectionHeader
                title={'Activity'}
                description={
                    'Audit trail for this server: who did what, when, and from where. Filter by event or IP using the links in each row.'
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
                <LumixEmptyState title={'No activity yet'}>
                    Events from the panel, API, and SFTP will appear here as they occur.
                </LumixEmptyState>
            ) : (
                <LumixCard noHover css={tw`overflow-hidden px-2 sm:px-4`}>
                    {data?.items.map((activity) => (
                        <ActivityLogEntry key={activity.id} activity={activity}>
                            <span />
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
        </ServerContentBlock>
    );
};
