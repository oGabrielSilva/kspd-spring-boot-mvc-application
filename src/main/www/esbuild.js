const esbuild = require('esbuild');
const { resolve } = require('path');
const fs = require('fs');

function cssInJsPlugin() {
  return {
    name: 'css-in-js',
    setup(build) {
      build.onResolve({ filter: /\.css$/ }, (args) => {
        return { path: resolve(args.resolveDir, args.path), namespace: 'css-in-js' };
      });

      build.onLoad({ filter: /.*/, namespace: 'css-in-js' }, async (args) => {
        const cssContent = await fs.promises.readFile(args.path, 'utf8');
        const contents = `
                  const style = document.createElement('style');
                  style.textContent = ${JSON.stringify(cssContent)};
                  document.head.appendChild(style);
                `;
        return { contents, loader: 'js' };
      });
    },
  };
}

(async () => {
  const isDev = process.argv.filter((arg) => arg === '--is-dev').length > 0;
  const options = {
    entryPoints: [resolve(__dirname, 'typescript', 'main.ts')],
    bundle: true,
    minify: true,
    sourcemap: true,
    target: ['es6'],
    plugins: [cssInJsPlugin()],
    outfile: resolve(
      __dirname,
      '..',
      'resources',
      'static',
      'javascript',
      'kassiopeia.bundle.min.js'
    ),
  };
  if (isDev) {
    const context = await esbuild.context(options);
    console.log('Esbuild watch dev mode');
    await context.watch();
    return;
  }
  await esbuild.build(options);
  console.log('Esbuild build success');
})();
