import path from 'node:path';
import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
Config.setAudioBitrate('320k');

// Àlies que esperen els components de snapcn (src/vendor/snapcn), com si s'haguessin instal·lat amb shadcn.
const vendor = path.resolve(process.cwd(), 'src/vendor/snapcn');
Config.overrideWebpackConfig((config) => ({
  ...config,
  module: {
    ...config.module,
    rules: [
      ...(config.module?.rules ?? []).filter((rule) => {
        const test = typeof rule === 'object' && rule ? (rule as {test?: unknown}).test : undefined;
        return !(test instanceof RegExp && (test.test('a.ttf') || test.test('a.wasm')));
      }),
      // tegaki (lletra a mà): la font i el shaper harfbuzz van incrustats al paquet.
      {test: /\.(ttf|otf)$/, type: 'asset/inline'},
      // Les woff2 com a fitxer (amb extensió), que és el que espera @remotion/fonts.
      {test: /\.(woff2?|eot)$/, type: 'asset/resource'},
      {test: /\.wasm$/, type: 'asset/inline'},
    ],
  },
  resolve: {
    ...config.resolve,
    fallback: {...config.resolve?.fallback, fs: false, path: false, crypto: false, module: false, url: false},
    alias: {
      ...(config.resolve?.alias as Record<string, string>),
      '@/lib/snap-cn-ui': path.join(vendor, 'snap-cn-ui/core/index.ts'),
      '@/components/snap-cn/input': path.join(vendor, 'snap-cn-ui/input/index.tsx'),
      '@/components/snap-cn/caret': path.join(vendor, 'snap-cn-ui/caret/index.tsx'),
      '@/components/snap-cn': path.join(vendor, 'snap-cn'),
      '@/lib/utils': path.resolve(process.cwd(), 'src/lib/utils.ts'),
    },
  },
}));
