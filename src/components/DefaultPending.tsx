import { Skeleton } from './ui/skeleton';

export default function DefaultPending() {
    return (
        <div className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-4" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        </div>
    );
}
