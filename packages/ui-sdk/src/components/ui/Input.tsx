import { cn, cva } from '@/lib/utils';

const inputVariants = cva(
    'border-input bg-input/30 placeholder:text-muted-foreground aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 flex h-9 w-full min-w-0 rounded-4xl border px-3 transition-colors disabled:opacity-50 aria-invalid:ring-2 md:text-sm',
    {
        variants: {
            variant: {
                input: 'focus-visible:border-ring focus-visible:ring-ring/50 outline-none focus-visible:ring-1 py-1 text-base file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
                wrapper: 'items-center gap-2 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-1'
            }
        },
        defaultVariants: {
            variant: 'input'
        }
    }
);

interface BaseInputProps extends React.ComponentProps<'input'> {
    startContent?: React.ReactNode;
    endContent?: React.ReactNode;
}

function BaseInput({ className, type, startContent, endContent, ...props }: BaseInputProps) {
    const hasAddon = !!(startContent || endContent);

    if (!hasAddon) {
        return <input type={type} data-slot="input" className={cn(inputVariants({ variant: 'input' }), className)} {...props} />;
    }

    return (
        <div data-slot="input-wrapper" className={cn(inputVariants({ variant: 'wrapper' }), className)} aria-invalid={props['aria-invalid']}>
            {startContent && <div className="text-muted-foreground flex shrink-0 items-center justify-center [&_svg]:size-4">{startContent}</div>}
            <input
                type={type}
                data-slot="input"
                className={cn(
                    'placeholder:text-muted-foreground h-full w-full min-w-0 bg-transparent py-1 text-base outline-none disabled:pointer-events-none disabled:cursor-not-allowed md:text-sm'
                )}
                {...props}
            />
            {endContent && <div className="text-muted-foreground flex shrink-0 items-center justify-center [&_svg]:size-4">{endContent}</div>}
        </div>
    );
}

export { BaseInput };
