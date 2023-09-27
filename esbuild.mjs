import * as esbuild from 'esbuild';
import process from 'node:process'
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await esbuild.build({
        entryPoints: [path.resolve(__dirname, './src/videojs-vjstranscribe.js')],
        outdir: "dist",
        bundle: true,
        metafile: true,
        platform: "browser"
}).catch(() => process.exit(1));