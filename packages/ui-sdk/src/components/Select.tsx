import { useId } from 'react';
import { Select as SelectPrimitive, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-sdk/components/ui/Select';
import { Field, FieldDescription, FieldError, FieldLabel } from './ui/Field';

export interface SelectOption {
    value: string;
    label: string | undefined;
}

interface SelectProps {
    value?: string;
    defaultValue?: string;
    options: SelectOption[];
    placeholder?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    size?: 'sm' | 'default';
    className?: string;
    label?: string;
    description?: string;
    error?: string;
}

function Select({
    value,
    defaultValue,
    options,
    placeholder,
    onChange,
    disabled,
    size = 'default',
    className,
    label,
    description,
    error,
    id
}: SelectProps & { id?: string }) {
    const generatedId = useId();
    const selectId = id || generatedId;

    const handleValueChange = (newValue: string) => {
        onChange?.(newValue);
    };

    return (
        <Field data-invalid={!!error}>
            {label && <FieldLabel htmlFor={selectId}>{label}</FieldLabel>}
            <SelectPrimitive value={value} defaultValue={defaultValue} onValueChange={handleValueChange} disabled={disabled}>
                <SelectTrigger id={selectId} size={size} className={className} aria-invalid={!!error}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent position="popper">
                    {options.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label ?? option.value}
                        </SelectItem>
                    ))}
                </SelectContent>
            </SelectPrimitive>
            {description && !error && <FieldDescription>{description}</FieldDescription>}
            {error && <FieldError>{error}</FieldError>}
        </Field>
    );
}

export default Select;
