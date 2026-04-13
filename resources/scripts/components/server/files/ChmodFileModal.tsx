import { fileBitsToString } from '@/helpers';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import React from 'react';
import Modal, { RequiredModalProps } from '@/components/elements/Modal';
import { Form, Formik, FormikHelpers } from 'formik';
import Field from '@/components/elements/Field';
import chmodFiles from '@/api/server/files/chmodFiles';
import { ServerContext } from '@/state/server';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import useFlash from '@/plugins/useFlash';

interface FormikValues {
    mode: string;
}

interface File {
    file: string;
    mode: string;
}

type OwnProps = RequiredModalProps & { files: File[] };

const ChmodFileModal = ({ files, ...props }: OwnProps) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { mutate } = useFileManagerSwr();
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const setSelectedFiles = ServerContext.useStoreActions((actions) => actions.files.setSelectedFiles);

    const submit = ({ mode }: FormikValues, { setSubmitting }: FormikHelpers<FormikValues>) => {
        clearFlashes('files');

        mutate(
            (data) =>
                data.map((f) =>
                    f.name === files[0].file ? { ...f, mode: fileBitsToString(mode, !f.isFile), modeBits: mode } : f
                ),
            false
        );

        const data = files.map((f) => ({ file: f.file, mode: mode }));

        chmodFiles(uuid, directory, data)
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
        <Formik onSubmit={submit} initialValues={{ mode: files.length > 1 ? '' : files[0].mode || '' }}>
            {({ isSubmitting }) => (
                <Modal {...props} dismissable={!isSubmitting} showSpinnerOverlay={isSubmitting}>
                    <h2 css={tw`text-xl font-semibold tracking-tight text-[var(--lumix-text)]`}>Set permissions</h2>
                    <p css={tw`mt-1 text-sm text-lumix-muted`}>
                        Enter a numeric mode (e.g. 644 or 755). Applies to {files.length} selected item
                        {files.length === 1 ? '' : 's'}.
                    </p>
                    <Form css={tw`m-0 mt-4`}>
                        <div css={tw`flex flex-col gap-4 sm:flex-row sm:items-end`}>
                            <div css={tw`w-full flex-1`}>
                                <Field type={'string'} id={'file_mode'} name={'mode'} label={'Mode'} autoFocus />
                            </div>
                            <div css={tw`flex w-full justify-end sm:w-auto`}>
                                <Button type={'submit'} css={tw`w-full sm:w-auto`}>
                                    Update
                                </Button>
                            </div>
                        </div>
                    </Form>
                </Modal>
            )}
        </Formik>
    );
};

export default ChmodFileModal;
