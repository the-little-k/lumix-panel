import React from 'react';
import classNames from 'classnames';
import LumixCode from '@/components/lumix/LumixCode';

interface CodeProps {
    dark?: boolean | undefined;
    className?: string;
    children: React.ReactChild | React.ReactFragment | React.ReactPortal;
}

export default ({ dark, className, children }: CodeProps) => (
    <LumixCode variant={'inline'} dark={!!dark} className={classNames(className)}>
        {children}
    </LumixCode>
);
