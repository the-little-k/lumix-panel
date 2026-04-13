import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faLayerGroup, faMoon, faSignOutAlt, faSun } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Avatar from '@/components/Avatar';
import {
    applyLumixTheme,
    getStoredTheme,
    LumixThemeId,
    setStoredTheme,
} from '@/components/lumix/applyLumixTheme';

const RightNavigation = styled.div`
    & > a,
    & > button,
    & > .navigation-link {
        ${tw`flex items-center h-full no-underline text-lumix-muted px-5 cursor-pointer transition-all duration-150 rounded-lg`};

        &:active,
        &:hover {
            ${tw`text-lumix-accent bg-white/5`};
        }

        &:active,
        &:hover,
        &.active {
            ${tw`text-indigo-200`};
            box-shadow: inset 0 -2px var(--lumix-accent);
        }
    }
`;

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [theme, setTheme] = useState<LumixThemeId>(getStoredTheme);

    useEffect(() => {
        applyLumixTheme(theme);
        setStoredTheme(theme);
    }, [theme]);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    const toggleTheme = () => {
        setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
    };

    return (
        <header
            css={tw`sticky top-0 z-50 w-full border-b border-lumix-border/60 bg-lumix-surface/80 backdrop-blur-xl shadow-lg shadow-black/10`}
        >
            <SpinnerOverlay visible={isLoggingOut} />
            <div css={tw`mx-auto flex h-14 max-w-[1400px] items-center px-3 sm:px-5`}>
                <div id={'logo'} css={tw`flex min-w-0 flex-1`}>
                    <Link
                        to={'/'}
                        css={tw`truncate bg-gradient-to-r from-indigo-200 via-violet-200 to-indigo-300 bg-clip-text font-header text-xl font-semibold text-transparent no-underline transition-opacity hover:opacity-90`}
                    >
                        {name}
                    </Link>
                </div>
                <RightNavigation css={tw`flex h-full items-center justify-center gap-1`}>
                    <SearchContainer />
                    <Tooltip placement={'bottom'} content={'Theme'}>
                        <button type={'button'} onClick={toggleTheme} aria-label={'Toggle theme'}>
                            <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
                        </button>
                    </Tooltip>
                    <Tooltip placement={'bottom'} content={'Dashboard'}>
                        <NavLink to={'/'} exact>
                            <FontAwesomeIcon icon={faLayerGroup} />
                        </NavLink>
                    </Tooltip>
                    {rootAdmin && (
                        <Tooltip placement={'bottom'} content={'Admin'}>
                            <a href={'/admin'} rel={'noreferrer'}>
                                <FontAwesomeIcon icon={faCogs} />
                            </a>
                        </Tooltip>
                    )}
                    <Tooltip placement={'bottom'} content={'Account Settings'}>
                        <NavLink to={'/account'}>
                            <span css={tw`flex h-5 w-5 items-center justify-center`}>
                                <Avatar.User />
                            </span>
                        </NavLink>
                    </Tooltip>
                    <Tooltip placement={'bottom'} content={'Sign Out'}>
                        <button type={'button'} onClick={onTriggerLogout}>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        </button>
                    </Tooltip>
                </RightNavigation>
            </div>
        </header>
    );
};
