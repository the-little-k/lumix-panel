import React from 'react';
import Modal, { RequiredModalProps } from '@/components/elements/Modal';
import { Form, Formik, FormikHelpers } from 'formik';
import Field from '@/components/elements/Field';
import { join } from 'pathe';
import renameFiles from '@/api/server/files/renameFiles';
import { ServerContext } from '@/state/server';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import useFlash from '@/plugins/useFlash';
import LumixCode from '@/components/lumix/LumixCode';

interface FormikValues {
    name: string;
}

type OwnProps = RequiredModalProps & { files: string[]; useMoveTerminology?: boolean };

const RenameFileModal = ({ files, useMoveTerminology, ...props }: OwnProps) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { mutate } = useFileManagerSwr();
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const setSelectedFiles = ServerContext.useStoreActions((actions) => actions.files.setSelectedFiles);

    const submit = ({ name }: FormikValues, { setSubmitting }: FormikHelpers<FormikValues>) => {
        clearFlashes('files');

        const len = name.split('/').length;
        if (files.length === 1) {
            if (!useMoveTerminology && len === 1) {
                mutate((data) => data.map((f) => (f.name === files[0] ? { ...f, name } : f)), false);
            } else if (useMoveTerminology || len > 1) {
                mutate((data) => data.filter((f) => f.name !== files[0]), false);
            }
        }

        let data;
        if (useMoveTerminology && files.length > 1) {
            data = files.map((f) => ({ from: f, to: join(name, f) }));
        } else {
            data = files.map((f) => ({ from: f, to: name }));
        }

        renameFiles(uuid, directory, data)
            .then((): Promise<any> => (files.length > 0 ? mutate() : Promise.resolve()))
            .then(() => setSelectedFiles([]))
            .catch((error) => {
                mutate();
                setSubmitting(false);
                clearAndAddHttpError({ key: 'files', error });
            })
            .then(() => props.onDismissed());
    };

    return (
        <Formik onSubmit={submit} initialValues={{ name: files.length > 1 ? '' : files[0] || '' }}>
            {({ isSubmitting, values }) => (
                <Modal {...props} dismissable={!isSubmitting} showSpinnerOverlay={isSubmitting}>
                    <h2 css={tw`text-xl font-semibold tracking-tight text-[var(--lumix-text)]`}>
                        {useMoveTerminology ? 'Move' : 'Rename'}{' '}
                        {files.length === 1 ? 'item' : `${files.length} items`}
                    </h2>
                    <p css={tw`mt-1 text-sm text-lumix-muted`}>
                        {useMoveTerminology
                            ? 'Destination is relative to the current directory.'
                            : 'New name stays in this folder unless you include a path.'}
                    </p>
                    <Form css={tw`m-0 mt-4`}>
                        <div css={[tw`flex flex-col gap-4`, useMoveTerminology ? tw`sm:items-stretch` : tw`sm:items-end sm:flex-row`]}>
                            <div css={tw`w-full flex-1`}>
                                <Field
                                    type={'string'}
                                    id={'file_name'}
                                    name={'name'}
                                    label={useMoveTerminology ? 'Destination' : 'New name'}
                                    description={
                                        useMoveTerminology
                                            ? 'Path relative to the current directory (e.g. ../backup or subfolder/name).'
                                            : undefined
                                    }
                                    autoFocus
                                />
                            </div>
                            <div css={tw`flex w-full justify-end sm:w-auto`}>
                                <Button type={'submit'} css={tw`w-full sm:w-auto`}>
                                    {useMoveTerminology ? 'Move' : 'Rename'}
                                </Button>
                            </div>
                        </div>
                        {useMoveTerminology && (
                            <div css={tw`mt-4`}>
                                <p css={tw`text-2xs font-semibold uppercase tracking-wide text-lumix-muted`}>
                                    Preview path
                                </p>
                                <LumixCode variant={'block'} className={'mt-1.5 text-xs'}>
                                    /home/container/{join(directory, values.name).replace(/^(\.\.\/|\/)+/, '')}
                                </LumixCode>
                            </div>
                        )}
                    </Form>
                </Modal>
            )}
        </Formik>
    );
};

export default RenameFileModal;
