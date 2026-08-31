// Asset QA only: render the real component's bitmap masks at fixed joint angles.
// This does not modify the artwork or create a runtime asset.
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { WaterCaster } from '../outputs/water-rig-review/water-caster.js';

const markup = renderToStaticMarkup(React.createElement(WaterCaster, { active:true }));
let svg = markup.match(/<svg[\s\S]*?<\/svg>/)[0];
for (const name of ['lange-cutout.png','lange-shoulder-source.png']) {
  const data = await readFile(new URL(`../public/battle-ui/${name}`, import.meta.url));
  svg = svg.replaceAll(`/battle-ui/${name}`, `data:image/png;base64,${data.toString('base64')}`);
}
for (const angle of [0,35,68,88]) {
  const posed = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="627" height="627" ')
    .replace('class="bu-caster-arm"', `transform="rotate(${angle},478,565)"`);
  await sharp(Buffer.from(posed)).flatten({background:'#183d33'}).png().toFile(`outputs/water-rig-review/pose-${angle}.png`);
}
console.log('Four asset pose review images rendered (0/35/68/88 degrees).');
