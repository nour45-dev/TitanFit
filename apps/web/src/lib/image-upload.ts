/**
 * Reads an image picked from the user's device, validates it and downsizes it to a small
 * data-URL (keeps tenant records light so they can be stored in the browser).
 */
export const MAX_LOGO_FILE_BYTES = 5 * 1024 * 1024;

export async function fileToLogoDataUrl(file: File, maxSide = 320): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('INVALID_TYPE');
  }
  if (file.size > MAX_LOGO_FILE_BYTES) {
    throw new Error('TOO_LARGE');
  }

  const raw = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('READ_FAILED'));
    reader.readAsDataURL(file);
  });

  // SVG stays vector as-is (already small)
  if (file.type === 'image/svg+xml') return raw;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('DECODE_FAILED'));
    el.src = raw;
  });

  const ratio = Math.min(1, maxSide / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * ratio));
  const h = Math.max(1, Math.round(img.height * ratio));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return raw;
  ctx.drawImage(img, 0, 0, w, h);
  // PNG keeps transparency for logos
  return canvas.toDataURL(file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', 0.9);
}
