import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function ping() {
      const req = http.get(url, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 500) {
          resolve();
        } else {
          retry();
        }
      });
      req.on('error', retry);
      req.end();
    }
    function retry() {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Timeout waiting for server at ${url}`));
      } else {
        setTimeout(ping, 500);
      }
    }
    ping();
  });
}

async function main() {
  console.log('🚀 Starting local Next.js production server for automated QA audit...');
  const webDir = path.join(__dirname, 'apps', 'web');
  
  // Use pnpm start (or node node_modules/next/dist/bin/next start)
  const isWin = process.platform === 'win32';
  const server = spawn('pnpm', ['start'], {
    cwd: webDir,
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, PORT: '3000', HOSTNAME: '127.0.0.1' },
  });

  try {
    console.log('⏳ Waiting for http://localhost:3000 to be ready...');
    await waitForServer('http://localhost:3000');
    console.log('✅ Next.js server is ready! Executing Playwright + Axe QA Suite...');

    // Execute test script (defaults to titanfit-test.mjs)
    const targetScript = process.argv[2] || 'titanfit-test.mjs';
    const testRunner = spawn('node', [targetScript], {
      cwd: __dirname,
      shell: true,
      stdio: 'inherit',
    });

    const exitCode = await new Promise((resolve) => {
      testRunner.on('close', resolve);
    });

    console.log(`\n🏁 QA test suite exited with code: ${exitCode}`);
  } finally {
    console.log('🛑 Shutting down Next.js server...');
    if (isWin) {
      spawn('taskkill', ['/pid', String(server.pid), '/f', '/t'], { stdio: 'ignore' });
    } else {
      server.kill('SIGTERM');
    }
  }
}

main().catch((err) => {
  console.error('Fatal runner error:', err);
  process.exit(1);
});
