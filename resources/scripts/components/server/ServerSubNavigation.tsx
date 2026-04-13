import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import Can from '@/components/elements/Can';
import routes, { ServerRouteDefinition } from '@/routers/routes';
import tw from 'twin.macro';
import styled from 'styled-components/macro';

const NavInner = styled.nav`
    ${tw`-mx-1 flex flex-nowrap items-stretch gap-1 overflow-x-auto py-2`};
    scrollbar-width: thin;

    &::-webkit-scrollbar {
        height: 6px;
    }
    &::-webkit-scrollbar-thumb {
        ${tw`rounded-full bg-lumix-border`};
    }
`;

const linkBase = tw`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium no-underline transition-all duration-150 sm:px-4`;

interface Props {
    to: (path: string, url?: boolean) => string;
    serverInternalId: number | string | undefined;
    rootAdmin: boolean;
}

export default ({ to, serverInternalId, rootAdmin }: Props) => {
    const navRoutes = routes.server.filter((route): route is ServerRouteDefinition & { name: string; icon: NonNullable<ServerRouteDefinition['icon']> } => {
        return !!route.name && !!route.icon;
    });

    return (
        <div css={tw`border-b border-lumix-border/30 bg-lumix-bg/60 backdrop-blur-md`}>
            <div css={tw`mx-auto max-w-[1400px] px-2 sm:px-4`}>
                <NavInner>
                    {navRoutes.map((route) =>
                        route.permission ? (
                            <Can key={route.path} action={route.permission} matchAny>
                                <NavLink
                                    to={to(route.path, true)}
                                    exact={route.exact}
                                    activeClassName={'lumix-server-nav-active'}
                                    css={linkBase}
                                    className={'text-lumix-muted hover:bg-white/5 hover:text-[var(--lumix-text)]'}
                                >
                                    <FontAwesomeIcon icon={route.icon} css={tw`h-4 w-4 opacity-80`} />
                                    <span css={tw`whitespace-nowrap`}>{route.name}</span>
                                </NavLink>
                            </Can>
                        ) : (
                            <NavLink
                                key={route.path}
                                to={to(route.path, true)}
                                exact={route.exact}
                                activeClassName={'lumix-server-nav-active'}
                                css={linkBase}
                                className={'text-lumix-muted hover:bg-white/5 hover:text-[var(--lumix-text)]'}
                            >
                                <FontAwesomeIcon icon={route.icon} css={tw`h-4 w-4 opacity-80`} />
                                <span css={tw`whitespace-nowrap`}>{route.name}</span>
                            </NavLink>
                        )
                    )}
                    {rootAdmin && serverInternalId !== undefined && (
                        // eslint-disable-next-line react/jsx-no-target-blank
                        <a
                            href={`/admin/servers/view/${serverInternalId}`}
                            target={'_blank'}
                            rel={'noreferrer'}
                            css={[linkBase, tw`text-lumix-muted hover:bg-white/5 hover:text-[var(--lumix-text)]`]}
                        >
                            <FontAwesomeIcon icon={faExternalLinkAlt} css={tw`h-4 w-4`} />
                            <span css={tw`whitespace-nowrap`}>Admin</span>
                        </a>
                    )}
                </NavInner>
            </div>
            <style>{`
                .lumix-server-nav-active {
                    color: var(--lumix-text) !important;
                    background: rgba(99, 102, 241, 0.12);
                    box-shadow: inset 0 0 0 1px rgba(129, 140, 248, 0.35), 0 0 20px -6px var(--lumix-glow-soft);
                }
            `}</style>
        </div>
    );
};
