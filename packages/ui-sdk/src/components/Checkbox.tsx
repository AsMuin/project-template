import { BaseCheckbox } from '@/components/ui/Checkbox';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/Field';
import { cn } from '@/lib/utils';
import { useId } from 'react';

interface CheckboxProps extends React.ComponentProps<typeof BaseCheckbox> {
    description?: string;
    label?: string;
}

function Checkbox({ className, label, description, disabled, ...props }: CheckboxProps) {
    const id = useId();

    return (
        <FieldGroup className={cn(className)}>
            <Field orientation="horizontal">
                <BaseCheckbox disabled={disabled} {...props} id={id} />

                <FieldContent>
                    <BaseCheckbox disabled={disabled} className="hidden" {...props} />
                    {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}

                    {description && <FieldDescription>{description}</FieldDescription>}
                </FieldContent>
            </Field>
        </FieldGroup>
    );
}

export default Checkbox;
