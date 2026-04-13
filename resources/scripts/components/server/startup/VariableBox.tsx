import React, { memo, useState } from 'react';
import { ServerEggVariable } from '@/api/server/types';
import { usePermissions } from '@/plugins/usePermissions';
import InputSpinner from '@/components/elements/InputSpinner';
import Input from '@/components/elements/Input';
import Switch from '@/components/elements/Switch';
import { debounce } from 'debounce';
import updateStartupVariable from '@/api/server/updateStartupVariable';
import useFlash from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import getServerStartup from '@/api/swr/getServerStartup';
import Select from '@/components/elements/Select';
import isEqual from 'react-fast-compare';
import { ServerContext } from '@/state/server';
import LumixCard from '@/components/lumix/LumixCard';
import LumixStatusBadge from '@/components/lumix/LumixStatusBadge';
import tw from 'twin.macro';

interface Props {
    variable: ServerEggVariable;
}

const VariableBox = ({ variable }: Props) => {
    const FLASH_KEY = `server:startup:${variable.envVariable}`;

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const [loading, setLoading] = useState(false);
    const [canEdit] = usePermissions(['startup.update']);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { mutate } = getServerStartup(uuid);

    const setVariableValue = debounce((value: string) => {
        setLoading(true);
        clearFlashes(FLASH_KEY);

        updateStartupVariable(uuid, variable.envVariable, value)
            .then(([response, invocation]) =>
                mutate(
                    (data) => ({
                        ...data,
                        invocation,
                        variables: (data.variables || []).map((v) =>
                            v.envVariable === response.envVariable ? response : v
                        ),
                    }),
                    false
                )
            )
            .catch((error) => {
                console.error(error);
                clearAndAddHttpError({ error, key: FLASH_KEY });
            })
            .then(() => setLoading(false));
    }, 500);

    const useSwitch = variable.rules.some(
        (v) => v === 'boolean' || v === 'in:0,1' || v === 'in:1,0' || v === 'in:true,false' || v === 'in:false,true'
    );
    const isStringSwitch = variable.rules.some((v) => v === 'string');
    const selectValues = variable.rules.find((v) => v.startsWith('in:'))?.split(',') || [];

    return (
        <LumixCard noHover css={tw`overflow-hidden`}>
            <div css={tw`border-b border-lumix-border/30 bg-black/10 px-4 py-3 sm:px-5`}>
                <div css={tw`flex flex-wrap items-center gap-2`}>
                    <h3 css={tw`text-sm font-semibold text-[var(--lumix-text)]`}>{variable.name}</h3>
                    {!variable.isEditable && <LumixStatusBadge tone={'neutral'}>Read only</LumixStatusBadge>}
                </div>
                <p css={tw`mt-1 font-mono text-2xs text-lumix-muted`}>{variable.envVariable}</p>
            </div>
            <div css={tw`p-4 sm:p-5`}>
                <FlashMessageRender byKey={FLASH_KEY} className={'mb-4'} />
                <InputSpinner visible={loading}>
                    {useSwitch ? (
                        <Switch
                            readOnly={!canEdit || !variable.isEditable}
                            name={variable.envVariable}
                            defaultChecked={
                                isStringSwitch ? variable.serverValue === 'true' : variable.serverValue === '1'
                            }
                            onChange={() => {
                                if (canEdit && variable.isEditable) {
                                    if (isStringSwitch) {
                                        setVariableValue(variable.serverValue === 'true' ? 'false' : 'true');
                                    } else {
                                        setVariableValue(variable.serverValue === '1' ? '0' : '1');
                                    }
                                }
                            }}
                        />
                    ) : selectValues.length > 0 ? (
                        <Select
                            onChange={(e) => setVariableValue(e.target.value)}
                            name={variable.envVariable}
                            defaultValue={variable.serverValue ?? variable.defaultValue}
                            disabled={!canEdit || !variable.isEditable}
                        >
                            {selectValues.map((selectValue) => (
                                <option key={selectValue.replace('in:', '')} value={selectValue.replace('in:', '')}>
                                    {selectValue.replace('in:', '')}
                                </option>
                            ))}
                        </Select>
                    ) : (
                        <Input
                            onKeyUp={(e) => {
                                if (canEdit && variable.isEditable) {
                                    setVariableValue(e.currentTarget.value);
                                }
                            }}
                            readOnly={!canEdit || !variable.isEditable}
                            name={variable.envVariable}
                            defaultValue={variable.serverValue ?? ''}
                            placeholder={variable.defaultValue}
                        />
                    )}
                </InputSpinner>
                {variable.description && (
                    <p css={tw`mt-3 text-xs leading-relaxed text-lumix-muted`}>{variable.description}</p>
                )}
            </div>
        </LumixCard>
    );
};

export default memo(VariableBox, isEqual);
