import React, { useCallback, useEffect, useState } from 'react';
import tw from 'twin.macro';
import VariableBox from '@/components/server/startup/VariableBox';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import getServerStartup from '@/api/swr/getServerStartup';
import Spinner from '@/components/elements/Spinner';
import { ServerError } from '@/components/elements/ScreenBlock';
import { httpErrorToHuman } from '@/api/http';
import { ServerContext } from '@/state/server';
import { useDeepCompareEffect } from '@/plugins/useDeepCompareEffect';
import Select from '@/components/elements/Select';
import isEqual from 'react-fast-compare';
import Input from '@/components/elements/Input';
import setSelectedDockerImage from '@/api/server/setSelectedDockerImage';
import InputSpinner from '@/components/elements/InputSpinner';
import useFlash from '@/plugins/useFlash';
import LumixSectionHeader from '@/components/lumix/LumixSectionHeader';
import LumixCard from '@/components/lumix/LumixCard';

const StartupContainer = () => {
    const [loading, setLoading] = useState(false);
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const variables = ServerContext.useStoreState(
        ({ server }) => ({
            variables: server.data!.variables,
            invocation: server.data!.invocation,
            dockerImage: server.data!.dockerImage,
        }),
        isEqual
    );

    const { data, error, isValidating, mutate } = getServerStartup(uuid, {
        ...variables,
        dockerImages: { [variables.dockerImage]: variables.dockerImage },
    });

    const setServerFromState = ServerContext.useStoreActions((actions) => actions.server.setServerFromState);
    const isCustomImage =
        data &&
        !Object.values(data.dockerImages)
            .map((v) => v.toLowerCase())
            .includes(variables.dockerImage.toLowerCase());

    useEffect(() => {
        // Since we're passing in initial data this will not trigger on mount automatically. We
        // want to always fetch fresh information from the API however when we're loading the startup
        // information.
        mutate();
    }, []);

    useDeepCompareEffect(() => {
        if (!data) return;

        setServerFromState((s) => ({
            ...s,
            invocation: data.invocation,
            variables: data.variables,
        }));
    }, [data]);

    const updateSelectedDockerImage = useCallback(
        (v: React.ChangeEvent<HTMLSelectElement>) => {
            setLoading(true);
            clearFlashes('startup:image');

            const image = v.currentTarget.value;
            setSelectedDockerImage(uuid, image)
                .then(() => setServerFromState((s) => ({ ...s, dockerImage: image })))
                .catch((error) => {
                    console.error(error);
                    clearAndAddHttpError({ key: 'startup:image', error });
                })
                .then(() => setLoading(false));
        },
        [uuid]
    );

    return !data ? (
        !error || (error && isValidating) ? (
            <Spinner centered size={Spinner.Size.LARGE} />
        ) : (
            <ServerError title={'Oops!'} message={httpErrorToHuman(error)} onRetry={() => mutate()} />
        )
    ) : (
        <ServerContentBlock title={'Startup'} showFlashKey={'startup:image'}>
            <LumixSectionHeader
                title={'Startup'}
                description={
                    'The resolved launch command and container image come from your nest egg. Environment variables below map into the running instance.'
                }
            />
            <div css={tw`flex flex-col gap-6 xl:flex-row xl:items-stretch`}>
                <LumixCard noHover css={tw`min-w-0 flex-1 overflow-hidden`}>
                    <div
                        css={tw`border-b border-lumix-border/30 bg-black/10 px-4 py-3 sm:px-5`}
                    >
                        <h3 css={tw`text-sm font-semibold text-[var(--lumix-text)]`}>Startup command</h3>
                        <p css={tw`mt-0.5 text-xs text-lumix-muted`}>
                            Generated from the egg; read-only on this screen.
                        </p>
                    </div>
                    <div css={tw`p-4 sm:p-5`}>
                        <pre
                            css={tw`whitespace-pre-wrap break-words rounded-xl border border-lumix-border/40 bg-black/30 px-4 py-3 font-mono text-sm leading-relaxed text-[var(--lumix-text)]`}
                        >
                            {data.invocation}
                        </pre>
                    </div>
                </LumixCard>
                <LumixCard noHover css={tw`w-full shrink-0 overflow-hidden xl:max-w-sm`}>
                    <div
                        css={tw`border-b border-lumix-border/30 bg-black/10 px-4 py-3 sm:px-5`}
                    >
                        <h3 css={tw`text-sm font-semibold text-[var(--lumix-text)]`}>Docker image</h3>
                        <p css={tw`mt-0.5 text-xs text-lumix-muted`}>
                            The container image Wings uses when starting this server.
                        </p>
                    </div>
                    <div css={tw`p-4 sm:p-5`}>
                        {Object.keys(data.dockerImages).length > 1 && !isCustomImage ? (
                            <>
                                <InputSpinner visible={loading}>
                                    <Select
                                        disabled={Object.keys(data.dockerImages).length < 2}
                                        onChange={updateSelectedDockerImage}
                                        defaultValue={variables.dockerImage}
                                    >
                                        {Object.keys(data.dockerImages).map((key) => (
                                            <option key={data.dockerImages[key]} value={data.dockerImages[key]}>
                                                {key}
                                            </option>
                                        ))}
                                    </Select>
                                </InputSpinner>
                                <p css={tw`mt-3 text-xs leading-relaxed text-lumix-muted`}>
                                    When multiple images are offered for this egg, pick the one that matches your
                                    workload. Changes apply on the next full server start.
                                </p>
                            </>
                        ) : (
                            <>
                                <Input disabled readOnly value={variables.dockerImage} />
                                {isCustomImage && (
                                    <p css={tw`mt-3 text-xs leading-relaxed text-lumix-muted`}>
                                        This {"server's"} Docker image was set by an administrator and cannot be changed
                                        from this panel.
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </LumixCard>
            </div>
            <LumixSectionHeader
                className={'mt-10'}
                title={'Environment variables'}
                description={
                    'Fields defined by the egg appear below. Defaults show as placeholders; your saved values override them. Editable fields save shortly after you finish typing.'
                }
            />
            <div css={tw`grid gap-4 md:grid-cols-2 md:gap-6`}>
                {data.variables.map((variable) => (
                    <VariableBox key={variable.envVariable} variable={variable} />
                ))}
            </div>
        </ServerContentBlock>
    );
};

export default StartupContainer;
