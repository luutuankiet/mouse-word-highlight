import esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

/** VS Code loads extensions as CommonJS and provides `require('vscode')` at
 *  runtime, so we bundle to CJS and mark `vscode` external. platform:'browser'
 *  is what makes this a *web* extension bundle (runs in vscode.dev's worker). */
const options = {
  entryPoints: ['src/extension.ts'],
  outfile: 'dist/web/extension.js',
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2020',
  external: ['vscode'],
  sourcemap: true,
  minify: !watch,
  logLevel: 'info',
};

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log('[esbuild] watching…');
} else {
  await esbuild.build(options);
}
