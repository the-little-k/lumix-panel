import React, { useContext, useEffect, useState } from 'react';
import { Schedule } from '@/api/server/schedules/getServerSchedules';
import Field from '@/components/elements/Field';
import { Form, Formik, FormikHelpers } from 'formik';
import FormikSwitch from '@/components/elements/FormikSwitch';
import createOrUpdateSchedule from '@/api/server/schedules/createOrUpdateSchedule';
import { ServerContext } from '@/state/server';
import { httpErrorToHuman } from '@/api/http';
import FlashMessageRender from '@/components/FlashMessageRender';
import useFlash from '@/plugins/useFlash';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import ModalContext from '@/context/ModalContext';
import asModal from '@/hoc/asModal';
import Switch from '@/components/elements/Switch';
import ScheduleCheatsheetCards from '@/components/server/schedules/ScheduleCheatsheetCards';
import LumixCard from '@/components/lumix/LumixCard';

interface Props {
    schedule?: Schedule;
}

interface Values {
    name: string;
    dayOfWeek: string;
    month: string;
    dayOfMonth: string;
    hour: string;
    minute: string;
    enabled: boolean;
    onlyWhenOnline: boolean;
}

const EditScheduleModal = ({ schedule }: Props) => {
    const { addError, clearFlashes } = useFlash();
    const { dismiss } = useContext(ModalContext);

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const appendSchedule = ServerContext.useStoreActions((actions) => actions.schedules.appendSchedule);
    const [showCheatsheet, setShowCheatsheet] = useState(false);

    useEffect(() => {
        return () => {
            clearFlashes('schedule:edit');
        };
    }, []);

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('schedule:edit');
        createOrUpdateSchedule(uuid, {
            id: schedule?.id,
            name: values.name,
            cron: {
                minute: values.minute,
                hour: values.hour,
                dayOfWeek: values.dayOfWeek,
                month: values.month,
                dayOfMonth: values.dayOfMonth,
            },
            onlyWhenOnline: values.onlyWhenOnline,
            isActive: values.enabled,
        })
            .then((schedule) => {
                setSubmitting(false);
                appendSchedule(schedule);
                dismiss();
            })
            .catch((error) => {
                console.error(error);

                setSubmitting(false);
                addError({ key: 'schedule:edit', message: httpErrorToHuman(error) });
            });
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={
                {
                    name: schedule?.name || '',
                    minute: schedule?.cron.minute || '*/5',
                    hour: schedule?.cron.hour || '*',
                    dayOfMonth: schedule?.cron.dayOfMonth || '*',
                    month: schedule?.cron.month || '*',
                    dayOfWeek: schedule?.cron.dayOfWeek || '*',
                    enabled: schedule?.isActive ?? true,
                    onlyWhenOnline: schedule?.onlyWhenOnline ?? true,
                } as Values
            }
        >
            {({ isSubmitting }) => (
                <Form css={tw`m-0`}>
                    <h2 css={tw`text-xl font-semibold tracking-tight text-[var(--lumix-text)]`}>
                        {schedule ? 'Edit schedule' : 'Create schedule'}
                    </h2>
                    <p css={tw`mt-1 text-sm text-lumix-muted`}>
                        Name this schedule and set cron fields using standard cron syntax. Tasks you add later run in
                        sequence after each trigger.
                    </p>
                    <FlashMessageRender byKey={'schedule:edit'} css={tw`mt-4`} />
                    <LumixCard noHover css={tw`mt-6 overflow-hidden`}>
                        <div css={tw`border-b border-lumix-border/30 bg-black/10 px-4 py-3 sm:px-5`}>
                            <h3 css={tw`text-sm font-semibold text-[var(--lumix-text)]`}>Basics</h3>
                        </div>
                        <div css={tw`space-y-4 p-4 sm:p-5`}>
                            <Field
                                name={'name'}
                                label={'Schedule name'}
                                description={'A short label you will recognize in the list.'}
                            />
                        </div>
                    </LumixCard>
                    <LumixCard noHover css={tw`mt-4 overflow-hidden`}>
                        <div css={tw`border-b border-lumix-border/30 bg-black/10 px-4 py-3 sm:px-5`}>
                            <h3 css={tw`text-sm font-semibold text-[var(--lumix-text)]`}>Cron timing</h3>
                            <p css={tw`mt-0.5 text-xs text-lumix-muted`}>
                                Each field follows cron rules. Use the cheatsheet for common patterns.
                            </p>
                        </div>
                        <div css={tw`space-y-4 p-4 sm:p-5`}>
                            <div css={tw`grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5`}>
                                <Field name={'minute'} label={'Minute'} />
                                <Field name={'hour'} label={'Hour'} />
                                <Field name={'dayOfMonth'} label={'Day (month)'} />
                                <Field name={'month'} label={'Month'} />
                                <Field name={'dayOfWeek'} label={'Day (week)'} />
                            </div>
                            <div css={tw`rounded-xl border border-lumix-border/40 bg-black/15 p-4`}>
                                <Switch
                                    name={'show_cheatsheet'}
                                    description={'Show quick examples and special characters.'}
                                    label={'Cron cheatsheet'}
                                    defaultChecked={showCheatsheet}
                                    onChange={() => setShowCheatsheet((s) => !s)}
                                />
                                {showCheatsheet && (
                                    <div css={tw`mt-4`}>
                                        <ScheduleCheatsheetCards />
                                    </div>
                                )}
                            </div>
                        </div>
                    </LumixCard>
                    <LumixCard noHover css={tw`mt-4 overflow-hidden`}>
                        <div css={tw`space-y-1 p-4 sm:p-5`}>
                            <FormikSwitch
                                name={'onlyWhenOnline'}
                                description={'Skip runs while the server is stopped or installing.'}
                                label={'Only when server is online'}
                            />
                        </div>
                    </LumixCard>
                    <LumixCard noHover css={tw`mt-4 overflow-hidden`}>
                        <div css={tw`space-y-1 p-4 sm:p-5`}>
                            <FormikSwitch
                                name={'enabled'}
                                description={'Disable to pause automatic execution without deleting tasks.'}
                                label={'Schedule enabled'}
                            />
                        </div>
                    </LumixCard>
                    <div css={tw`mt-6 flex justify-end`}>
                        <Button className={'w-full sm:w-auto'} type={'submit'} disabled={isSubmitting}>
                            {schedule ? 'Save changes' : 'Create schedule'}
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default asModal<Props>()(EditScheduleModal);
