import React, { useContext, useEffect } from 'react';
import { Schedule, Task } from '@/api/server/schedules/getServerSchedules';
import { Field as FormikField, Form, Formik, FormikHelpers, useField } from 'formik';
import { ServerContext } from '@/state/server';
import createOrUpdateScheduleTask from '@/api/server/schedules/createOrUpdateScheduleTask';
import { httpErrorToHuman } from '@/api/http';
import Field from '@/components/elements/Field';
import FlashMessageRender from '@/components/FlashMessageRender';
import { boolean, number, object, string } from 'yup';
import useFlash from '@/plugins/useFlash';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import tw from 'twin.macro';
import Label from '@/components/elements/Label';
import { Textarea } from '@/components/elements/Input';
import { Button } from '@/components/elements/button/index';
import Select from '@/components/elements/Select';
import ModalContext from '@/context/ModalContext';
import asModal from '@/hoc/asModal';
import FormikSwitch from '@/components/elements/FormikSwitch';
import LumixCard from '@/components/lumix/LumixCard';

interface Props {
    schedule: Schedule;
    // If a task is provided we can assume we're editing it. If not provided,
    // we are creating a new one.
    task?: Task;
}

interface Values {
    action: string;
    payload: string;
    timeOffset: string;
    continueOnFailure: boolean;
}

const schema = object().shape({
    action: string().required().oneOf(['command', 'power', 'backup']),
    payload: string().when('action', {
        is: (v) => v !== 'backup',
        then: string().required('A task payload must be provided.'),
        otherwise: string(),
    }),
    continueOnFailure: boolean(),
    timeOffset: number()
        .typeError('The time offset must be a valid number between 0 and 900.')
        .required('A time offset value must be provided.')
        .min(0, 'The time offset must be at least 0 seconds.')
        .max(900, 'The time offset must be less than 900 seconds.'),
});

const ActionListener = () => {
    const [{ value }, { initialValue: initialAction }] = useField<string>('action');
    const [, { initialValue: initialPayload }, { setValue, setTouched }] = useField<string>('payload');

    useEffect(() => {
        if (value !== initialAction) {
            setValue(value === 'power' ? 'start' : '');
            setTouched(false);
        } else {
            setValue(initialPayload || '');
            setTouched(false);
        }
    }, [value]);

    return null;
};

