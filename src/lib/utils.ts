import { twMerge, twJoin, type ClassNameValue } from 'tailwind-merge';

function cn(...inputs: ClassNameValue[]) {
    return twMerge(twJoin(inputs));
}

export { cn };
