import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../app/prototype/battle-3d/page.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/prototype/battle-3d/battle-3d.css', import.meta.url), 'utf8');
const task = readFileSync(new URL('../docs/BATTLE_3D_VERTICAL_SLICE_V1_TASK.md', import.meta.url), 'utf8');

let passed = 0;
const check = (name: string, predicate: () => void) => {
  predicate();
  passed += 1;
  console.log(`PASS ${name}`);
};

check('route is an isolated client-side WebGL experience', () => {
  assert.match(page, /'use client'/);
  assert.match(page, /<Canvas/);
  assert.match(page, /@react-three\/fiber/);
});
check('scene uses perspective camera, fog, light and real shadows', () => {
  assert.match(page, /camera=\{\{ position:/);
  assert.match(page, /<fog attach="fog"/);
  assert.match(page, /directionalLight/);
  assert.match(page, /shadows/);
  assert.match(page, /castShadow/);
  assert.match(page, /receiveShadow/);
});
check('player and boss stay at the approved battle fixture', () => {
  assert.match(page, /useState\(60\)/);
  assert.match(page, /setBossHp\(42\)/);
  assert.match(page, /48 \/ 48/);
  assert.match(page, /18 点伤害/);
});
check('water sound follows gather release impact recover order', () => {
  const gather = page.indexOf("setPhase('gather')");
  const release = page.indexOf("setPhase('release')");
  const impact = page.indexOf("setPhase('impact')");
  const recover = page.indexOf("setPhase('recover')");
  assert.ok(gather > 0 && gather < release && release < impact && impact < recover);
});
check('damage is applied only at the impact transition', () => {
  assert.match(page, /setPhase\('impact'\); setBossHp\(42\)/);
  assert.equal((page.match(/setBossHp\(42\)/g) ?? []).length, 1);
});
check('replay is locked while the presentation is active', () => {
  assert.match(page, /if \(phase !== 'ready'\) return/);
  assert.match(page, /disabled=\{phase !== 'ready'\}/);
});
check('motion preference and mobile layout are explicit', () => {
  assert.match(page, /prefers-reduced-motion/);
  assert.match(css, /@media \(max-width:700px\)/);
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)/);
});
check('renderer pixel ratio is bounded for mobile safety', () => {
  assert.match(page, /dpr=\{\[1, 1\.65\]\}/);
  assert.match(page, /powerPreference: 'high-performance'/);
});
check('task keeps the old prototype and mainline frozen', () => {
  assert.match(task, /不覆盖现有 `\/prototype\/battle-ui`/);
  assert.match(task, /不迁移主线、成长、存档/);
});

console.log(`${passed} battle-3d checks passed`);
