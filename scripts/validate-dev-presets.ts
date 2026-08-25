import {
  DEV_PRESET_TARGETS,
  assertDevPresetRoundTrip,
  createDevCleanSave,
  createDevEntryPreset,
  createDevPreset,
  patchDevSave,
  validateDevPreset,
} from '../app/game/dev-presets.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

for (const target of DEV_PRESET_TARGETS) {
  const preset = createDevPreset(target);
  assert(preset.validation.valid, `EP${target} preset invalid: ${preset.validation.errors.join('; ')}`);
  assert(validateDevPreset(preset.save, target).valid, `EP${target} direct validation failed`);
  assert(assertDevPresetRoundTrip(target).valid, `EP${target} JSON/migrate round-trip failed`);
}

const battleEntry = createDevEntryPreset(7, 'battle');
assert(battleEntry.entry.id === 'battle.ep07.team_test', 'EP07 battle entry mismatch');

const trackingEntry = createDevEntryPreset(9, 'node');
assert(trackingEntry.entry.id === 'ep09.rare_tracking', 'EP09 node entry mismatch');

const clean = createDevCleanSave();
let rejected = false;
try {
  patchDevSave(clean, { companion: true });
} catch {
  rejected = true;
}
assert(rejected, 'safe patch must reject acquiring 绒岚 before EP05');

console.log('Development preset validator: PASS');
