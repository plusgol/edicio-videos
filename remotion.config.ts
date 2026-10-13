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
  resolve: {
    ...config.resolve,
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
