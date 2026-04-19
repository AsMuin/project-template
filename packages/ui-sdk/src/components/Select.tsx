import { useId, useMemo } from 'react';
import { Select as SelectPrimitive, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-sdk/components/ui/Select';
import { Field, FieldDescription, FieldError, FieldLabel } from './ui/Field';

interface SelectOption<T> {
    value: T;
    label: string | undefined;
}

type SelectPrimitiveProps = React.ComponentPropsWithRef<typeof SelectPrimitive>;

interface SelectProps<T> extends Omit<SelectPrimitiveProps, 'onValueChange' | 'value' | 'defaultValue'> {
    options: SelectOption<T>[];
    value?: T;
    defaultValue?: T;
    placeholder?: string;
    onSelect?: (value: T, label: string) => void;
    size?: 'sm' | 'default';
    label?: string;
    description?: string;
    error?: string;
    id?: string;
}

function Select<T>({
    options,
    value,
    defaultValue,
    placeholder,
    size = 'default',
    label,
    description,
    error,
    id,
    onSelect,
    ...props
}: SelectProps<T>) {
    const generatedId = useId();
    const selectId = id || generatedId;

    // 建立 value 到 option 的映射，用于快速查找
    const valueMap = useMemo(() => {
        const map = new Map<string, SelectOption<T>>(options.map(option => [serializeValue(option.value), option]));

        return map;
    }, [options]);

    const handleValueChange = (serializedValue: string) => {
        const option = valueMap.get(serializedValue);

        if (option && onSelect) {
            onSelect(option.value, option.label ?? serializedValue);
        }
    };

    const selectedValue = value !== undefined ? serializeValue(value) : undefined;
    const selectedDefaultValue = defaultValue !== undefined ? serializeValue(defaultValue) : undefined;

    return (
        <Field data-invalid={!!error}>
            {label && <FieldLabel htmlFor={selectId}>{label}</FieldLabel>}
            <SelectPrimitive {...props} value={selectedValue} defaultValue={selectedDefaultValue} onValueChange={handleValueChange}>
                <SelectTrigger id={selectId} size={size} aria-invalid={!!error}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent position="popper">
                    {options.map(option => {
                        const serializedKey = serializeValue(option.value);

                        return (
                            <SelectItem key={serializedKey} value={serializedKey}>
                                {option.label ?? serializedKey}
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </SelectPrimitive>
            {description && !error && <FieldDescription>{description}</FieldDescription>}
            {error && <FieldError>{error}</FieldError>}
        </Field>
    );
}

function serializeValue<T>(value: T): string {
    if (typeof value === 'string') {
        return value;
    }

    return JSON.stringify(value);
}

export default Select;
