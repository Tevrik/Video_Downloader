import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function checkFfmpeg() {
    console.log('Checking for ffmpeg...');
    try {
        execSync('ffmpeg -version', { stdio: 'ignore' });
        console.log('ffmpeg is installed.');
    } catch (error) {
        console.error('Error: ffmpeg is not installed. Please install it to support high-quality downloads.');
        console.error('On Ubuntu/Debian: sudo apt install ffmpeg');
        process.exit(1);
    }
}

function cleanupPort(port) {
    console.log(`Cleaning up port ${port}...`);
    try {
        if (process.platform === 'linux' || process.platform === 'darwin') {
            execSync(`fuser -k ${port}/tcp`, { stdio: 'ignore' });
        } else if (process.platform === 'win32') {
            const output = execSync(`netstat -ano | findstr :${port}`).toString();
            const lines = output.split('\n');
            if (lines.length > 0) {
                const pid = lines[0].trim().split(/\s+/).pop();
                if (pid) {
                    execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
                }
            }
        }
    } catch (error) {
        // Ignore errors if no process is using the port
    }
}

function ensurePythonSymlink() {
    console.log('Ensuring python symlink exists...');
    const localBin = path.join(rootDir, '.local_bin');
    if (!fs.existsSync(localBin)) {
        fs.mkdirSync(localBin, { recursive: true });
    }

    const pythonSymlink = path.join(localBin, 'python');
    if (!fs.existsSync(pythonSymlink)) {
        let pythonPath = '';
        try {
            pythonPath = execSync('which python3 || which python').toString().trim();
        } catch (error) {
            // Ignore if which fails
        }

        if (pythonPath) {
            try {
                fs.symlinkSync(pythonPath, pythonSymlink);
                console.log(`Created symlink: ${pythonSymlink} -> ${pythonPath}`);
            } catch (error) {
                console.error(`Failed to create symlink: ${error.message}`);
            }
        } else {
            console.warn('Could not find python3 or python to create symlink.');
        }
    } else {
        console.log('python symlink already exists.');
    }
}

// Main execution
checkFfmpeg();
cleanupPort(8000);
ensurePythonSymlink();
console.log('Setup completed!');
