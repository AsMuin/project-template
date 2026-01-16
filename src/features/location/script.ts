import { UA_KEYWORDS, MOCK_STORAGE_KEYS } from '@/constant';
import { executeInPageContext } from '@/utils/inject';

/**
 * 核心：执行位置更新
 */
async function updatePosition(params: Position): Promise<void> {
    await executeInPageContext(
        (latitude: number, longitude: number, floorLevel: number, uaKeyword: typeof UA_KEYWORDS) => {
            const isNative = navigator.userAgent.includes(uaKeyword.ANDROID) || navigator.userAgent.includes(uaKeyword.IOS);

            if (isNative) {
                if (window.supGeolocation && window.supGeolocation.setLocation) {
                    window.supGeolocation.setLocation(latitude, longitude, floorLevel);
                    console.log(`📱 [Native] Bridge invoked: ${latitude}, ${longitude}, floor=${floorLevel}`);
                } else {
                    throw new Error('❌ Native 环境下 window.supGeolocation 未定义，无法发射定位');
                }
            } else {
                // === Web 环境 ===
                // 现在的逻辑：不再尝试注入，而是检查 mock-boot.js 是否已成功初始化
                if (window._Geolocation) {
                    const mockData: Position = {
                        latitude: latitude,
                        longitude: longitude,
                        floorLevel: floorLevel
                    };

                    window._Geolocation.change(mockData);
                } else {
                    throw new Error('❌ Mock 系统未就绪。\n\n' + '请先勾选插件面板上的 "启用 Mock 拦截模式" 并等待页面自动刷新。');
                }
            }
        },
        params.latitude,
        params.longitude,
        params.floorLevel,
        UA_KEYWORDS
    );
}

async function toggleMockEnable(enabled: boolean) {
    const result = await executeInPageContext(
        (enable: boolean, enable_key: string) => {
            if (enable) {
                localStorage.setItem(enable_key, 'true');

                if (confirm('Mock 模式已开启，页面需要刷新以生效。是否立即刷新？')) {
                    window.location.reload();
                }
            } else {
                localStorage.removeItem(enable_key);

                if (window._Geolocation && typeof window._Geolocation.restore === 'function') {
                    window._Geolocation.restore();
                }

                window.location.reload();
            }

            return enable;
        },
        enabled,
        MOCK_STORAGE_KEYS.POS_ENABLED
    );

    return result;
}

async function getMockStatus(): Promise<boolean> {
    const result = await executeInPageContext((key: string) => localStorage.getItem(key) === 'true', MOCK_STORAGE_KEYS.POS_ENABLED);

    return result || false;
}

export { updatePosition, toggleMockEnable, getMockStatus };
