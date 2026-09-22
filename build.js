import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = __dirname;
const distDir = path.join(__dirname, 'dist');

console.log("Starting Production Build Pipeline...");

// 1. Wipe stale dist directory completely to eliminate orphan ghost files (BUNDLE-01)
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
    console.log("Purged stale dist directory");
}
fs.mkdirSync(distDir, { recursive: true });
console.log("Created clean dist directory");

// 2. Strict exclusion filters for production security & bundle size (BUNDLE-02)
const EXCLUDED_FILES = new Set([
    'build.js',
    'playwright.config.js',
    'vitest.config.js',
    'vite.config.js',
    'take_screenshot.js',
    'local_preview.png',
    'package.json',
    'package-lock.json'
]);

const validExtensions = ['.html', '.js', '.png', '.pdf', '.css', '.json', '.svg', '.ico'];

const files = fs.readdirSync(srcDir);

files.forEach(file => {
    const srcPath = path.join(srcDir, file);
    const stats = fs.statSync(srcPath);

    if (stats.isFile()) {
        const ext = path.extname(file).toLowerCase();
        
        // Skip non-production extensions
        if (!validExtensions.includes(ext)) return;

        // Skip explicitly excluded developer tools and configs
        if (EXCLUDED_FILES.has(file)) return;

        // Skip test scripts, verify scripts, and test screenshots
        if (file.startsWith('test_') || file.startsWith('verify_') || file.endsWith('.test.js') || file.endsWith('.spec.js')) return;
        if (file.endsWith('_preview.png') || file.startsWith('stratum')) return;

        const destPath = path.join(distDir, file);
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied: ${file}`);
    }
});

// 3. Copy fonts directory
const fontsSrcDir = path.join(srcDir, 'fonts');
const fontsDistDir = path.join(distDir, 'fonts');
if (fs.existsSync(fontsSrcDir)) {
    fs.cpSync(fontsSrcDir, fontsDistDir, { recursive: true });
    console.log('Copied: fonts directory');
}

// 4. Copy workspace directory
const workspaceSrcDir = path.join(srcDir, 'workspace');
const workspaceDistDir = path.join(distDir, 'workspace');
if (fs.existsSync(workspaceSrcDir)) {
    fs.cpSync(workspaceSrcDir, workspaceDistDir, { recursive: true });
    console.log('Copied: workspace directory');
}

// 5. Config files
const staticWebAppConfig = path.join(srcDir, 'staticwebapp.config.json');
if (fs.existsSync(staticWebAppConfig)) {
    fs.copyFileSync(staticWebAppConfig, path.join(distDir, 'staticwebapp.config.json'));
    console.log('Copied: staticwebapp.config.json');
}

const vercelConfig = path.join(srcDir, 'vercel.json');
if (fs.existsSync(vercelConfig)) {
    fs.copyFileSync(vercelConfig, path.join(distDir, 'vercel.json'));
    console.log('Copied: vercel.json');
}

const groundRails = path.join(srcDir, 'ground_rails.json');
if (fs.existsSync(groundRails)) {
    fs.copyFileSync(groundRails, path.join(distDir, 'ground_rails.json'));
    console.log('Copied: ground_rails.json');
}

console.log("Build Complete. Pure 60 FPS production assets ready in /dist");
