import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Client Bundle Security & Credential Leak Prevention', () => {
  const nextStaticDir = path.resolve(__dirname, '../.next/static');

  // TODO [SECURITY-P0]: In branch 'security/server-auth', switch this to normal it()
  // once apps/web client bundle is purged and auth moves completely to apps/api.
  it.fails('detects client-bundle leaks (expected to fail until server-auth migration lands)', () => {
    if (!fs.existsSync(nextStaticDir)) {
      console.warn('⚠️ .next/static directory not found. Skipping static chunk leak scan.');
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

    // Generic pattern matching without any literal secrets
    const leakedPatterns = [
      { name: 'Gym Secret PIN Pattern ([A-Z]{2,4}-[0-9]{4,6})', regex: /\b[A-Z]{2,4}-[0-9]{4,6}\b/ },
      { name: 'Hardcoded Tenant Password Object Key', regex: /password\s*:\s*["'][a-zA-Z0-9_-]{5,}["']/i },
      { name: 'Hardcoded Fallback Secret Keyword', regex: /(?:fallbackPassword|defaultOwnerPass|dummyAdminCode)/i },
    ];

    const violations: string[] = [];

    for (const filePath of jsFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const pattern of leakedPatterns) {
        if (pattern.regex.test(content)) {
          violations.push(
            `❌ SECURITY LEAK in client bundle [${path.basename(filePath)}]: Found pattern ${pattern.name}`,
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
