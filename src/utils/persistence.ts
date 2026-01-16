import { attempt } from './common';

export type StorageKey = 'lastLocation' | 'presetsPosition' | 'settings'; // Add more keys as needed

export const STORAGE_DEFAULT_POSITION_LIST = {
    启德青年运动场: { name: '启德青年运动场', latitude: 22.32409998721, longitude: 114.19406688656, floorLevel: 0 }
} satisfies Record<string, PresetPositionInfo>;

export interface PresetPositionInfo extends Position {
    name: string;
}

interface StorageTypes {
    lastLocation: Position;
    presetsPosition: Record<string, PresetPositionInfo>;
    settings: {
        theme?: 'light' | 'dark' | 'system';
        // Add more settings as needed
    };
}

export class StorageService {
    private static instance: StorageService;

    private constructor() {}

    public static getInstance(): StorageService {
        if (!StorageService.instance) {
            StorageService.instance = new StorageService();
        }

        return StorageService.instance;
    }

    public async get<T extends StorageKey>(key: T): Promise<StorageTypes[T] | null> {
        const [error, result] = await attempt(() => chrome.storage.local.get(key) as Promise<{ [K in T]?: StorageTypes[K] }>);

        if (error) {
            console.error(`Error getting ${key} from storage:`, error);

            return null;
        }

        return result[key] || null;
    }

    public async set<T extends StorageKey>(key: T, value: StorageTypes[T]): Promise<boolean> {
        const [error] = await attempt(() => chrome.storage.local.set({ [key]: value }));

        if (error) {
            console.error(`Error setting ${key} in storage:`, error);

            return false;
        }

        return true;
    }

    // Remove a key from storage
    public async remove(key: StorageKey) {
        const [error] = await attempt(() => chrome.storage.local.remove(key));

        if (error) {
            console.error(`Error removing ${key} from storage:`, error);

            return false;
        }

        return true;
    }

    public async clear() {
        const [error] = await attempt(() => chrome.storage.local.clear());

        if (error) {
            console.error('Error clearing storage:', error);

            return false;
        }

        return true;
    }

    public async getAll(): Promise<Partial<StorageTypes>> {
        const [error, result] = await attempt(() => chrome.storage.local.get(null));

        if (error) {
            console.error('Error getting all storage data:', error);

            return {};
        }

        return result as Partial<StorageTypes>;
    }

    public async initialize(defaults: Partial<StorageTypes>): Promise<void> {
        const [error, data] = await attempt(() => chrome.storage.local.get(null));

        if (error) {
            console.error('Error initializing storage:', error);

            return;
        }

        const updates: Partial<StorageTypes> = {};

        for (const [key, defaultValue] of Object.entries(defaults)) {
            if (!(key in data)) {
                updates[key as keyof StorageTypes] = defaultValue as any;
            }
        }

        if (Object.keys(updates).length > 0) {
            chrome.storage.local.set(updates);
        }
    }
}

// Export a singleton instance
export const storage = StorageService.getInstance();

// Initialize with default values
storage.initialize({
    presetsPosition: STORAGE_DEFAULT_POSITION_LIST,
    settings: {
        theme: 'system'
    }
});

// Helper functions for specific storage operations
export const locationStorage = {
    getLastLocation: () => storage.get('lastLocation'),
    saveLastLocation: (location: StorageTypes['lastLocation']) => storage.set('lastLocation', location),
    clearLastLocation: () => storage.remove('lastLocation')
};

export const presetsStorage = {
    getPresets: () => storage.get('presetsPosition'),
    savePreset: async (id: string, preset: StorageTypes['presetsPosition'][string]) => {
        const presetsPosition = (await storage.get('presetsPosition')) || {};

        return storage.set('presetsPosition', { ...presetsPosition, [id]: preset });
    },
    removePreset: async (id: string) => {
        const presetsPosition = await storage.get('presetsPosition');

        if (presetsPosition && id in presetsPosition) {
            const newPresets = { ...presetsPosition };

            delete newPresets[id];

            return storage.set('presetsPosition', newPresets);
        }

        return false;
    }
};

export const settingsStorage = {
    getSettings: () => storage.get('settings'),
    updateSettings: (updates: Partial<StorageTypes['settings']>) =>
        storage.get('settings').then(current => storage.set('settings', { ...(current || {}), ...updates }))
};
