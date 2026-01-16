import { useState, useEffect, useOptimistic, startTransition } from 'react';
import LocationPanel from './LocationPanel';
import { attempt } from '@/utils/common';
import { getMockStatus, toggleMockEnable } from '../script';
import Toggle from '@/components/Toggle';

export default function MockManager() {
    const [isMockEnabled, setIsMockEnabled] = useState(false);
    const [optimisticEnabled, displayOptimisticEnabled] = useOptimistic<boolean, boolean>(isMockEnabled, (_, newValue) => newValue);

    useEffect(() => {
        const result = attempt(() => getMockStatus());

        result.then(([_, status]) => {
            console.log({
                _,
                status
            });
            setIsMockEnabled(status || false);
        });
    }, []);

    async function handleToggle(enable: boolean) {
        startTransition(async () => {
            displayOptimisticEnabled(enable);

            const [error, newValue] = await attempt(() => toggleMockEnable(enable));

            if (error) {
                console.error('Failed to toggle mock:', error);
            } else {
                startTransition(() => {
                    setIsMockEnabled(newValue || false);
                });
            }
        });
    }

    return (
        <div className="flex h-full flex-col">
            <div className="px-4 pt-4">
                <MockControl enabled={optimisticEnabled} onToggle={handleToggle} />
            </div>

            {optimisticEnabled ? (
                <LocationPanel />
            ) : (
                <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center p-8 text-center opacity-60">
                    <div className="mb-2 text-4xl">🚫</div>
                    <p className="text-sm">Mock 功能未开启</p>
                    <p className="mt-1 text-xs">请先开启上方开关以进行定位调试</p>
                </div>
            )}
        </div>
    );
}

interface MockControlProps {
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
}

export function MockControl({ enabled, onToggle }: MockControlProps) {
    return (
        <div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <label htmlFor="mock-toggle" className="cursor-pointer text-sm font-semibold text-yellow-800 select-none dark:text-yellow-200">
                        启用 Mock 拦截模式
                    </label>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        {enabled ? 'Mock 已开启，原生定位已被劫持' : 'Mock 已关闭，使用原生定位'}
                    </p>
                </div>

                <div className="relative w-12 align-middle transition duration-200 ease-in select-none">
                    <Toggle enabled={enabled} onToggle={onToggle} />
                </div>
            </div>

            {enabled && (
                <div className="mt-2 border-t border-yellow-200/50 pt-2 text-xs text-yellow-700/80 dark:text-yellow-300/80">
                    ⚠️ 切换开关会刷新页面以生效/还原
                </div>
            )}
        </div>
    );
}
