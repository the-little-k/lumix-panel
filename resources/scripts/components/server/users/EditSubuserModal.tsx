import React, { useContext, useEffect, useRef } from 'react';
import { Subuser } from '@/state/server/subusers';
import { Form, Formik } from 'formik';
import { array, object, string } from 'yup';
import Field from '@/components/elements/Field';
import { Actions, useStoreActions, useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import createOrUpdateSubuser from '@/api/server/users/createOrUpdateSubuser';
import { ServerContext } from '@/state/server';
import FlashMessageRender from '@/components/FlashMessageRender';
import Can from '@/components/elements/Can';
import { usePermissions } from '@/plugins/usePermissions';
import { useDeepCompareMemo } from '@/plugins/useDeepCompareMemo';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import PermissionTitleBox from '@/components/server/users/PermissionTitleBox';
import asModal from '@/hoc/asModal';
import PermissionRow from '@/components/server/users/PermissionRow';
import ModalContext from '@/context/ModalContext';
import LumixCard from '@/components/lumix/LumixCard';

type Props = {
    subuser?: Subuser;
};

interface Values {
    email: string;
    permissions: string[];
}

const EditSubuserModal = ({ subuser }: Props) => {
    const ref = useRef<HTMLHeadingElement>(null);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const appendSubuser = ServerContext.useStoreActions((actions) => actions.subusers.appendSubuser);
    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes
    );
    const { dismiss, setPropOverrides } = useContext(ModalContext);

    const isRootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const permissions = useStoreState((state) => state.permissions.data);
    const loggedInPermissions = ServerContext.useStoreState((state) => state.server.permissions);
    const [canEditUser] = usePermissions(subuser ? ['user.update'] : ['user.create']);

    const editablePermissions = useDeepCompareMemo(() => {
        const cleaned = Object.keys(permissions).map((key) =>
            Object.keys(permissions[key].keys).map((pkey) => `${key}.${pkey}`)
        );

        const list: string[] = ([] as string[]).concat.apply([], Object.values(cleaned));

        if (isRootAdmin || (loggedInPermissions.length === 1 && loggedInPermissions[0] === '*')) {
            return list;
        }

        return list.filter((key) => loggedInPermissions.indexOf(key) >= 0);
    }, [isRootAdmin, permissions, loggedInPermissions]);

    const submit = (values: Values) => {
        setPropOverrides({ showSpinnerOverlay: true });
        clearFlashes('user:edit');

        createOrUpdateSubuser(uuid, values, subuser)
            .then((subuser) => {
                appendSubuser(subuser);
                dismiss();
            })
            .catch((error) => {
                console.error(error);
                setPropOverrides(null);
                clearAndAddHttpError({ key: 'user:edit', error });

                if (ref.current) {
                    ref.current.scrollIntoView();
                }
            });
    };

    useEffect(
        () => () => {
            clearFlashes('user:edit');
        },
        []
    );

    return (
        <Formik
            onSubmit={submit}
            initialValues={
                {
                    email: subuser?.email || '',
                    permissions: subuser?.permissions || [],
                } as Values
            }
            validationSchema={object().shape({
                email: string()
                    .max(191, 'Email addresses must not exceed 191 characters.')
                    .email('A valid email address must be provided.')
                    .required('A valid email address must be provided.'),
                permissions: array().of(string()),
            })}
        >
            <Form css={tw`m-0`}>
                <div css={tw`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between`}>
                    <div css={tw`min-w-0`}>
                        <h2
                            css={tw`text-xl font-semibold tracking-tight text-[var(--lumix-text)]`}
                            ref={ref}
                        >
                            {subuser
                                ? `${canEditUser ? 'Edit' : 'View'} subuser`
                                : 'Invite subuser'}
                        </h2>
                        <p css={tw`mt-1 text-sm text-lumix-muted`}>
                            {subuser
                                ? subuser.email
                                : 'Send an invitation by email. They will only see this server with the permissions you choose.'}
                        </p>
                    </div>
                    <Can action={subuser ? 'user.update' : 'user.create'}>
                        <Button type={'submit'} className={'w-full shrink-0 sm:w-auto'}>
                            {subuser ? 'Save changes' : 'Invite user'}
                        </Button>
                    </Can>
                </div>
                <FlashMessageRender byKey={'user:edit'} className={'mt-4'} />
                {!isRootAdmin && loggedInPermissions[0] !== '*' && (
                    <div
                        css={tw`mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] px-4 py-3`}
                    >
                        <p css={tw`text-sm leading-relaxed text-lumix-muted`}>
                            Only permissions your account already has can be granted when creating or editing subusers.
                        </p>
                    </div>
                )}
                {!subuser && (
                    <LumixCard noHover css={tw`mt-6 overflow-hidden`}>
                        <div css={tw`border-b border-lumix-border/30 bg-black/10 px-4 py-3 sm:px-5`}>
                            <h3 css={tw`text-sm font-semibold text-[var(--lumix-text)]`}>Invitee</h3>
                        </div>
                        <div css={tw`p-4 sm:p-5`}>
                            <Field
                                name={'email'}
                                label={'Email address'}
                                description={'Must match the account they use (or will use) on this panel.'}
                            />
                        </div>
                    </LumixCard>
                )}
                <div css={tw`mt-6 space-y-4`}>
                    {Object.keys(permissions)
                        .filter((key) => key !== 'websocket')
                        .map((key) => (
                            <PermissionTitleBox
                                key={`permission_${key}`}
                                title={key}
                                isEditable={canEditUser}
                                permissions={Object.keys(permissions[key].keys).map((pkey) => `${key}.${pkey}`)}
                            >
                                <p css={tw`mb-4 text-sm leading-relaxed text-lumix-muted`}>
                                    {permissions[key].description}
                                </p>
                                {Object.keys(permissions[key].keys).map((pkey) => (
                                    <PermissionRow
                                        key={`permission_${key}.${pkey}`}
                                        permission={`${key}.${pkey}`}
                                        disabled={!canEditUser || editablePermissions.indexOf(`${key}.${pkey}`) < 0}
                                    />
                                ))}
                            </PermissionTitleBox>
                        ))}
                </div>
                <Can action={subuser ? 'user.update' : 'user.create'}>
                    <div css={tw`flex justify-end pb-2 pt-6`}>
                        <Button type={'submit'} className={'w-full sm:w-auto'}>
                            {subuser ? 'Save changes' : 'Invite user'}
                        </Button>
                    </div>
                </Can>
            </Form>
        </Formik>
    );
};

export default asModal<Props>({
    top: false,
})(EditSubuserModal);
