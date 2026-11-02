import fs from 'node:fs';
import path from 'node:path';

export function extractJpegsFromPdf(pdfBuffer, outDir) {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const streamMarker = Buffer.from('stream\n');
  const streamMarkerCrLf = Buffer.from('stream\r\n');
  const endstreamMarker = Buffer.from('\nendstream');

  let pos = 0;
  let pageIdx = 1;
  const savedImages = [];

  while (pos < pdfBuffer.length) {
    let sIdx = pdfBuffer.indexOf(streamMarker, pos);
    let offset = 7;
    if (sIdx === -1) {
      sIdx = pdfBuffer.indexOf(streamMarkerCrLf, pos);
      offset = 8;
    }
    if (sIdx === -1) break;

    const dataStart = sIdx + offset;
    const eIdx = pdfBuffer.indexOf(endstreamMarker, dataStart);
    if (eIdx === -1) break;

    const chunk = pdfBuffer.subarray(dataStart, eIdx);
    // Check if JPEG SOI marker (0xFF, 0xD8)
    if (chunk.length > 4 && chunk[0] === 0xFF && chunk[1] === 0xD8) {
      const outPath = path.join(outDir, `page_${pageIdx}.jpg`);
      fs.writeFileSync(outPath, chunk);
      savedImages.push(outPath);
      console.log(`  📄 Extracted page ${pageIdx} JPEG image: ${outPath} (${chunk.length} bytes)`);
      pageIdx++;
    }

    pos = eIdx + 10;
  }

  return savedImages;
}
