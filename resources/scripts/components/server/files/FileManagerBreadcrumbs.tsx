import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import { NavLink, useLocation } from 'react-router-dom';
import { encodePathSegments, hashToPath } from '@/helpers';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faFolder, faHome } from '@fortawesome/free-solid-svg-icons';

interface Props {
    renderLeft?: JSX.Element;
    withinFileEditor?: boolean;
    isNewFile?: boolean;
}

export default ({ renderLeft, withinFileEditor, isNewFile }: Props) => {
    const [file, setFile] = useState<string | null>(null);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const { hash } = useLocation();

    useEffect(() => {
        const path = hashToPath(hash);

        if (withinFileEditor && !isNewFile) {
            const name = path.split('/').pop() || null;
            setFile(name);
        }
    }, [withinFileEditor, isNewFile, hash]);

    const breadcrumbs = (): { name: string; path?: string }[] =>
        directory
            .split('/')
            .filter((dir) => !!dir)
            .map((dir, index, dirs) => {
                if (!withinFileEditor && index === dirs.length - 1) {
                    return { name: dir };
                }

                return { name: dir, path: `/${dirs.slice(0, index + 1).join('/')}` };
            });

    const crumbClass = tw`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-lumix-muted no-underline transition-colors hover:bg-white/5 hover:text-indigo-200`;

    return (
        <div
            css={tw`flex min-w-0 flex-grow-0 items-center overflow-x-auto rounded-xl border border-lumix-border/40 bg-black/20 px-2 py-2 text-sm backdrop-blur-sm sm:px-3`}
        >
            {renderLeft || <div css={tw`w-10 shrink-0`} />}
            <nav css={tw`flex min-w-0 flex-1 items-center gap-1 text-lumix-muted`} aria-label={'Path'}>
                <FontAwesomeIcon icon={faHome} css={tw`shrink-0 text-xs opacity-60`} />
                <FontAwesomeIcon icon={faChevronRight} css={tw`h-3 w-3 shrink-0 opacity-40`} />
                <span css={tw`shrink-0 text-lumix-muted`}>home</span>
                <FontAwesomeIcon icon={faChevronRight} css={tw`h-3 w-3 shrink-0 opacity-40`} />
                <NavLink to={`/server/${id}/files`} css={crumbClass}>
                    <FontAwesomeIcon icon={faFolder} css={tw`text-indigo-300/80`} />
                    container
                </NavLink>
                {breadcrumbs().map((crumb, index) => (
                    <React.Fragment key={index}>
                        <FontAwesomeIcon icon={faChevronRight} css={tw`h-3 w-3 shrink-0 opacity-40`} />
                        {crumb.path ? (
                            <NavLink to={`/server/${id}/files#${encodePathSegments(crumb.path)}`} css={crumbClass}>
                                {crumb.name}
                            </NavLink>
                        ) : (
                            <span css={tw`truncate px-2 py-1 font-medium text-[var(--lumix-text)]`}>{crumb.name}</span>
                        )}
                    </React.Fragment>
                ))}
                {file && (
                    <>
                        <FontAwesomeIcon icon={faChevronRight} css={tw`h-3 w-3 shrink-0 opacity-40`} />
                        <span css={tw`truncate px-2 py-1 text-indigo-200/90`}>{file}</span>
                    </>
                )}
            </nav>
        </div>
    );
};
