import useOnMounted from '@/hooks/lifecycle/useOnMounted';
import { getAlbumList } from '@/service/api/demo';
import { createFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';
import useSWR from 'swr';

export const Route = createFileRoute('/')({
    component: Demo
});

function Demo() {
    const { data } = useSWR([{ pageIndex: 1, pageSize: 10 }, 'demo'], ([{ pageIndex, pageSize }]) => getAlbumList({ pageIndex, pageSize }));
    useOnMounted(() => {
        setTimeout(() => {
            toast('Hello AsMuin');
        }, 2000);
    });

    return (
        <div className="grid min-h-screen place-content-center bg-slate-200 text-center text-3xl text-sky-400">
            <div className="flex flex-col gap-8">
                <p className="drop-shadow-md duration-300 hover:scale-125 hover:text-purple-400">🎉🎉Hello AsMuin🎉🎉</p>
                <p className="drop-shadow-md duration-300 hover:scale-125 hover:text-purple-400">There is React Project Template</p>
            </div>
        </div>
    );
}
