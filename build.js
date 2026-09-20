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

// Copy fonts directory
const fontsSrcDir = path.join(srcDir, 'fonts');
const fontsDistDir = path.join(distDir, 'fonts');
if (fs.existsSync(fontsSrcDir)) {
    fs.cpSync(fontsSrcDir, fontsDistDir, { recursive: true });
    console.log('Copied: fonts directory');
}

// Copy workspace directory
const workspaceSrcDir = path.join(srcDir, 'workspace');
const workspaceDistDir = path.join(distDir, 'workspace');
if (fs.existsSync(workspaceSrcDir)) {
    fs.cpSync(workspaceSrcDir, workspaceDistDir, { recursive: true });
    console.log('Copied: workspace directory');
}

// Static Web Apps reads routing and security headers from the deployed output.
const staticWebAppConfig = path.join(srcDir, 'staticwebapp.config.json');
if (fs.existsSync(staticWebAppConfig)) {
    fs.copyFileSync(staticWebAppConfig, path.join(distDir, 'staticwebapp.config.json'));
    console.log('Copied: staticwebapp.config.json');
}

// Vercel reads routing configuration from output directory if present
const vercelConfig = path.join(srcDir, 'vercel.json');
if (fs.existsSync(vercelConfig)) {
    fs.copyFileSync(vercelConfig, path.join(distDir, 'vercel.json'));
    console.log('Copied: vercel.json');
}

console.log("Build Complete. Assets ready in /dist");
