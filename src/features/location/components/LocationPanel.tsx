import { useState, useEffect } from 'react';
import { locationStorage, STORAGE_DEFAULT_POSITION_LIST, type PresetPositionInfo } from '@/utils/persistence';
import { attempt } from '@/utils/common';
import { updatePosition } from '@/features/location/script';
import { Button } from '@/components/Button';

export default function LocationPanel() {
    const [form, setForm] = useState<Position>({ latitude: 0, longitude: 0, floorLevel: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadLastLocation = async () => {
            const result = await locationStorage.getLastLocation();

            if (result) {
                setForm({
                    latitude: result.latitude,
                    longitude: result.longitude,
                    floorLevel: result.floorLevel ?? 0
                });
            }

            setIsLoading(false);
        };

        loadLastLocation();
    }, []);

    const handleApply = async () => {
        setError(null);
        // const lat = parseFloat(form.lat);
        // const lng = parseFloat(form.lng);
        // const ordinal = Number(form.ordinal);
        const { latitude, longitude, floorLevel = 0 } = form;

        if (isNaN(latitude) || isNaN(longitude) || isNaN(floorLevel)) {
            setError('请填写有效的坐标和楼层');

            return;
        }

        // Save to storage
        await locationStorage.saveLastLocation({ latitude, longitude, floorLevel });

        // Execute in page context
        const [error] = await attempt(() => updatePosition({ latitude, longitude, floorLevel }));

        if (error) {
            setError(error.message || '定位发射失败');
        } else {
            alert('定位发射成功');
        }
    };

    function handlePresetSelect(preset: PresetPositionInfo) {
        setForm({
            latitude: preset.latitude,
            longitude: preset.longitude,
            floorLevel: preset.floorLevel ?? 0
        });
    }

    if (isLoading) {
        return <div className="text-muted-foreground p-4 text-center">加载中...</div>;
    }

    return (
        <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-2">
                {Object.entries(STORAGE_DEFAULT_POSITION_LIST).map(([key, preset]) => (
                    <Button
                        key={key}
                        onClick={() => handlePresetSelect(preset)}
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md px-3 py-2 text-sm transition-colors">
                        {preset.name}
                    </Button>
                ))}
            </div>

            <div className="space-y-3">
                <div>
                    <label className="mb-1 block text-sm font-medium">纬度 (Latitude)</label>
                    <input
                        type="number"
                        step="any"
                        value={form.latitude}
                        onChange={e => setForm({ ...form, latitude: Number(e.target.value) })}
                        className="bg-background text-foreground w-full rounded-md border p-2"
                        placeholder="例如: 22.33539"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">经度 (Longitude)</label>
                    <input
                        type="number"
                        step="any"
                        value={form.longitude}
                        onChange={e => setForm({ ...form, longitude: Number(e.target.value) })}
                        className="bg-background text-foreground w-full rounded-md border p-2"
                        placeholder="例如: 114.17387"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">楼层 (Floor)</label>
                    <input
                        type="number"
                        value={form.floorLevel}
                        onChange={e => setForm({ ...form, floorLevel: Number(e.target.value) })}
                        className="bg-background text-foreground w-full rounded-md border p-2"
                        placeholder="例如: 0"
                    />
                </div>

                {error && <div className="text-destructive bg-destructive/10 rounded-md p-2 text-sm">{error}</div>}

                <Button onClick={handleApply} disabled={!form.latitude || !form.longitude}>
                    发射定位 (Set Location)
                </Button>
            </div>
        </div>
    );
}
