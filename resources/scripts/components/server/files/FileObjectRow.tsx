import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFile,
    faFileAlt,
    faFileArchive,
    faFileCode,
    faFileImage,
    faFileImport,
    faFileVideo,
    faFolder,
    faMusic,
} from '@fortawesome/free-solid-svg-icons';
import { encodePathSegments } from '@/helpers';
import { differenceInHours, format, formatDistanceToNow } from 'date-fns';
import React, { memo, useMemo } from 'react';
import { FileObject } from '@/api/server/files/loadDirectory';
import FileDropdownMenu from '@/components/server/files/FileDropdownMenu';
import { ServerContext } from '@/state/server';
import { NavLink, useRouteMatch } from 'react-router-dom';
import tw from 'twin.macro';
import isEqual from 'react-fast-compare';
import SelectFileCheckbox from '@/components/server/files/SelectFileCheckbox';
import { usePermissions } from '@/plugins/usePermissions';
import { join } from 'pathe';
import { bytesToString } from '@/lib/formatters';
import styles from './style.module.css';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

function fileIcon(file: FileObject): IconDefinition {
    if (!file.isFile) {
        return faFolder;
    }
    if (file.isSymlink) {
        return faFileImport;
    }
    if (file.isArchiveType()) {
        return faFileArchive;
    }
    if (file.isEditable()) {
        return faFileCode;
    }
    const mt = (file.mimetype || '').toLowerCase();
    const name = file.name.toLowerCase();
    if (mt.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg|ico)$/i.test(name)) {
        return faFileImage;
    }
    if (mt.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(name)) {
        return faFileVideo;
    }
    if (mt.startsWith('audio/') || /\.(mp3|ogg|wav|flac)$/i.test(name)) {
        return faMusic;
    }
    if (mt.includes('text') || /\.(txt|log|md|json|yml|yaml|xml|cfg|ini|toml)$/i.test(name)) {
        return faFileAlt;
    }
    return faFile;
}

const Clickable: React.FC<{ file: FileObject }> = memo(({ file, children }) => {
    const [canRead] = usePermissions(['file.read']);
    const [canReadContents] = usePermissions(['file.read-content']);
    const directory = ServerContext.useStoreState((state) => state.files.directory);

    const match = useRouteMatch();

    return (file.isFile && (!file.isEditable() || !canReadContents)) || (!file.isFile && !canRead) ? (
        <div className={styles.details}>{children}</div>
    ) : (
        <NavLink
            className={styles.details}
            to={`${match.url}${file.isFile ? '/edit' : ''}#${encodePathSegments(join(directory, file.name))}`}
        >
            {children}
        </NavLink>
    );
}, isEqual);

const FileObjectRow = ({ file }: { file: FileObject }) => {
    const icon = useMemo(() => fileIcon(file), [file]);

    return (
        <div
            className={styles.file_row}
            key={file.name}
            onContextMenu={(e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent(`lumix:files:ctx:${file.key}`, { detail: e.clientX }));
            }}
        >
            <SelectFileCheckbox name={file.name} />
            <Clickable file={file}>
                <div
                    css={tw`flex-none pl-2 pr-3 text-lg text-indigo-300/90 transition-colors group-hover:text-indigo-200`}
                >
                    <FontAwesomeIcon icon={icon} fixedWidth />
                </div>
                <div css={tw`min-w-0 flex-1 truncate font-medium`}>{file.name}</div>
                {file.isFile && (
                    <div css={tw`mr-4 hidden w-24 shrink-0 text-right text-xs text-lumix-muted sm:block`}>
                        {bytesToString(file.size)}
                    </div>
                )}
                <div
                    css={tw`mr-3 hidden w-36 shrink-0 text-right text-xs text-lumix-muted md:block`}
                    title={file.modifiedAt.toString()}
                >
                    {Math.abs(differenceInHours(file.modifiedAt, new Date())) > 48
                        ? format(file.modifiedAt, 'MMM do, yyyy h:mma')
                        : formatDistanceToNow(file.modifiedAt, { addSuffix: true })}
                </div>
            </Clickable>
            <FileDropdownMenu file={file} />
        </div>
    );
};

export default memo(FileObjectRow, (prevProps, nextProps) => {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { isArchiveType, isEditable, ...prevFile } = prevProps.file;
    const { isArchiveType: nextIsArchiveType, isEditable: nextIsEditable, ...nextFile } = nextProps.file;
    /* eslint-enable @typescript-eslint/no-unused-vars */

    return isEqual(prevFile, nextFile);
});
