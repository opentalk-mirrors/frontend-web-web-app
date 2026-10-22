// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import fs from 'node:fs';
import path from 'node:path';

const { appImport, createRoot, render } = vi.hoisted(() => {
  const render = vi.fn();
  return {
    appImport: vi.fn(),
    createRoot: vi.fn(() => ({ render })),
    render,
  };
});

vi.mock('react-dom/client', () => ({ createRoot }));
vi.mock('context-filter-polyfill', () => ({}));
vi.mock('./App', () => {
  appImport(window.EXCALIDRAW_ASSET_PATH);
  return { default: () => null };
});
vi.mock('./banner', () => ({}));
vi.mock('./devTools', () => ({ exposeDevTools: vi.fn() }));
vi.mock('./glitchtip', () => ({}));
vi.mock('./i18n', () => ({}));
vi.mock('./pages/SplashScreenPage', () => ({ default: () => null }));
vi.mock('./reportWebVitals', () => ({ default: vi.fn() }));

describe('Excalidraw asset initialization during application startup', () => {
  const originalAssetPath = window.EXCALIDRAW_ASSET_PATH;
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete window.EXCALIDRAW_ASSET_PATH;
    container = document.createElement('div');
    container.id = 'root';
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    if (originalAssetPath === undefined) {
      delete window.EXCALIDRAW_ASSET_PATH;
    } else {
      window.EXCALIDRAW_ASSET_PATH = originalAssetPath;
    }
  });

  it('configures self-hosted fonts before evaluating application dependencies', async () => {
    await import('./index');

    expect(appImport).toHaveBeenCalledExactlyOnceWith('/excalidraw-assets/');
    expect(window.EXCALIDRAW_ASSET_PATH).toBe('/excalidraw-assets/');
    expect(createRoot).toHaveBeenCalledExactlyOnceWith(container);
    expect(render).toHaveBeenCalledOnce();
  });

  // Inline scripts are blocked by strict CSPs (script-src without 'unsafe-inline').
  it('boots the application through an external module without inline scripts', () => {
    const html = fs.readFileSync(path.resolve(import.meta.dirname, '../index.html'), 'utf-8');
    // <template> content is inert, so referenced resources are not fetched while parsing.
    const template = document.createElement('template');
    template.innerHTML = html;
    const inlineScripts = Array.from(template.content.querySelectorAll('script')).filter(
      (script) => !script.hasAttribute('src')
    );

    expect(template.content.querySelector('script[type="module"][src="/src/index.tsx"]')).not.toBeNull();
    expect(inlineScripts).toHaveLength(0);
  });
});
