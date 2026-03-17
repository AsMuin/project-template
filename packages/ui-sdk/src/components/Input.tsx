import { useId } from 'react';
import { Field, FieldDescription, FieldError, FieldLabel } from './ui/Field';
import { BaseInput } from './ui/Input';

interface InputProps extends React.ComponentProps<'input'> {
    label?: string;
    description?: string;
    error?: string;
    startContent?: React.ReactNode;
    endContent?: React.ReactNode;
}

function Input({ label, description, error, id, startContent, endContent, ...props }: InputProps) {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
        <Field data-invalid={!!error}>
            {label && <FieldLabel htmlFor={inputId}>{label}</FieldLabel>}
            <BaseInput id={inputId} aria-invalid={!!error} startContent={startContent} endContent={endContent} {...props} />
            {description && !error && <FieldDescription>{description}</FieldDescription>}
            {error && <FieldError>{error}</FieldError>}
        </Field>
    );
}

export default Input;
