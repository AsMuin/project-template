import { cn } from '@/utils/common';

interface ButtonProps {
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
    onClick: () => void;
}

export function Button({ children, disabled, className, onClick }: ButtonProps) {
    return (
        <button
            disabled={disabled}
            className={cn(
                'bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            onClick={onClick}>
            {children}
        </button>
    );
}