const TaskDetailsModal = ({ schedule, task }: Props) => {
    const { dismiss } = useContext(ModalContext);
    const { clearFlashes, addError } = useFlash();

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const appendSchedule = ServerContext.useStoreActions((actions) => actions.schedules.appendSchedule);
    const backupLimit = ServerContext.useStoreState((state) => state.server.data!.featureLimits.backups);

    useEffect(() => {
        return () => {
            clearFlashes('schedule:task');
        };
    }, []);

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('schedule:task');
        if (backupLimit === 0 && values.action === 'backup') {
            setSubmitting(false);
            addError({
                message: "A backup task cannot be created when the server's backup limit is set to 0.",
                key: 'schedule:task',
            });
        } else {
            createOrUpdateScheduleTask(uuid, schedule.id, task?.id, values)
                .then((task) => {
                    let tasks = schedule.tasks.map((t) => (t.id === task.id ? task : t));
                    if (!schedule.tasks.find((t) => t.id === task.id)) {
                        tasks = [...tasks, task];
                    }

                    appendSchedule({ ...schedule, tasks });
                    dismiss();
                })
                .catch((error) => {
                    console.error(error);
                    setSubmitting(false);
                    addError({ message: httpErrorToHuman(error), key: 'schedule:task' });
                });
        }
    };

    return (
        <Formik
            onSubmit={submit}
            validationSchema={schema}
            initialValues={{
                action: task?.action || 'command',
                payload: task?.payload || '',
                timeOffset: task?.timeOffset.toString() || '0',
                continueOnFailure: task?.continueOnFailure || false,
            }}
        >
            {({ isSubmitting, values }) => (
                <Form css={tw`m-0`}>
                    <h2 css={tw`text-xl font-semibold tracking-tight text-[var(--lumix-text)]`}>
                        {task ? 'Edit task' : 'Create task'}
                    </h2>
                    <p css={tw`mt-1 text-sm text-lumix-muted`}>
                        Choose what this step does, how long to wait after the previous task, and whether failures should
                        block the rest of the chain.
                    </p>
                    <FlashMessageRender byKey={'schedule:task'} css={tw`mt-4`} />
                    <LumixCard noHover css={tw`mt-6 overflow-hidden`}>
                        <div css={tw`space-y-4 p-4 sm:p-5`}>
                            <div css={tw`flex flex-col gap-4 lg:flex-row`}>
                                <div css={tw`lg:w-1/3`}>
                                    <Label>Action</Label>
                                    <ActionListener />
                                    <FormikFieldWrapper name={'action'}>
                                        <FormikField as={Select} name={'action'}>
                                            <option value={'command'}>Send command</option>
                                            <option value={'power'}>Send power action</option>
                                            <option value={'backup'}>Create backup</option>
                                        </FormikField>
                                    </FormikFieldWrapper>
                                </div>
                                <div css={tw`flex-1 lg:pl-6`}>
                                    <Field
                                        name={'timeOffset'}
                                        label={'Time offset (seconds)'}
                                        description={
                                            'Wait this long after the previous task completes. Ignored for the first task in the schedule.'
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </LumixCard>
                    <LumixCard noHover css={tw`mt-4 overflow-hidden`}>
                        <div css={tw`border-b border-lumix-border/30 bg-black/10 px-4 py-3 sm:px-5`}>
                            <h3 css={tw`text-sm font-semibold text-[var(--lumix-text)]`}>Payload</h3>
                            <p css={tw`mt-0.5 text-xs text-lumix-muted`}>
                                Command text, power choice, or backup ignore rules depending on the action.
                            </p>
                        </div>
                        <div css={tw`p-4 sm:p-5`}>
                            {values.action === 'command' ? (
                                <div>
                                    <Label>Command</Label>
                                    <FormikFieldWrapper name={'payload'}>
                                        <FormikField as={Textarea} name={'payload'} rows={6} />
                                    </FormikFieldWrapper>
                                </div>
                            ) : values.action === 'power' ? (
                                <div>
                                    <Label>Power action</Label>
                                    <FormikFieldWrapper name={'payload'}>
                                        <FormikField as={Select} name={'payload'}>
                                            <option value={'start'}>Start the server</option>
                                            <option value={'restart'}>Restart the server</option>
                                            <option value={'stop'}>Stop the server</option>
                                            <option value={'kill'}>Terminate the server</option>
                                        </FormikField>
                                    </FormikFieldWrapper>
                                </div>
                            ) : (
                                <div>
                                    <Label>Ignored files</Label>
                                    <FormikFieldWrapper
                                        name={'payload'}
                                        description={
                                            'Optional. List files and folders to exclude. Your .pteroignore applies when this is left blank. Oldest backups rotate if you are at the limit.'
                                        }
                                    >
                                        <FormikField as={Textarea} name={'payload'} rows={6} />
                                    </FormikFieldWrapper>
                                </div>
                            )}
                        </div>
                    </LumixCard>
                    <LumixCard noHover css={tw`mt-4 overflow-hidden`}>
                        <div css={tw`p-4 sm:p-5`}>
                            <FormikSwitch
                                name={'continueOnFailure'}
                                description={'Allow later tasks to run even if this one errors.'}
                                label={'Continue on failure'}
                            />
                        </div>
                    </LumixCard>
                    <div css={tw`mt-6 flex justify-end`}>
                        <Button type={'submit'} disabled={isSubmitting}>
                            {task ? 'Save changes' : 'Create task'}
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default asModal<Props>()(TaskDetailsModal);
