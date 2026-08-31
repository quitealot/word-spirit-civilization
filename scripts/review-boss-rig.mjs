// Asset-only review of actual bitmap masks; not a browser or runtime-image edit.
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { BossCaster } from '../outputs/boss-rig-review/boss-caster.js';
import { WaterCaster } from '../outputs/boss-rig-review/water-caster.js';
for(const [name, Component, assets, joint, pivot, angles, dimensions] of [
  ['boss',BossCaster,['gatekeeper.png','gatekeeper-seam-source.png'],'bu-boss-arm','184,643',[0,35,80,135],[512,768]],
  ['ally',WaterCaster,['lange-cutout.png','lange-shoulder-source.png'],'bu-caster-arm','478,565',[38,95,112],[627,627]],
]) {
  let svg=renderToStaticMarkup(React.createElement(Component,{active:true,skill:name==='boss'?'quake':'wave'})).match(/<svg[\s\S]*?<\/svg>/)[0];
  for(const file of assets){const data=await readFile(new URL(`../public/battle-ui/${file}`,import.meta.url)); svg=svg.replaceAll(`/battle-ui/${file}`,`data:image/png;base64,${data.toString('base64')}`);}
  if(name==='boss') svg=svg.replace('viewBox="0 0 1024 1536"','viewBox="-360 0 1384 1536"');
  for(const angle of angles){const posed=svg.replace('<svg ',`<svg xmlns="http://www.w3.org/2000/svg" width="${name==='boss'?692:dimensions[0]}" height="${dimensions[1]}" `).replace(`class="${joint}"`,`transform="rotate(${angle},${pivot})"`); await sharp(Buffer.from(posed)).flatten({background:'#183d33'}).png().toFile(`outputs/boss-rig-review/${name}-${angle}.png`);}
}
console.log('Boss 0/35/80/135 and ally 38/95/112 degree asset poses rendered.');
