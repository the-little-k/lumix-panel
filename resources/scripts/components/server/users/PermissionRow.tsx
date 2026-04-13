import styled from 'styled-components/macro';
import tw from 'twin.macro';
import Checkbox from '@/components/elements/Checkbox';
import React from 'react';
import { useStoreState } from 'easy-peasy';
import Label from '@/components/elements/Label';

const Container = styled.label`
    ${tw`flex items-center rounded-xl border border-lumix-border/30 transition-colors duration-75 md:p-2`};
    text-transform: none;

    &:not(.disabled) {
        ${tw`cursor-pointer`};

        &:hover {
            ${tw`border-indigo-500/25 bg-white/[0.04] shadow-sm shadow-indigo-500/5`};
        }
    }

    &:not(:first-of-type) {
        ${tw`mt-3 sm:mt-2`};
    }

    &.disabled {
        ${tw`opacity-50`};

        & input[type='checkbox']:not(:checked) {
            ${tw`border-0`};
        }
    }
`;

interface Props {
    permission: string;
    disabled: boolean;
}

const PermissionRow = ({ permission, disabled }: Props) => {
    const [key, pkey] = permission.split('.', 2);
    const permissions = useStoreState((state) => state.permissions.data);

    return (
        <Container htmlFor={`permission_${permission}`} className={disabled ? 'disabled' : undefined}>
            <div css={tw`p-2`}>
                <Checkbox
                    id={`permission_${permission}`}
                    name={'permissions'}
                    value={permission}
                    css={tw`mr-2 h-5 w-5`}
                    disabled={disabled}
                />
            </div>
            <div css={tw`min-w-0 flex-1`}>
                <Label as={'p'} css={tw`font-medium text-[var(--lumix-text)]`}>
                    {pkey}
                </Label>
                {permissions[key].keys[pkey].length > 0 && (
                    <p css={tw`mt-1 text-xs leading-relaxed text-lumix-muted`}>{permissions[key].keys[pkey]}</p>
                )}
            </div>
        </Container>
    );
};

export default PermissionRow;
