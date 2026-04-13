import React from 'react';
import { ServerContext } from '@/state/server';
import { Field as FormikField, Form, Formik, FormikHelpers, useFormikContext } from 'formik';
import { Actions, useStoreActions } from 'easy-peasy';
import renameServer from '@/api/server/renameServer';
import Field from '@/components/elements/Field';
import { object, string } from 'yup';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { ApplicationStore } from '@/state';
import { httpErrorToHuman } from '@/api/http';
import { Button } from '@/components/elements/button/index';
import tw from 'twin.macro';
import Label from '@/components/elements/Label';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import { Textarea } from '@/components/elements/Input';
import LumixCard from '@/components/lumix/LumixCard';

interface Values {
    name: string;
    description: string;
}

const RenameServerBox = () => {
    const { isSubmitting } = useFormikContext<Values>();

    return (
        <LumixCard noHover css={tw`relative overflow-hidden`}>
            <SpinnerOverlay visible={isSubmitting} />
            <div css={tw`border-b border-lumix-border/30 bg-black/10 px-4 py-3 sm:px-5`}>
                <h3 css={tw`text-sm font-semibold text-[var(--lumix-text)]`}>Server name & description</h3>
                <p css={tw`mt-0.5 text-xs text-lumix-muted`}>
                    Shown in the sidebar and dashboard. This does not change the hostname of your game or app service.
                </p>
            </div>
            <Form css={tw`mb-0 p-4 sm:p-5`}>
                <Field id={'name'} name={'name'} label={'Server name'} type={'text'} />
                <div css={tw`mt-6`}>
                    <Label>Server description</Label>
                    <FormikFieldWrapper name={'description'}>
                        <FormikField as={Textarea} name={'description'} rows={3} />
                    </FormikFieldWrapper>
                </div>
                <div css={tw`mt-6 flex justify-end`}>
                    <Button type={'submit'}>Save changes</Button>
                </div>
            </Form>
        </LumixCard>
    );
};

export default () => {
    const server = ServerContext.useStoreState((state) => state.server.data!);
    const setServer = ServerContext.useStoreActions((actions) => actions.server.setServer);
    const { addError, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const submit = ({ name, description }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('settings');
        renameServer(server.uuid, name, description)
            .then(() => setServer({ ...server, name, description }))
            .catch((error) => {
                console.error(error);
                addError({ key: 'settings', message: httpErrorToHuman(error) });
            })
            .then(() => setSubmitting(false));
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                name: server.name,
                description: server.description,
            }}
            validationSchema={object().shape({
                name: string().required().min(1),
                description: string().nullable(),
            })}
        >
            <RenameServerBox />
        </Formik>
    );
};
