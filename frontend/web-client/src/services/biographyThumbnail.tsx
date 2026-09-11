import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import { toCanvas } from 'html-to-image';

// Render only saved content, independently of the editor's selected section or device mode.
export async function captureBiographyThumbnail(content: ReactNode): Promise<File> {
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.inert = true;
  host.style.cssText = 'position:fixed;left:-12000px;top:0;width:1060px;height:795px;overflow:hidden;pointer-events:none;background:white;';
  document.body.appendChild(host);
  const root = createRoot(host);
  let assetTimeout: ReturnType<typeof setTimeout> | undefined;
  try {
    flushSync(() => root.render(<MemoryRouter><div style={{ width: 1060, height: 795, overflow: 'hidden', background: '#fff' }}>{content}</div></MemoryRouter>));
    const contentNode = host.firstElementChild as HTMLElement;
    if (!contentNode) throw new Error('Template preview is unavailable');
    // Offscreen capture must not preserve entrance-animation opacity/transforms.
    const style = document.createElement('style');
    style.textContent = '[data-thumbnail-capture] *, [data-thumbnail-capture] *::before, [data-thumbnail-capture] *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }';
    host.dataset.thumbnailCapture = 'true';
    host.appendChild(style);
    await Promise.race([
      Promise.all([
        document.fonts.ready,
        ...Array.from(host.querySelectorAll('img')).filter((img) => img.getBoundingClientRect().top < 795).map(async (img) => {
          img.loading = 'eager';
          if (img.currentSrc || img.src) {
            try { await img.decode(); } catch { img.removeAttribute('srcset'); img.removeAttribute('src'); }
          }
        }),
      ]),
      new Promise<never>((_, reject) => { assetTimeout = setTimeout(() => reject(new Error('Preview images took too long to load')), 20000); }),
    ]);
    clearTimeout(assetTimeout);
    const canvas = await toCanvas(contentNode, {
      width: 1060, height: 795, canvasWidth: 800, canvasHeight: 600,
      pixelRatio: 1, backgroundColor: '#ffffff', preferredFontFormat: 'woff2',
      fetchRequestInit: { signal: AbortSignal.timeout(30000) },
      filter: (node) => !(node instanceof HTMLElement) || node.getBoundingClientRect().top < 795,
      style: { position: 'relative', left: '0', top: '0' },
    });
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Unable to create thumbnail')), 'image/webp', 0.8);
    });
    if (blob.type !== 'image/webp') throw new Error('This browser cannot create WebP thumbnails');
    return new File([blob], `biography-thumbnail-${Date.now()}.webp`, { type: blob.type });
  } finally {
    clearTimeout(assetTimeout);
    root.unmount();
    host.remove();
  }
}
