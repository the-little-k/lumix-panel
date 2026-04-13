import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase, faEye, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Modal from '@/components/elements/Modal';
import { Form, Formik, FormikHelpers } from 'formik';
import Field from '@/components/elements/Field';
import { object, string } from 'yup';
import FlashMessageRender from '@/components/FlashMessageRender';
import { ServerContext } from '@/state/server';
import deleteServerDatabase from '@/api/server/databases/deleteServerDatabase';
import { httpErrorToHuman } from '@/api/http';
import RotatePasswordButton from '@/components/server/databases/RotatePasswordButton';
import Can from '@/components/elements/Can';
import { ServerDatabase } from '@/api/server/databases/getServerDatabases';
import useFlash from '@/plugins/useFlash';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import Label from '@/components/elements/Label';
import Input from '@/components/elements/Input';
import CopyOnClick from '@/components/elements/CopyOnClick';
import LumixCard from '@/components/lumix/LumixCard';
import LumixMetaItem from '@/components/lumix/LumixMetaItem';
import { Button as LumixButton } from '@/components/elements/button/index';

interface Props {
    database: ServerDatabase;
    className?: string;
}

export default ({ database, className }: Props) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { addError, clearFlashes } = useFlash();
    const [visible, setVisible] = useState(false);
    const [connectionVisible, setConnectionVisible] = useState(false);

    const appendDatabase = ServerContext.useStoreActions((actions) => actions.databases.appendDatabase);
    const removeDatabase = ServerContext.useStoreActions((actions) => actions.databases.removeDatabase);

    const jdbcConnectionString = `jdbc:mysql://${database.username}${
        database.password ? `:${encodeURIComponent(database.password)}` : ''
    }@${database.connectionString}/${database.name}`;

    const schema = object().shape({
        confirm: string()
            .required('The database name must be provided.')
            .oneOf([database.name.split('_', 2)[1], database.name], 'The database name must be provided.'),
    });

    const submit = (values: { confirm: string }, { setSubmitting }: FormikHelpers<{ confirm: string }>) => {
        clearFlashes();
        deleteServerDatabase(uuid, database.id)
            .then(() => {
                setVisible(false);
                setTimeout(() => removeDatabase(database.id), 150);
            })
            .catch((error) => {
                console.error(error);
                setSubmitting(false);
                addError({ key: 'database:delete', message: httpErrorToHuman(error) });
            });
    };

    return (
        <>
            <Formik onSubmit={submit} initialValues={{ confirm: '' }} validationSchema={schema} isInitialValid={false}>
                {({ isSubmitting, isValid, resetForm }) => (
                    <Modal
                        visible={visible}
                        dismissable={!isSubmitting}
                        showSpinnerOverlay={isSubmitting}
                        onDismissed={() => {
                            setVisible(false);
                            resetForm();
                        }}
                    >
                        <FlashMessageRender byKey={'database:delete'} css={tw`mb-6`} />
                        <h2 css={tw`mb-2 text-2xl font-semibold text-[var(--lumix-text)]`}>Delete database</h2>
                        <p css={tw`text-sm text-lumix-muted`}>
                            This permanently deletes <strong css={tw`text-[var(--lumix-text)]`}>{database.name}</strong>{' '}
                            and all data. This cannot be undone.
                        </p>
                        <Form css={tw`m-0 mt-6`}>
                            <Field
                                type={'text'}
                                id={'confirm_name'}
                                name={'confirm'}
                                label={'Confirm database name'}
                                description={'Type the database name to confirm.'}
                            />
                            <div css={tw`mt-6 flex flex-wrap justify-end gap-2`}>
                                <Button type={'button'} isSecondary onClick={() => setVisible(false)}>
                                    Cancel
                                </Button>
                                <Button type={'submit'} color={'red'} disabled={!isValid}>
                                    Delete
                                </Button>
                            </div>
                        </Form>
                    </Modal>
                )}
            </Formik>
            <Modal visible={connectionVisible} onDismissed={() => setConnectionVisible(false)}>
                <FlashMessageRender byKey={'database-connection-modal'} css={tw`mb-6`} />
                <h3 css={tw`mb-6 text-xl font-semibold text-[var(--lumix-text)]`}>Connection details</h3>
                <div css={tw`space-y-4`}>
                    <div>
                        <Label>Endpoint</Label>
                        <CopyOnClick text={database.connectionString}>
                            <Input type={'text'} readOnly value={database.connectionString} />
                        </CopyOnClick>
                    </div>
                    <div>
                        <Label>Connections from</Label>
                        <Input type={'text'} readOnly value={database.allowConnectionsFrom} />
                    </div>
                    <div>
                        <Label>Username</Label>
                        <CopyOnClick text={database.username}>
                            <Input type={'text'} readOnly value={database.username} />
                        </CopyOnClick>
                    </div>
                    <Can action={'database.view_password'}>
                        <div>
                            <Label>Password</Label>
                            <CopyOnClick text={database.password} showInNotification={false}>
                                <Input type={'text'} readOnly value={database.password} />
                            </CopyOnClick>
                        </div>
                    </Can>
                    <div>
                        <Label>JDBC connection string</Label>
                        <CopyOnClick text={jdbcConnectionString} showInNotification={false}>
                            <Input type={'text'} readOnly value={jdbcConnectionString} />
                        </CopyOnClick>
                    </div>
                </div>
                <div css={tw`mt-8 flex flex-wrap justify-end gap-2 border-t border-neutral-600 pt-6`}>
                    <Can action={'database.update'}>
                        <RotatePasswordButton databaseId={database.id} onUpdate={appendDatabase} />
                    </Can>
                    <Button isSecondary onClick={() => setConnectionVisible(false)}>
                        Close
                    </Button>
                </div>
            </Modal>
            <LumixCard noHover className={className} css={tw`p-4 sm:p-5`}>
                <div css={tw`flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between`}>
                    <div css={tw`flex min-w-0 flex-1 gap-4`}>
                        <div
                            css={tw`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-200 ring-1 ring-indigo-400/20`}
                        >
                            <FontAwesomeIcon icon={faDatabase} className={'text-lg'} />
                        </div>
                        <div css={tw`min-w-0 flex-1`}>
                            <CopyOnClick text={database.name}>
                                <p css={tw`truncate text-lg font-semibold text-[var(--lumix-text)]`}>{database.name}</p>
                            </CopyOnClick>
                            <p css={tw`mt-1 text-xs text-lumix-muted`}>MySQL database</p>
                            <div
                                css={tw`mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3`}
                            >
                                <LumixMetaItem label={'Endpoint'}>
                                    <CopyOnClick text={database.connectionString}>
                                        <span css={tw`font-mono text-xs`}>{database.connectionString}</span>
                                    </CopyOnClick>
                                </LumixMetaItem>
                                <LumixMetaItem label={'Connections from'}>
                                    <span css={tw`font-mono text-xs`}>{database.allowConnectionsFrom}</span>
                                </LumixMetaItem>
                                <LumixMetaItem label={'Username'}>
                                    <CopyOnClick text={database.username}>
                                        <span css={tw`font-mono text-xs`}>{database.username}</span>
                                    </CopyOnClick>
                                </LumixMetaItem>
                            </div>
                        </div>
                    </div>
                    <div css={tw`flex shrink-0 flex-wrap items-center gap-2 border-t border-lumix-border/30 pt-4 lg:border-0 lg:pt-0`}>
                        <LumixButton.Text
                            size={LumixButton.Sizes.Small}
                            onClick={() => setConnectionVisible(true)}
                            className={'inline-flex items-center gap-2'}
                        >
                            <FontAwesomeIcon icon={faEye} />
                            Details
                        </LumixButton.Text>
                        <Can action={'database.delete'}>
                            <LumixButton.Danger
                                size={LumixButton.Sizes.Small}
                                onClick={() => setVisible(true)}
                                className={'inline-flex items-center gap-2'}
                            >
                                <FontAwesomeIcon icon={faTrashAlt} />
                                Delete
                            </LumixButton.Danger>
                        </Can>
                    </div>
                </div>
            </LumixCard>
        </>
    );
};
