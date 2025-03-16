import { Dialog as DialogPrimitive, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface DialogProps<T> {
    open?: T;
    setOpen?: T extends boolean ? (value: boolean) => void : never;
    trigger?: T extends boolean ? never : React.ReactNode;
    title?: string;
    description?: string;
    children: React.ReactNode;
}

function Dialog<T extends boolean | undefined>({ trigger, title, description, open, setOpen, children }: DialogProps<T>) {
    const propsControl = open && setOpen ? { open, onOpenChange: setOpen } : {};

    return (
        <DialogPrimitive {...propsControl}>
            {trigger && <DialogTrigger>{trigger}</DialogTrigger>}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                {children}
            </DialogContent>
        </DialogPrimitive>
    );
}

export default Dialog;
