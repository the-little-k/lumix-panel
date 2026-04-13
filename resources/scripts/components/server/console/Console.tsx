import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ITerminalOptions, Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import { SearchBarAddon } from 'xterm-addon-search-bar';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { Unicode11Addon } from 'xterm-addon-unicode11';
import { ScrollDownHelperAddon } from '@/plugins/XtermScrollDownHelperAddon';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { ServerContext } from '@/state/server';
import { usePermissions } from '@/plugins/usePermissions';
import { theme as th } from 'twin.macro';
import useEventListener from '@/plugins/useEventListener';
import { debounce } from 'debounce';
import { usePersistedState } from '@/plugins/usePersistedState';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import classNames from 'classnames';
import { ChevronDoubleRightIcon } from '@heroicons/react/solid';
import { Button } from '@/components/elements/button/index';
import tw from 'twin.macro';

import 'xterm/css/xterm.css';
import styles from './style.module.css';

const BG = '#07080c';
const theme = {
    background: BG,
    cursor: 'transparent',
    black: BG,
    red: '#f87171',
    green: '#4ade80',
    yellow: '#facc15',
    blue: '#60a5fa',
    magenta: '#c084fc',
    cyan: '#22d3ee',
    white: '#e2e8f0',
    brightBlack: 'rgba(148, 163, 184, 0.35)',
    brightRed: '#fca5a5',
    brightGreen: '#86efac',
    brightYellow: '#fde047',
    brightBlue: '#93c5fd',
    brightMagenta: '#d8b4fe',
    brightCyan: '#67e8f9',
    brightWhite: '#f8fafc',
    selection: 'rgba(99, 102, 241, 0.35)',
};

const terminalProps: ITerminalOptions = {
    disableStdin: true,
    cursorStyle: 'underline',
    allowTransparency: true,
    fontSize: 13,
    lineHeight: 1.45,
    fontFamily: th('fontFamily.mono'),
    rows: 32,
    theme: theme,
};

