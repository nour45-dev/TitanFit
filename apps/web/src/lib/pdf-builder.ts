/**
 * Dependency-free PDF builder that supports Arabic (RTL) correctly.
 *
 * The browser's own text engine shapes/bidi-orders Arabic when we draw onto a <canvas>;
 * every page is then embedded as a JPEG inside a standards-compliant PDF 1.4 file
 * (correct xref table & byte offsets), so the downloaded file opens in every viewer.
 */

const PAGE_W = 595;
const PAGE_H = 842;
const SCALE = 2;
const MARGIN = 44;
const TOP = 70;
const BOTTOM = 60;

export type PdfBlock =
  | { t: 'title'; text: string; sub?: string }
  | { t: 'h1'; text: string }
  | { t: 'h2'; text: string }
  | { t: 'p'; text: string; muted?: boolean }
  | { t: 'li'; text: string }
  | { t: 'num'; n: number; text: string }
  | { t: 'stats'; items: Array<{ label: string; value: string }> }
  | { t: 'table'; head: string[]; rows: string[][]; widths?: number[] }
  | { t: 'note'; text: string }
  | { t: 'gap'; h?: number }
  | { t: 'pagebreak' };

export interface PdfOptions {
  dir: 'rtl' | 'ltr';
  brand: string;
  footer: string;
  title: string;
}

type Align = 'left' | 'right' | 'center';

type Cmd =
  | { k: 'text'; x: number; y: number; s: string; font: string; color: string; align: Align }
  | { k: 'rect'; x: number; y: number; w: number; h: number; fill?: string; stroke?: string; r?: number };

const INK = '#0f172a';
const MUTED = '#64748b';
const GOLD = '#d97706';
const GOLD_SOFT = '#fffbeb';
const BORDER = '#e2e8f0';
const SOFT = '#f8fafc';

function resolveFontFamily(): string {
  const f = getComputedStyle(document.body).fontFamily;
  return f && f.trim() ? f : 'Cairo, Tahoma, Arial, sans-serif';
}

async function ensureFonts(family: string): Promise<void> {
  try {
    await Promise.all([
      document.fonts.load(`400 16px ${family}`, 'عربي Abc'),
      document.fonts.load(`700 16px ${family}`, 'عربي Abc'),
      document.fonts.load(`900 16px ${family}`, 'عربي Abc'),
    ]);
    await document.fonts.ready;
  } catch {
    /* fall back to system fonts */
  }
}

function hex16(s: string): string {
  let out = 'FEFF';
  for (let i = 0; i < s.length; i++) out += s.charCodeAt(i).toString(16).padStart(4, '0');
  return out;
}

