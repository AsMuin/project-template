import { twJoin, twMerge, type ClassNameValue } from 'tailwind-merge';
import { cva } from 'class-variance-authority';

function cn(...inputs: ClassNameValue[]) {
    return twMerge(twJoin(inputs));
}

export { cn, cva };
