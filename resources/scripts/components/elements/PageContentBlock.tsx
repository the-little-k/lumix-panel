import React, { useEffect } from 'react';
import ContentContainer from '@/components/elements/ContentContainer';
import { CSSTransition } from 'react-transition-group';
import tw from 'twin.macro';
import FlashMessageRender from '@/components/FlashMessageRender';

export interface PageContentBlockProps {
    title?: string;
    className?: string;
    showFlashKey?: string;
}

const PageContentBlock: React.FC<PageContentBlockProps> = ({ title, showFlashKey, className, children }) => {
    useEffect(() => {
        if (title) {
            document.title = `${title} · Lumix Panel`;
        }
    }, [title]);

    return (
        <CSSTransition timeout={150} classNames={'fade'} appear in>
            <>
                <ContentContainer css={tw`my-4 sm:my-10`} className={className}>
                    {showFlashKey && <FlashMessageRender byKey={showFlashKey} className={'mb-4'} />}
                    {children}
                </ContentContainer>
                <ContentContainer css={tw`mb-6`}>
                    <p css={tw`text-center text-xs text-lumix-muted`}>
                        <a
                            rel={'noopener nofollow noreferrer'}
                            href={'https://luminoushost.net'}
                            target={'_blank'}
                            css={tw`font-medium text-lumix-muted no-underline transition-colors hover:text-indigo-300`}
                        >
                            Luminous Hosting
                        </a>
                        <span css={tw`mx-2 opacity-40`}>·</span>
                        Lumix Panel
                        <span css={tw`mx-2 opacity-40`}>·</span>
                        <span css={tw`opacity-80`}>&copy; {new Date().getFullYear()}</span>
                    </p>
                </ContentContainer>
            </>
        </CSSTransition>
    );
};

export default PageContentBlock;