function dataUrlToBytes(url: string): Uint8Array {
  const bin = atob(url.slice(url.indexOf(',') + 1));
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

export async function buildPdfBlob(blocks: PdfBlock[], opts: PdfOptions): Promise<Blob> {
  if (typeof document === 'undefined') throw new Error('PDF generation requires a browser');
  const rtl = opts.dir === 'rtl';
  const family = resolveFontFamily();
  await ensureFonts(family);

  const mCanvas = document.createElement('canvas');
  const m = mCanvas.getContext('2d');
  if (!m) throw new Error('Canvas is not supported in this browser');
  const font = (w: number, s: number) => `${w} ${s}px ${family}`;
  const measure = (text: string, f: string) => {
    m.font = f;
    return m.measureText(text).width;
  };

  const L = MARGIN;
  const R = PAGE_W - MARGIN;
  const CW = R - L;
  const edge = rtl ? R : L;
  const align: Align = rtl ? 'right' : 'left';
  const dirSign = rtl ? -1 : 1;

  const pages: Cmd[][] = [[]];
  let y = TOP;
  const cur = () => pages[pages.length - 1]!;
  const newPage = () => {
    pages.push([]);
    y = TOP;
  };
  const ensure = (h: number) => {
    if (y + h > PAGE_H - BOTTOM) newPage();
  };

  const wrap = (text: string, f: string, maxW: number): string[] => {
    const out: string[] = [];
    for (const para of text.split('\n')) {
      const words = para.split(/\s+/).filter(Boolean);
      if (!words.length) {
        out.push('');
        continue;
      }
      let line = '';
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (measure(test, f) <= maxW || !line) line = test;
        else {
          out.push(line);
          line = w;
        }
      }
      if (line) out.push(line);
    }
    return out;
  };

  const writeLines = (
    text: string,
    size: number,
    weight: number,
    color: string,
    opt: { indent?: number; lineH?: number; maxW?: number } = {},
  ) => {
    const f = font(weight, size);
    const indent = opt.indent ?? 0;
    const maxW = (opt.maxW ?? CW) - indent;
    const lh = opt.lineH ?? size * 1.75;
    for (const line of wrap(text, f, maxW)) {
      ensure(lh);
      y += lh;
      if (line) {
        cur().push({ k: 'text', x: edge + dirSign * indent, y: y - lh * 0.28, s: line, font: f, color, align });
      }
    }
  };

  for (const b of blocks) {
    switch (b.t) {
      case 'title': {
        ensure(150);
        cur().push({ k: 'rect', x: L, y: y, w: CW, h: 118, fill: GOLD_SOFT, stroke: '#fde68a', r: 14 });
        const f1 = font(900, 24);
        let ty = y + 22;
        for (const line of wrap(b.text, f1, CW - 40)) {
          ty += 34;
          cur().push({ k: 'text', x: edge + dirSign * 20, y: ty, s: line, font: f1, color: INK, align });
        }
        if (b.sub) {
          const f2 = font(600, 11);
          for (const line of wrap(b.sub, f2, CW - 40)) {
            ty += 20;
            cur().push({ k: 'text', x: edge + dirSign * 20, y: ty, s: line, font: f2, color: MUTED, align });
          }
        }
        y += 138;
        break;
      }
      case 'h1': {
        ensure(60);
        y += 14;
        cur().push({ k: 'rect', x: rtl ? R - 5 : L, y: y, w: 5, h: 26, fill: GOLD, r: 2 });
        y += 24;
        cur().push({
          k: 'text',
          x: edge + dirSign * 16,
          y,
          s: b.text,
          font: font(900, 17),
          color: INK,
          align,
        });
        y += 14;
        break;
      }
      case 'h2': {
        ensure(40);
        y += 8;
        writeLines(b.text, 13, 800, GOLD, { lineH: 22 });
        break;
      }
      case 'p':
        writeLines(b.text, 11, 400, b.muted ? MUTED : INK, { lineH: 20 });
        y += 4;
        break;
      case 'li': {
        ensure(22);
        cur().push({ k: 'text', x: edge, y: y + 15, s: '•', font: font(900, 13), color: GOLD, align });
        writeLines(b.text, 11, 400, INK, { indent: 18, lineH: 20 });
        break;
      }
      case 'num': {
        ensure(26);
        const top = y;
        const bx = rtl ? R - 20 : L;
        cur().push({ k: 'rect', x: bx, y: top + 1, w: 20, h: 20, fill: GOLD, r: 10 });
        cur().push({ k: 'text', x: bx + 10, y: top + 15, s: String(b.n), font: font(800, 11), color: '#ffffff', align: 'center' });
        writeLines(b.text, 11, 400, INK, { indent: 28, lineH: 20 });
        y += 4;
        break;
      }
      case 'stats': {
        const n = b.items.length;
        const gap = 8;
        const bw = (CW - gap * (n - 1)) / n;
        ensure(60);
        for (let i = 0; i < n; i++) {
          const x = rtl ? R - (i + 1) * bw - i * gap : L + i * (bw + gap);
          const it = b.items[i]!;
          cur().push({ k: 'rect', x, y, w: bw, h: 50, fill: SOFT, stroke: BORDER, r: 10 });
          cur().push({
            k: 'text',
            x: x + bw / 2,
            y: y + 24,
            s: it.value,
            font: font(900, 15),
            color: INK,
            align: 'center',
          });
          cur().push({
            k: 'text',
            x: x + bw / 2,
            y: y + 41,
            s: it.label,
            font: font(600, 9),
            color: MUTED,
            align: 'center',
          });
        }
        y += 62;
        break;
      }
      case 'table': {
        const cols = b.head.length;
        const weights = b.widths ?? b.head.map(() => 1);
        const total = weights.reduce((a, c) => a + c, 0);
        const colW = weights.map((w) => (CW * w) / total);
        const colX = (idx: number) => {
          let off = 0;
          for (let k = 0; k < idx; k++) off += colW[k]!;
          return rtl ? R - off : L + off;
        };
        const pad = 8;
        const drawRow = (cells: string[], header: boolean) => {
          const f = font(header ? 800 : 500, header ? 10 : 10.5);
          const wrapped = cells.map((c, i) => wrap(c, f, colW[i]! - pad * 2));
          const lh = 17;
          const rowH = Math.max(...wrapped.map((w) => w.length)) * lh + 10;
          ensure(rowH);
          if (header) cur().push({ k: 'rect', x: L, y, w: CW, h: rowH, fill: GOLD_SOFT });
          for (let i = 0; i < cols; i++) {
            wrapped[i]!.forEach((line, li) => {
              const cx = colX(i) + (rtl ? -pad : pad);
              cur().push({
                k: 'text',
                x: cx,
                y: y + 15 + li * lh,
                s: line,
                font: f,
                color: header ? '#92400e' : INK,
                align,
              });
            });
          }
          cur().push({ k: 'rect', x: L, y: y + rowH - 0.5, w: CW, h: 0.8, fill: BORDER });
          y += rowH;
        };
        drawRow(b.head, true);
        for (const r of b.rows) drawRow(r, false);
        y += 8;
        break;
      }
      case 'note': {
        const f = font(600, 10.5);
        const lines = wrap(b.text, f, CW - 28);
        const h = lines.length * 18 + 18;
        ensure(h + 6);
        cur().push({ k: 'rect', x: L, y, w: CW, h, fill: '#fef2f2', stroke: '#fecaca', r: 10 });
        lines.forEach((line, i) => {
          cur().push({
            k: 'text',
            x: edge + dirSign * 14,
            y: y + 20 + i * 18,
            s: line,
            font: f,
            color: '#991b1b',
            align,
          });
        });
        y += h + 8;
        break;
      }
      case 'gap':
        y += b.h ?? 10;
        break;
      case 'pagebreak':
        newPage();
        break;
    }
  }

  /* ---------- render pages to JPEG ---------- */
  const total = pages.length;
  const jpegs: Uint8Array[] = [];
  for (let pi = 0; pi < total; pi++) {
    const canvas = document.createElement('canvas');
    canvas.width = PAGE_W * SCALE;
    canvas.height = PAGE_H * SCALE;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not supported in this browser');
    ctx.scale(SCALE, SCALE);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, PAGE_W, PAGE_H);
    ctx.direction = rtl ? 'rtl' : 'ltr';
    ctx.textBaseline = 'alphabetic';

    // header band
    ctx.fillStyle = GOLD;
    ctx.fillRect(0, 0, PAGE_W, 6);
    ctx.fillStyle = MUTED;
    ctx.font = font(800, 10);
    ctx.textAlign = rtl ? 'right' : 'left';
    ctx.fillText(opts.brand, edge, 34);
    ctx.fillStyle = BORDER;
    ctx.fillRect(L, 46, CW, 1);

    for (const c of pages[pi]!) {
      if (c.k === 'rect') {
        const r = c.r ?? 0;
        ctx.beginPath();
        if (r > 0 && typeof ctx.roundRect === 'function') ctx.roundRect(c.x, c.y, c.w, c.h, r);
        else ctx.rect(c.x, c.y, c.w, c.h);
        if (c.fill) {
          ctx.fillStyle = c.fill;
          ctx.fill();
        }
        if (c.stroke) {
          ctx.strokeStyle = c.stroke;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      } else {
        ctx.font = c.font;
        ctx.fillStyle = c.color;
        ctx.textAlign = c.align;
        ctx.fillText(c.s, c.x, c.y);
      }
    }

    // footer
    ctx.fillStyle = BORDER;
    ctx.fillRect(L, PAGE_H - 44, CW, 1);
    ctx.fillStyle = MUTED;
    ctx.font = font(600, 9);
    ctx.textAlign = 'center';
    ctx.fillText(`${opts.footer}  •  ${pi + 1} / ${total}`, PAGE_W / 2, PAGE_H - 26);

    jpegs.push(dataUrlToBytes(canvas.toDataURL('image/jpeg', 0.92)));
    canvas.width = 0;
    canvas.height = 0;
  }

  /* ---------- assemble PDF 1.4 ---------- */
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let offset = 0;
  const push = (d: Uint8Array | string) => {
    const u = typeof d === 'string' ? enc.encode(d) : d;
    chunks.push(u);
    offset += u.length;
  };
  const begin = (n: number) => {
    offsets[n] = offset;
    push(`${n} 0 obj\n`);
  };

  push('%PDF-1.4\n');
  push(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));

  begin(1);
  push('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  begin(2);
  const kids = jpegs.map((_, i) => `${4 + i * 3} 0 R`).join(' ');
  push(`<< /Type /Pages /Kids [${kids}] /Count ${total} >>\nendobj\n`);
  begin(3);
  push(`<< /Title <${hex16(opts.title)}> /Producer <${hex16('TitanFit')}> /Creator <${hex16('TitanFit')}> >>\nendobj\n`);

  jpegs.forEach((jpg, i) => {
    const pageN = 4 + i * 3;
    const contentN = pageN + 1;
    const imgN = pageN + 2;
    begin(pageN);
    push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /XObject << /Im0 ${imgN} 0 R >> /ProcSet [/PDF /ImageC] >> /Contents ${contentN} 0 R >>\nendobj\n`,
    );
    begin(contentN);
    const content = `q ${PAGE_W} 0 0 ${PAGE_H} 0 0 cm /Im0 Do Q`;
    push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`);
    begin(imgN);
    push(
      `<< /Type /XObject /Subtype /Image /Width ${PAGE_W * SCALE} /Height ${PAGE_H * SCALE} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`,
    );
    push(jpg);
    push('\nendstream\nendobj\n');
  });

  const count = 3 + jpegs.length * 3;
  const xrefAt = offset;
  let xref = `xref\n0 ${count + 1}\n0000000000 65535 f \n`;
  for (let n = 1; n <= count; n++) xref += `${String(offsets[n]).padStart(10, '0')} 00000 n \n`;
  push(xref);
  push(`trailer\n<< /Size ${count + 1} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`);

  return new Blob(chunks as unknown as BlobPart[], { type: 'application/pdf' });
}

/** Triggers a real file download that works on desktop and mobile browsers. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 15000);
}
