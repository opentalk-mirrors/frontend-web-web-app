export const supportsProcessor = typeof MediaStreamTrackGenerator !== 'undefined';
export const supportsOffscreenCanvas = typeof OffscreenCanvas !== 'undefined';
export const isFirefoxBrowser = navigator.userAgent.includes('Firefox');
export const isChromiumBasedBrowser = navigator.userAgent.includes('Chrome');
