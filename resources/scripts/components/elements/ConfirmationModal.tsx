import React, { useContext } from 'react';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import asModal from '@/hoc/asModal';
import ModalContext from '@/context/ModalContext';

type Props = {
    title: string;
    buttonText: string;
    onConfirmed: () => void;
    showSpinnerOverlay?: boolean;
};

const ConfirmationModal: React.FC<Props> = ({ title, children, buttonText, onConfirmed }) => {
    const { dismiss } = useContext(ModalContext);

    return (
        <>
            <h2 css={tw`text-xl font-semibold tracking-tight text-[var(--lumix-text)]`}>{title}</h2>
            <div css={tw`mt-3 text-sm leading-relaxed text-lumix-muted`}>{children}</div>
            <div css={tw`mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-3`}>
                <Button isSecondary onClick={() => dismiss()} css={tw`w-full border-transparent sm:w-auto`}>
                    Cancel
                </Button>
                <Button color={'red'} css={tw`w-full sm:w-auto`} onClick={() => onConfirmed()}>
                    {buttonText}
                </Button>
            </div>
        </>
    );
};

ConfirmationModal.displayName = 'ConfirmationModal';

export default asModal<Props>((props) => ({
    showSpinnerOverlay: props.showSpinnerOverlay,
}))(ConfirmationModal);
