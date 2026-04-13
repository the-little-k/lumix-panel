import React, { memo, useCallback } from 'react';
import { useField } from 'formik';
import tw from 'twin.macro';
import Input from '@/components/elements/Input';
import isEqual from 'react-fast-compare';
import LumixCard from '@/components/lumix/LumixCard';

interface Props {
    isEditable: boolean;
    title: string;
    permissions: string[];
    className?: string;
}

const PermissionTitleBox: React.FC<Props> = memo(({ isEditable, title, permissions, className, children }) => {
    const [{ value }, , { setValue }] = useField<string[]>('permissions');

    const onCheckboxClicked = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.currentTarget.checked) {
                setValue([...value, ...permissions.filter((p) => !value.includes(p))]);
            } else {
                setValue(value.filter((p) => !permissions.includes(p)));
            }
        },
        [permissions, value]
    );

    return (
        <LumixCard noHover className={className} css={tw`overflow-hidden`}>
            <div
                css={tw`flex items-center gap-3 border-b border-lumix-border/30 bg-black/10 px-4 py-3 sm:px-5`}
            >
                <p css={tw`flex-1 text-sm font-semibold uppercase tracking-wide text-[var(--lumix-text)]`}>
                    {title}
                </p>
                {isEditable && (
                    <Input
                        type={'checkbox'}
                        checked={permissions.every((p) => value.includes(p))}
                        onChange={onCheckboxClicked}
                    />
                )}
            </div>
            <div css={tw`p-4 sm:p-5`}>{children}</div>
        </LumixCard>
    );
}, isEqual);

export default PermissionTitleBox;
