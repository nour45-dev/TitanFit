'use client';

import React, { useRef, useState } from 'react';
import { fileToLogoDataUrl } from '../lib/image-upload';

export function LogoPicker({
  value,
  onChange,
  isAr,
  testId = 'logo-picker',
  fallbackLabel,
}: {
  value: string;
  onChange: (dataUrl: string) => void;
  isAr: boolean;
  testId?: string;
  fallbackLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      onChange(await fileToLogoDataUrl(file));
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      setError(
        code === 'INVALID_TYPE'
          ? isAr
            ? 'الملف المختار ليس صورة. اختر صورة PNG أو JPG أو SVG.'
            : 'The selected file is not an image. Choose PNG, JPG or SVG.'
          : code === 'TOO_LARGE'
            ? isAr
              ? 'حجم الصورة أكبر من 5 ميجابايت. اختر صورة أصغر.'
              : 'Image is larger than 5 MB. Choose a smaller one.'
            : isAr
              ? 'تعذّر قراءة الصورة. جرّب ملفاً آخر.'
              : 'Could not read the image. Try another file.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-1 flex flex-wrap items-center gap-3" data-testid={testId}>
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="logo preview" data-testid={`${testId}-preview`} className="h-full w-full object-contain p-1" />
        ) : (
          <span className="px-1 text-center text-[10px] font-bold text-slate-400">
            {fallbackLabel ?? (isAr ? 'بدون شعار' : 'No logo')}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            data-testid={`${testId}-choose`}
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-black text-white transition hover:bg-slate-700 disabled:opacity-60 dark:bg-amber-500 dark:text-slate-950"
          >
            {busy ? (isAr ? 'جاري التحميل...' : 'Loading...') : isAr ? 'اختيار صورة من جهازك' : 'Choose from your device'}
          </button>
          {value && (
            <button
              type="button"
              data-testid={`${testId}-remove`}
              onClick={() => {
                setError('');
                onChange('');
              }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {isAr ? 'إزالة' : 'Remove'}
            </button>
          )}
        </div>
        <p className="text-[11px] text-slate-500">
          {isAr ? 'PNG أو JPG أو SVG — حتى 5 ميجابايت' : 'PNG, JPG or SVG — up to 5 MB'}
        </p>
        {error && <p className="text-[11px] font-bold text-rose-600">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        data-testid={`${testId}-input`}
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
