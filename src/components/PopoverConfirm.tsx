import { Popover, PopoverContent, PopoverTrigger, Close, Portal, Arrow } from '@radix-ui/react-popover';
import { Button } from './ui/button';

interface PopoverConfirmProps {
    confirmText?: string;
    // cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    children?: React.ReactNode;
    title?: string;
    trigger?: React.ReactNode;
}

export default function PopoverConfirm({ confirmText, onConfirm, onCancel, children, title, trigger }: PopoverConfirmProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            <Portal>
                <PopoverContent>
                    <div className="realtive flex flex-col gap-2 rounded-lg bg-slate-50 p-4 shadow-[5px_4px_6px_3px_rgba(0,0,0,0.15)]">
                        {title && <h3 className="text-lg font-medium">{title}</h3>}
                        <Close className="PopoverClose absolute right-1.5 top-1 text-slate-500" aria-label="Close" onClick={onCancel}>
                            X
                        </Close>
                        <Arrow className="PopoverArrow" />
                        <div className="my-2">{children}</div>
                        <div className="text-center">
                            {/* <Button variant="link" className="text-slate-800 p-0" onClick={onCancel}>
                                {cancelText || '取消'}
                            </Button> */}
                            <Button variant="destructive" className="w-20 max-w-fit px-3 py-1" onClick={onConfirm}>
                                {confirmText || '确认'}
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Portal>
        </Popover>
    );
}
