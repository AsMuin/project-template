import { MOCK_STORAGE_KEYS } from '@/constant';

/**
 * 定义 Mock 需要的数据结构
 */
interface MockState {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
    floorLevel: string | number | null; // 自定义字段
}

/**
 * GeolocationMock 类：封装核心劫持逻辑
 */
class GeolocationMock {
    private originalGeolocation: Geolocation;
    private watchers: Map<number, PositionCallback>;
    private pendingRequests: Set<PositionCallback>;

    // 模拟的内部状态
    private state: MockState = {
        latitude: 19.33539, // 默认值
        longitude: 113.17387,
        accuracy: 50,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        floorLevel: null
    };

    constructor() {
        this.originalGeolocation = navigator.geolocation;
        this.watchers = new Map();
        this.pendingRequests = new Set();
    }

    /**
     * 激活 Mock：劫持 navigator.geolocation
     */
    public use(): GeolocationMock {
        // 核心劫持逻辑
        Object.defineProperty(navigator, 'geolocation', {
            value: {
                getCurrentPosition: this.getCurrentPosition.bind(this),
                watchPosition: this.watchPosition.bind(this),
                clearWatch: this.clearWatch.bind(this)
            },
            configurable: true,
            writable: true
        });
        console.log('[DebugTool] GeolocationMock activated');

        return this;
    }

    /**
     * 还原：恢复原始对象
     */
    public restore(): GeolocationMock {
        if (this.originalGeolocation) {
            Object.defineProperty(navigator, 'geolocation', {
                value: this.originalGeolocation,
                configurable: true,
                writable: true
            });
        }

        this.watchers.clear();
        this.pendingRequests.clear();

        return this;
    }

    /**
     * 更新位置：外部调用入口
     */
    public change(options: Position): GeolocationMock {
        console.log('[DebugTool] Mock change invoked:', options);

        // 1. 更新内部状态
        if (options.latitude !== undefined) {
            this.state.latitude = options.latitude;
        }

        if (options.longitude !== undefined) {
            this.state.longitude = options.longitude;
        }

        if (options.floorLevel !== undefined) {
            this.state.floorLevel = options.floorLevel;
        }

        const position = this.createPosition();

        // 2. 触发所有 Watchers
        this.watchers.forEach(cb => {
            try {
                cb(position);
            } catch (e) {
                console.error('[DebugTool] Error in watch callback', e);
            }
        });

        // 3. 触发所有一次性请求 (getCurrentPosition)
        this.pendingRequests.forEach(cb => {
            try {
                cb(position);
            } catch (e) {
                console.error('[DebugTool] Error in getCurrentPosition callback', e);
            }
        });
        this.pendingRequests.clear();

        return this;
    }

    // --- Mock Implementation ---

    private getCurrentPosition(successCallback: PositionCallback, errorCallback?: PositionErrorCallback, options?: PositionOptions): void {
        // 策略：如果是首次，可能需要等待 change 调用；
        // 或者直接返回当前保存的状态。为了模拟真实感，我们可以延时。
        // 这里为了响应快，直接存入 pending 并在 change 时触发，或者立即触发。

        // 为了兼容旧逻辑（等待 change 触发），我们先存起来，但也可以立即返回当前值
        // 如果想要“立即回显”，取消下面注释：
        // successCallback(this.createPosition());
        this.pendingRequests.add(successCallback);
    }

    private watchPosition(successCallback: PositionCallback, errorCallback?: PositionErrorCallback, options?: PositionOptions): number {
        const id = Math.floor(Math.random() * 100000);

        this.watchers.set(id, successCallback);
        // 首次监听立即发送当前位置
        setTimeout(() => successCallback(this.createPosition()), 0);

        return id;
    }

    private clearWatch(watchId: number): void {
        this.watchers.delete(watchId);
    }

    // --- Helper ---

    private createPosition(): GeolocationPosition {
        const coords: any = {
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            accuracy: this.state.accuracy,
            altitude: this.state.altitude,
            altitudeAccuracy: this.state.altitudeAccuracy,
            heading: this.state.heading,
            speed: this.state.speed,
            floorLevel: this.state.floorLevel // 关键：自定义字段
        };

        return {
            coords: coords as GeolocationCoordinates,
            timestamp: Date.now(),
            toJSON: () => ({ ...coords, timestamp: Date.now() }) // 修复 TS 报错
        } as GeolocationPosition;
    }
}

class UserAgentMock {
    public mock(uaString: string): void {
        try {
            Object.defineProperty(navigator, 'userAgent', {
                get: () => uaString,
                configurable: true
            });

            // 根据 UA 简单修正 platform，防止基础检测穿帮
            let platform = 'Win32';

            if (/iphone|ipad|ipod/i.test(uaString)) {
                platform = 'iPhone';
            } else if (/android/i.test(uaString)) {
                platform = 'Linux armv8l';
            } else if (/mac/i.test(uaString)) {
                platform = 'MacIntel';
            }

            Object.defineProperty(navigator, 'platform', {
                get: () => platform,
                configurable: true
            });

            console.log(`[DebugTool] UA Mocked: ${uaString}`);
        } catch (e) {
            // 忽略错误
        }
    }
}
// ==========================================
// 启动逻辑 (Boot Logic)
// ==========================================

const mockInstance = new GeolocationMock();
const uaMock = new UserAgentMock();

// 暴露给 window 对象，以便 locationExecutor.ts 调用
window._Geolocation = mockInstance;

try {
    const isEnabled = localStorage.getItem(MOCK_STORAGE_KEYS.POS_ENABLED) === 'true';
    const uaString = localStorage.getItem(MOCK_STORAGE_KEYS.UA_STRING);

    if (uaString) {
        uaMock.mock(uaString);
    }

    if (isEnabled) {
        console.log('🚀 [DebugTool] Mock Mode Enabled via LocalStorage');
        mockInstance.use();

        // 尝试恢复上次位置
        const lastPosStr = localStorage.getItem('__MOCK_LAST_POS__');

        if (lastPosStr) {
            const lastPos = JSON.parse(lastPosStr);

            // 延时一下确保页面其他逻辑准备好监听
            setTimeout(() => {
                mockInstance.change(lastPos);
                console.log('📍 [DebugTool] Restored last position:', lastPos);
            }, 100);
        }
    }
} catch (e) {
    console.error('[DebugTool] Failed to boot mock script', e);
}

export {}; // 确保文件被视为模块
