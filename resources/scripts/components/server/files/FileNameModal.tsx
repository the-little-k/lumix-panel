import React from 'react';
import Modal, { RequiredModalProps } from '@/components/elements/Modal';
import { Form, Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import Field from '@/components/elements/Field';
import { ServerContext } from '@/state/server';
import { join } from 'pathe';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';

type Props = RequiredModalProps & {
    onFileNamed: (name: string) => void;
};

interface Values {
    fileName: string;
}

export default ({ onFileNamed, onDismissed, ...props }: Props) => {
    const directory = ServerContext.useStoreState((state) => state.files.directory);

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        onFileNamed(join(directory, values.fileName));
        setSubmitting(false);
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{ fileName: '' }}
            validationSchema={object().shape({
                fileName: string().required().min(1),
            })}
        >
            {({ resetForm }) => (
                <Modal
                    onDismissed={() => {
                        resetForm();
                        onDismissed();
                    }}
                    {...props}
                >
                    <h2 css={tw`text-xl font-semibold tracking-tight text-[var(--lumix-text)]`}>Create file</h2>
                    <p css={tw`mt-1 text-sm text-lumix-muted`}>Choose a file name relative to the current folder.</p>
                    <Form css={tw`mt-4`}>
                        <Field
                            id={'fileName'}
                            name={'fileName'}
                            label={'File name'}
                            description={'This will be saved in the directory you had open in the file manager.'}
                            autoFocus
                        />
                        <div css={tw`mt-6 flex justify-end`}>
                            <Button type={'submit'}>Create file</Button>
                        </div>
                    </Form>
                </Modal>
            )}
        </Formik>
    );
};
