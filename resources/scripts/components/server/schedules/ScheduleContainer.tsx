import React, { useEffect, useState } from 'react';
import getServerSchedules from '@/api/server/schedules/getServerSchedules';
import { ServerContext } from '@/state/server';
import Spinner from '@/components/elements/Spinner';
import { useHistory, useRouteMatch } from 'react-router-dom';
import ScheduleRow from '@/components/server/schedules/ScheduleRow';
import { httpErrorToHuman } from '@/api/http';
import EditScheduleModal from '@/components/server/schedules/EditScheduleModal';
import Can from '@/components/elements/Can';
import useFlash from '@/plugins/useFlash';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import LumixCard from '@/components/lumix/LumixCard';
import LumixSectionHeader from '@/components/lumix/LumixSectionHeader';
import LumixEmptyState from '@/components/lumix/LumixEmptyState';

export default () => {
    const match = useRouteMatch();
    const history = useHistory();

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { clearFlashes, addError } = useFlash();
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);

    const schedules = ServerContext.useStoreState((state) => state.schedules.data);
    const setSchedules = ServerContext.useStoreActions((actions) => actions.schedules.setSchedules);

    useEffect(() => {
        clearFlashes('schedules');
        getServerSchedules(uuid)
            .then((rows) => setSchedules(rows))
            .catch((error) => {
                addError({ message: httpErrorToHuman(error), key: 'schedules' });
                console.error(error);
            })
            .then(() => setLoading(false));
    }, []);

    const openSchedule = (id: number) => {
        history.push(`${match.url}/${id}`);
    };

    return (
        <ServerContentBlock title={'Schedules'} showFlashKey={'schedules'}>
            <EditScheduleModal visible={visible} onModalDismissed={() => setVisible(false)} />
            <LumixSectionHeader
                title={'Task schedules'}
                description={
                    'Automate power actions, commands, and backups on a cron timeline. Select a schedule to edit tasks and timing.'
                }
                actions={
                    <Can action={'schedule.create'}>
                        <Button type={'button'} onClick={() => setVisible(true)}>
                            Create schedule
                        </Button>
                    </Can>
                }
            />
            {!schedules.length && loading ? (
                <div css={tw`flex justify-center py-16`}>
                    <Spinner size={'large'} />
                </div>
            ) : schedules.length === 0 ? (
                <LumixEmptyState title={'No schedules yet'}>
                    Create a schedule to run commands or power actions on a repeating cron. You can add multiple tasks
                    per schedule with offsets.
                </LumixEmptyState>
            ) : (
                <div css={tw`flex flex-col gap-3`}>
                    {schedules.map((schedule) => (
                        <LumixCard
                            key={schedule.id}
                            noHover
                            role={'button'}
                            tabIndex={0}
                            onClick={() => openSchedule(schedule.id)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    openSchedule(schedule.id);
                                }
                            }}
                            css={tw`cursor-pointer p-4 ring-0 transition hover:border-indigo-500/35 hover:shadow-lg hover:shadow-indigo-500/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 sm:p-5`}
                        >
                            <ScheduleRow schedule={schedule} />
                        </LumixCard>
                    ))}
                </div>
            )}
        </ServerContentBlock>
    );
};
