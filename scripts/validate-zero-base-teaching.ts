import { readFileSync } from 'node:fs';
import { ZERO_BASE_RULES, ZERO_BASE_WORDS } from '../app/game/zero-base-teaching.ts';

const expected = [
  ['w1156', 'people', 'n.人们，人；[the-]人民；一国人民，民族'],
  ['w1718', 'water', 'n.水 vt.浇灌；给…饮水 vi.流泪，加水'],
  ['w1042', 'need', 'aux.v./v.需要；必须 n.需要；贫困，困窘'],
  ['w265', 'choose', 'v.选择,挑选;甘愿'],
  ['w729', 'help', 'v.帮(援)助；有助于；[呼救]救命n.帮助(手)'],
] as const;

if (ZERO_BASE_WORDS.length !== 5) throw new Error('Prototype must contain exactly five source words');
expected.forEach(([wordId, word, meaning], index) => {
  const actual = ZERO_BASE_WORDS[index];
  if (actual.wordId !== wordId || actual.word !== word || actual.sourceMeaning !== meaning) {
    throw new Error(`Formal 5505 source mismatch at ${word}`);
  }
});
if (ZERO_BASE_RULES.wordOrder.join('>') !== 'people>water>need>choose>help') throw new Error('Frozen teaching order changed');
if (ZERO_BASE_RULES.helpLayers.length !== 4) throw new Error('Four-layer support is required');
if (ZERO_BASE_RULES.restAfterHelpMs < 3000 || ZERO_BASE_RULES.restAfterHelpMs > 5000) throw new Error('Post-help rest must be 3–5 seconds');

const page = readFileSync(new URL('../app/prototype/zero-base/page.tsx', import.meta.url), 'utf8');
for (const text of ['People need water.', 'choose water', 'help people', '收起中文，再做一次']) {
  if (!page.includes(text)) throw new Error(`Missing frozen prototype element: ${text}`);
}
if (page.includes('CHOOSE')) throw new Error('choose must remain lowercase');
if (page.includes('教学UI')) throw new Error('Presentation layer must not be named 教学UI');

console.log('Zero-base Teaching Micro Prototype V1 validation passed.');
