declare global {
    interface Window {
        /**
         * [Android Only]
         * 原生 App 注入的全局对象，用于桥接定位
         */
        supGeolocation?: {
            setLocation: (lat: number, lng: number, ordinal: number) => void;
        };

        /**
         * [Web Only]
         * 我们插件注入的 Mock 控制器，用于操作被劫持的 navigator.geolocation
         */
        _Geolocation?: {
            use: () => void;
            change: (params: Position) => void;
            restore: () => void;
        };
    }

    interface Position {
        latitude: number;
        longitude: number;
        floorLevel?: number;
    }
}

export {};
