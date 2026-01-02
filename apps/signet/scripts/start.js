const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function ensureConfigFolder() {
    const target = path.resolve(process.cwd(), 'config');
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }
}

function runMigrations() {
    console.log('Running database migrations…');
    const appDir = path.resolve(__dirname, '..');
    const prisma = path.join(appDir, 'node_modules', '.bin', 'prisma');
    const result = spawnSync(prisma, ['migrate', 'deploy'], {
        stdio: 'inherit',
        cwd: appDir,
    });

    if (result.status !== 0) {
        console.warn('Migrations exited with a non-zero status.');
    }
}

ensureConfigFolder();
runMigrations();

const args = process.argv.slice(2);
const daemon = spawn('node', ['./dist/index.js', ...args], {
    stdio: 'inherit',
    env: process.env,
});

daemon.on('exit', (code) => {
    process.exit(code ?? 0);
});
