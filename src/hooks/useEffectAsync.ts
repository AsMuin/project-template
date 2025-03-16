import { useEffect } from 'react';

// 异步Effect语法糖
export default function useEffectAsync(effect: (signal: AbortSignal) => Promise<void>, deps: any[]) {
    useEffect(() => {
        const controller = new AbortController();

        effect(controller.signal);

        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}
