import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = __dirname;
const distDir = path.join(__dirname, 'dist');

console.log("Starting Build...");

// Ensure dist exists
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
    console.log("Created dist directory");
}

// Files to copy
const files = fs.readdirSync(srcDir);
const validExtensions = ['.html', '.js', '.png', '.pdf', '.css'];

files.forEach(file => {
    const srcPath = path.join(srcDir, file);
    const stats = fs.statSync(srcPath);

    if (stats.isFile()) {
        const ext = path.extname(file).toLowerCase();
        if (validExtensions.includes(ext)) {
            if (file === 'vite.config.js') return;

            const destPath = path.join(distDir, file);
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied: ${file}`);
        }
    }
});

console.log("Build Complete. Assets ready in /dist");
