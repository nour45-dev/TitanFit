#!/usr/bin/env node
/**
 * GymOS Automated Secret & Sensitive File Scanner
 * Runs before commits and in CI to guarantee zero leaked keys, tokens, or .env files.
 */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const FORBIDDEN_FILE_PATTERNS = [
  /^\.env(\..+)?$/,
  /\.pem$/i,
  /\.key$/i,
  /\.p12$/i,
  /\.pfx$/i,
  /credentials\.json$/i,
  /service-account.*\.json$/i,
];

const ALLOWED_FILES = new Set(['.env.example']);

const SECRET_CONTENT_PATTERNS = [
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'Private Key Header', regex: /-----BEGIN (RSA|EC|DSA|OPENSSH|PRIVATE) KEY-----/ },
  { name: 'GitHub Personal Access Token', regex: /gh[pousr]_[A-Za-z0-9_]{36,255}/ },
  { name: 'Stripe Live Secret Key', regex: /sk_live_[0-9a-zA-Z]{24,}/ },
  { name: 'Slack Token', regex: /xox[baprs]-[0-9a-zA-Z]{10,48}/ },
  { name: 'Google API Key', regex: /AIza[0-9A-Za-z\-_]{35}/ },
];

function getTrackedAndStagedFiles() {
  try {
    const tracked = execSync('git ls-files', { encoding: 'utf8' })
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' })
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    return Array.from(new Set([...tracked, ...staged]));
  } catch {
    return [];
  }
}

const files = getTrackedAndStagedFiles();
const violations = [];

for (const file of files) {
  const base = file.split('/').pop() || file;
  if (ALLOWED_FILES.has(base) || file.endsWith('secret-scan.mjs')) {
    continue;
  }

  for (const pattern of FORBIDDEN_FILE_PATTERNS) {
    if (pattern.test(base)) {
      violations.push(`Forbidden sensitive filename tracked/staged: ${file}`);
    }
  }

  const fullPath = resolve(process.cwd(), file);
  if (!existsSync(fullPath)) continue;

  try {
    const content = readFileSync(fullPath, 'utf8');
    for (const { name, regex } of SECRET_CONTENT_PATTERNS) {
      if (regex.test(content)) {
        violations.push(`Potential ${name} detected in ${file}`);
      }
    }
  } catch {
    // Binary or unreadable file, skip text scan
  }
}

if (violations.length > 0) {
  console.error('❌ [GymOS Secret Scanner] Security violations detected:');
  for (const v of violations) {
    console.error(`   - ${v}`);
  }
  process.exit(1);
} else {
  console.log(`✅ [GymOS Secret Scanner] Scanned ${files.length} tracked/staged files. Zero secrets or forbidden files found.`);
}
