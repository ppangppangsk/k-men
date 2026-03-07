import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tsx = join(__dirname, 'node_modules', '.bin', 'tsx');

const child = spawn(tsx, ['server/index.ts'], {
  stdio: 'inherit',
  env: { ...process.env },
});

child.on('exit', (code) => process.exit(code ?? 1));
