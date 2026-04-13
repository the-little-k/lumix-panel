import React from 'react';
import Icon from '@/components/elements/Icon';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import styles from './style.module.css';
import useFitText from 'use-fit-text';
import CopyOnClick from '@/components/elements/CopyOnClick';

interface StatBlockProps {
    title: string;
    copyOnClick?: string;
    color?: string | undefined;
    icon: IconDefinition;
    children: React.ReactNode;
    className?: string;
}

export default ({ title, copyOnClick, icon, color, className, children }: StatBlockProps) => {
    const { fontSize, ref } = useFitText({ minFontSize: 8, maxFontSize: 500 });

    return (
        <CopyOnClick text={copyOnClick}>
            <div
                className={classNames(
                    styles.stat_block,
                    'border border-lumix-border/40 bg-lumix-surface/50 shadow-lg shadow-black/10 backdrop-blur-sm',
                    className
                )}
            >
                <div className={classNames(styles.status_bar, color || 'bg-slate-700')} />
                <div className={classNames(styles.icon, color || 'bg-indigo-500/20 ring-1 ring-indigo-400/25')}>
                    <Icon
                        icon={icon}
                        className={classNames({
                            'text-indigo-100': !color || color === 'bg-slate-700',
                            'text-gray-50': color && color !== 'bg-slate-700',
                        })}
                    />
                </div>
                <div className={'flex w-full flex-col justify-center overflow-hidden'}>
                    <p className={'font-header text-xs font-medium leading-tight text-lumix-muted md:text-sm'}>{title}</p>
                    <div
                        ref={ref}
                        className={'h-[1.75rem] w-full truncate font-semibold text-[var(--lumix-text)]'}
                        style={{ fontSize }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </CopyOnClick>
    );
};
