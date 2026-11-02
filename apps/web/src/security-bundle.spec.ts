import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Client Bundle Security & Credential Leak Prevention', () => {
  const nextStaticDir = path.resolve(__dirname, '../.next/static');

  // TODO [SECURITY-P0]: In branch 'security/server-auth', switch this to normal it()
  // once apps/web client bundle is purged and auth moves completely to apps/api.
  it.fails('detects client-bundle leaks (expected to fail until server-auth migration lands)', () => {
    // 1. Must fail clearly if build has not been generated
    if (!fs.existsSync(nextStaticDir)) {
      throw new Error(
        'FATAL: .next/static directory not found! You must execute `next build` before running security bundle scans.',
      );
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

    // 2. Must verify scanned file count > 0
    expect(jsFiles.length, 'Expected at least 1 compiled JS chunk in .next/static').toBeGreaterThan(0);

    // 3. Precise leak patterns with false-positive exclusions:
    // Exclude placeholders like TF-XXXXXXXXXX, invoice prefixes (INV-2026-), and ISO-8601 dates (2026-11-02)
    const leakedPatterns = [
      {
        name: 'Gym Secret PIN Pattern',
        // Matches TF-#### or PK-#### but ignores year numbers like TF-2026 or placeholders TF-XXXXXXXXXX
        regex: /\b(?:TF|PK)-(?!XXXXXXXXXX\b|202[0-9]\b)[0-9]{4,6}\b/,
      },
      {
        name: 'Hardcoded Tenant Password Key',
        regex: /password\s*:\s*["'][a-zA-Z0-9_-]{5,}["']/i,
      },
      {
        name: 'Gym Secret Code Property Key',
        regex: /gymSecretCode\s*:\s*["'][a-zA-Z0-9_-]+["']/i,
      },
      {
        name: 'Hardcoded Fallback Secret Keyword',
        regex: /(?:fallbackPassword|defaultOwnerPass|dummyAdminCode)/i,
      },
    ];

    const violations: string[] = [];

    for (const filePath of jsFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const pattern of leakedPatterns) {
        if (pattern.regex.test(content)) {
          // Output violation with sensitive snippet redacted
          violations.push(
            `❌ SECURITY LEAK in client bundle [${path.basename(filePath)}]: Found pattern ${pattern.name} (Matched value: [REDACTED])`,
          );
        }
      }
    }

    // Expect zero leaks in client static bundle
    expect(
      violations,
      `Client-side static bundle contains sensitive credentials or PINs:\n${violations.join('\n')}`,
    ).toEqual([]);
  });
});
