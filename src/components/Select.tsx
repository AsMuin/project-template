import { Select as SelectPrimitive, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface SelectProps {
    options: { value: string; label: string }[];
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
    placeholder?: string;
}

export default function Select({ options, value, onChange, className, placeholder }: SelectProps) {
    return (
        <SelectPrimitive value={value} onValueChange={onChange}>
            <SelectTrigger className={cn(placeholder && 'min-w-fit', className)}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {options.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </SelectPrimitive>
    );
}
