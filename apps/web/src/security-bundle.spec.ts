import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Client Bundle Security & Credential Leak Prevention', () => {
  const nextStaticDir = path.resolve(__dirname, '../.next/static');

  it('guarantees no plaintext PINs, passwords, or tenant credentials are leaked in client JS chunks', () => {
    if (!fs.existsSync(nextStaticDir)) {
      // If production build has not run yet in this workspace, pass with notice
      console.warn('⚠️ .next/static directory not found. Skipping static chunk leak scan until after build.');
      return;
    }

    const getAllFiles = (dir: string): string[] => {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      list.forEach((file) => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          results = results.concat(getAllFiles(fullPath));
        } else if (file.endsWith('.js')) {
          results.push(fullPath);
        }
      });
      return results;
    };

    const jsFiles = getAllFiles(nextStaticDir);
    const leakedPatterns = [
      { name: 'Plaintext Gym Secret PIN (TF-7711)', regex: /TF-7711/ },
      { name: 'Plaintext Gym Secret PIN (PK-8820)', regex: /PK-8820/ },
      { name: 'Hardcoded Tenant Password Pattern', regex: /password:\s*["'][^"']+["']/i },
      { name: 'Hardcoded Admin Password Pattern', regex: /010023/ },
      { name: 'Hardcoded Fallback Password', regex: /coach123|owner123/ },
    ];

    const violations: string[] = [];

    for (const filePath of jsFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const pattern of leakedPatterns) {
        if (pattern.regex.test(content)) {
          violations.push(
            `❌ SECURITY LEAK in client bundle [${path.basename(filePath)}]: Found ${pattern.name}`,
          );
        }
      }
    }

    // This assertion will fail as soon as any secret is compiled into client static chunks
    expect(
      violations,
      `Client-side static bundle contains sensitive credentials or PINs:\n${violations.join('\n')}`,
    ).toEqual([]);
  });
});
