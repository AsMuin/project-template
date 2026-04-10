import { Tooltip as TooltipRoot, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';

interface TooltipsProps extends React.ComponentPropsWithRef<'div'> {
    toolTipContent: React.ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
}

function Tooltip({ toolTipContent, side = 'top', ...props }: TooltipsProps) {
    return (
        <TooltipRoot {...props}>
            <TooltipTrigger asChild>{props.children}</TooltipTrigger>
            <TooltipContent side={side}>{toolTipContent}</TooltipContent>
        </TooltipRoot>
    );
}

Tooltip.TooltipProvider = TooltipProvider;

export default Tooltip;
