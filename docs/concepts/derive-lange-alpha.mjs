// User requires original character, not an AI redraw. Reuse the prior original-art
// preview matte. Source RGB is unchanged; only alpha is derived. Not production rigging.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
const source = fileURLToPath(new URL('../../public/spirit-lange.png', import.meta.url));
const target = fileURLToPath(new URL('../../public/battle-ui/lange-cutout.png', import.meta.url));
const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += 4) {
  const lo = Math.min(data[i], data[i + 1], data[i + 2]);
  const hi = Math.max(data[i], data[i + 1], data[i + 2]);
  if (lo > 216 && hi - lo < 19) data[i + 3] = 0;
}
await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(target);
console.log(target);