export default () => {
    const TERMINAL_PRELUDE = '\u001b[1m\u001b[33mcontainer@lumix~ \u001b[0m';
    const ref = useRef<HTMLDivElement>(null);
    const terminal = useMemo(() => new Terminal({ ...terminalProps }), []);
    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();
    const searchBar = new SearchBarAddon({ searchAddon });
    const webLinksAddon = new WebLinksAddon();
    const unicode11Addon = new Unicode11Addon();
    const scrollDownHelperAddon = new ScrollDownHelperAddon();
    const { connected, instance } = ServerContext.useStoreState((state) => state.socket);
    const [canSendCommands] = usePermissions(['control.console']);
    const serverId = ServerContext.useStoreState((state) => state.server.data!.id);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data!.isTransferring);
    const [history, setHistory] = usePersistedState<string[]>(`${serverId}:command_history`, []);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [autoScroll, setAutoScroll] = usePersistedState(`${serverId}:console_autoscroll`, true);
    const autoScrollRef = useRef(autoScroll);

    const zIndex = `
    .xterm-search-bar__addon {
        z-index: 10;
    }`;

    useEffect(() => {
        autoScrollRef.current = autoScroll;
    }, [autoScroll]);

    const handleCommandKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
            const newIndex = Math.min(historyIndex + 1, history!.length - 1);

            setHistoryIndex(newIndex);
            e.currentTarget.value = history![newIndex] || '';

            e.preventDefault();
        }

        if (e.key === 'ArrowDown') {
            const newIndex = Math.max(historyIndex - 1, -1);

            setHistoryIndex(newIndex);
            e.currentTarget.value = history![newIndex] || '';
        }

        const command = e.currentTarget.value;
        if (e.key === 'Enter' && command.length > 0) {
            setHistory((prevHistory) => [command, ...prevHistory!].slice(0, 32));
            setHistoryIndex(-1);

            instance && instance.send('send command', command);
            e.currentTarget.value = '';
        }
    };

    useEffect(() => {
        if (connected && ref.current && !terminal.element) {
            terminal.loadAddon(fitAddon);
            terminal.loadAddon(searchAddon);
            terminal.loadAddon(searchBar);
            terminal.loadAddon(webLinksAddon);
            terminal.loadAddon(unicode11Addon);
            terminal.loadAddon(scrollDownHelperAddon);

            terminal.open(ref.current);

            terminal.unicode.activeVersion = '11';

            fitAddon.fit();
            searchBar.addNewStyle(zIndex);

            terminal.attachCustomKeyEventHandler((e: KeyboardEvent) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                    document.execCommand('copy');
                    return false;
                } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                    e.preventDefault();
                    searchBar.show();
                    return false;
                } else if (e.key === 'Escape') {
                    searchBar.hidden();
                }
                return true;
            });
        }
    }, [terminal, connected]);

    useEventListener(
        'resize',
        debounce(() => {
            if (terminal.element) {
                fitAddon.fit();
            }
        }, 100)
    );

    useEffect(() => {
        const scrollIfEnabled = () => {
            if (autoScrollRef.current) {
                requestAnimationFrame(() => terminal.scrollToBottom());
            }
        };

        const handleConsoleOutput = (line: string, prelude = false) => {
            terminal.writeln((prelude ? TERMINAL_PRELUDE : '') + line.replace(/(?:\r\n|\r|\n)$/im, '') + '\u001b[0m');
            scrollIfEnabled();
        };

        const handleTransferStatus = (status: string) => {
            if (status === 'failure') {
                terminal.writeln(TERMINAL_PRELUDE + 'Transfer has failed.\u001b[0m');
                scrollIfEnabled();
            }
        };

        const handleDaemonErrorOutput = (line: string) => {
            terminal.writeln(
                TERMINAL_PRELUDE + '\u001b[1m\u001b[41m' + line.replace(/(?:\r\n|\r|\n)$/im, '') + '\u001b[0m'
            );
            scrollIfEnabled();
        };

        const handlePowerChangeEvent = (state: string) => {
            terminal.writeln(TERMINAL_PRELUDE + 'Server marked as ' + state + '...\u001b[0m');
            scrollIfEnabled();
        };

        const listeners: Record<string, (s: string) => void> = {
            [SocketEvent.STATUS]: handlePowerChangeEvent,
            [SocketEvent.CONSOLE_OUTPUT]: handleConsoleOutput,
            [SocketEvent.INSTALL_OUTPUT]: handleConsoleOutput,
            [SocketEvent.TRANSFER_LOGS]: handleConsoleOutput,
            [SocketEvent.TRANSFER_STATUS]: handleTransferStatus,
            [SocketEvent.DAEMON_MESSAGE]: (line) => handleConsoleOutput(line, true),
            [SocketEvent.DAEMON_ERROR]: handleDaemonErrorOutput,
        };

        if (connected && instance) {
            if (!isTransferring) {
                terminal.clear();
            }

            Object.keys(listeners).forEach((key: string) => {
                instance.addListener(key, listeners[key]);
            });
            instance.send(SocketRequest.SEND_LOGS);
        }

        return () => {
            if (instance) {
                Object.keys(listeners).forEach((key: string) => {
                    instance.removeListener(key, listeners[key]);
                });
            }
        };
    }, [connected, instance, isTransferring, terminal]);

    const onClear = () => {
        terminal.clear();
    };

    return (
        <div className={classNames(styles.terminal, 'flex h-full min-h-[20rem] flex-col')}>
            <div
                className={classNames(
                    styles.console_toolbar,
                    'flex flex-none flex-wrap items-center gap-3 border-b border-white/10 px-3 py-2 sm:px-4'
                )}
            >
                <div css={tw`flex items-center gap-2 text-2xs font-semibold uppercase tracking-wide text-lumix-muted`}>
                    <span
                        className={classNames(
                            'h-2 w-2 rounded-full',
                            connected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-red-400'
                        )}
                    />
                    {connected ? 'Live' : 'Disconnected'}
                </div>
                <div css={tw`flex flex-wrap items-center gap-3 sm:ml-auto`}>
                    <button
                        type={'button'}
                        onClick={() => setAutoScroll(!autoScroll)}
                        css={[
                            tw`rounded-lg px-3 py-1 text-2xs font-semibold uppercase tracking-wide ring-1 transition`,
                            autoScroll
                                ? tw`bg-indigo-500/20 text-indigo-200 ring-indigo-500/40`
                                : tw`bg-white/5 text-lumix-muted ring-lumix-border`,
                        ]}
                    >
                        Auto-scroll: {autoScroll ? 'On' : 'Off'}
                    </button>
                    <Button.Text type={'button'} size={Button.Sizes.Small} onClick={onClear} disabled={!connected}>
                        Clear
                    </Button.Text>
                </div>
            </div>
            <div className={classNames(styles.container, styles.overflows_container, 'relative min-h-0 flex-1')}>
                <SpinnerOverlay visible={!connected} size={'large'} />
                <div className={'h-full min-h-[12rem]'}>
                    <div id={styles.terminal} ref={ref} className={'h-full'} />
                </div>
            </div>
            {canSendCommands && (
                <div className={classNames('relative flex-none', styles.overflows_container)}>
                    <input
                        className={classNames('peer', styles.command_input)}
                        type={'text'}
                        placeholder={'Type a command…'}
                        aria-label={'Console command input.'}
                        disabled={!instance || !connected}
                        onKeyDown={handleCommandKeyDown}
                        autoCorrect={'off'}
                        autoCapitalize={'none'}
                    />
                    <div
                        className={classNames(
                            'text-gray-100 peer-focus:text-gray-50 peer-focus:animate-pulse',
                            styles.command_icon
                        )}
                    >
                        <ChevronDoubleRightIcon className={'h-4 w-4'} />
                    </div>
                </div>
            )}
        </div>
    );
};
