import React, { useEffect, useState } from 'react';
import Modal, { RequiredModalProps } from '@/components/elements/Modal';
import { Field as FormikField, Form, Formik, FormikHelpers, useFormikContext } from 'formik';
import { boolean, object, string } from 'yup';
import Field from '@/components/elements/Field';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import useFlash from '@/plugins/useFlash';
import createServerBackup from '@/api/server/backups/createServerBackup';
import FlashMessageRender from '@/components/FlashMessageRender';
import Button from '@/components/elements/Button';
import tw from 'twin.macro';
import { Textarea } from '@/components/elements/Input';
import getServerBackups from '@/api/swr/getServerBackups';
import { ServerContext } from '@/state/server';
import FormikSwitch from '@/components/elements/FormikSwitch';
import Can from '@/components/elements/Can';
import { Button as LumixButton } from '@/components/elements/button/index';

interface Values {
    name: string;
    ignored: string;
    isLocked: boolean;
}

const ModalContent = ({ ...props }: RequiredModalProps) => {
    const { isSubmitting } = useFormikContext<Values>();

    return (
        <Modal {...props} showSpinnerOverlay={isSubmitting}>
            <Form>
                <FlashMessageRender byKey={'backups:create'} css={tw`mb-4`} />
                <h2 css={tw`mb-2 text-2xl font-semibold text-[var(--lumix-text)]`}>Create backup</h2>
                <p css={tw`mb-6 text-sm text-lumix-muted`}>
                    Optionally name the backup, exclude paths, and lock it so it cannot be deleted until unlocked.
                </p>
                <Field
                    name={'name'}
                    label={'Backup name'}
                    description={'If set, this label identifies the backup in the list.'}
                />
                <div css={tw`mt-6`}>
                    <FormikFieldWrapper
                        name={'ignored'}
                        label={'Ignored files & directories'}
                        description={`
                            Paths to skip (supports wildcards and leading ! to negate). Leave blank to use .pteroignore when present.
                        `}
                    >
                        <FormikField as={Textarea} name={'ignored'} rows={6} />
                    </FormikFieldWrapper>
                </div>
                <Can action={'backup.delete'}>
                    <div css={tw`mt-6 rounded-xl border border-lumix-border/40 bg-black/20 p-4`}>
                        <FormikSwitch
                            name={'isLocked'}
                            label={'Locked'}
                            description={'Prevents deletion until explicitly unlocked.'}
                        />
                    </div>
                </Can>
                <div css={tw`mt-8 flex justify-end`}>
                    <Button type={'submit'} disabled={isSubmitting}>
                        Start backup
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [visible, setVisible] = useState(false);
    const { mutate } = getServerBackups();

    useEffect(() => {
        clearFlashes('backups:create');
    }, [visible]);

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('backups:create');
        createServerBackup(uuid, values)
            .then((backup) => {
                mutate(
                    (data) => ({ ...data, items: data.items.concat(backup), backupCount: data.backupCount + 1 }),
                    false
                );
                setVisible(false);
            })
            .catch((error) => {
                clearAndAddHttpError({ key: 'backups:create', error });
                setSubmitting(false);
            });
    };

    return (
        <>
            {visible && (
                <Formik
                    onSubmit={submit}
                    initialValues={{ name: '', ignored: '', isLocked: false }}
                    validationSchema={object().shape({
                        name: string().max(191),
                        ignored: string(),
                        isLocked: boolean(),
                    })}
                >
                    <ModalContent appear visible={visible} onDismissed={() => setVisible(false)} />
                </Formik>
            )}
            <LumixButton className={'w-full sm:w-auto'} onClick={() => setVisible(true)}>
                Create backup
            </LumixButton>
        </>
    );
};
