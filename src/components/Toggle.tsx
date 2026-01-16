import { cn } from '@/utils/common';

interface ToggleProps {
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
}

function Toggle({ enabled, onToggle }: ToggleProps) {
    return (
        <>
            <input
                type="checkbox"
                name="mock-toggle"
                id="mock-toggle"
                className={cn(
                    'toggle-checkbox absolute block h-6 w-6 cursor-pointer appearance-none rounded-full border-4 bg-white transition-transform duration-200 ease-in-out',
                    enabled ? 'right-0 border-yellow-500' : 'left-0 border-gray-200'
                )}
                checked={enabled}
                onChange={e => onToggle(e.target.checked)}
            />
            <label
                htmlFor="mock-toggle"
                className={cn(
                    'toggle-label block h-6 cursor-pointer overflow-hidden rounded-full transition-colors duration-200',
                    enabled ? 'bg-yellow-500' : 'bg-gray-300'
                )}></label>
        </>
    );
}

export default Toggle;
