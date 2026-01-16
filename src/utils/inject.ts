import { attempt } from './common';

export async function executeInPageContext<T = unknown>(func: (() => T) | ((...args: any[]) => T), ...args: any[]) {
    const [error, tabId] = await attempt(() => getActiveTabId());

    if (error) {
        console.warn('Failed to get active tab:', error);

        return;
    }

    if (tabId) {
        const [injectError, results] = await attempt(() =>
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                world: 'MAIN', // 关键：在主页面上下文中执行
                func: func,
                args: args
            })
        );

        if (injectError) {
            console.error('Injection failed:', injectError);
        } else {
            return results && results[0] ? results[0].result : null;
        }
    } else {
        console.warn('No active tab with ID found');
    }
}

async function getActiveTabId(): Promise<number | null> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    return tab?.id || null;
}
