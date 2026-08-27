# app/AGENTS.md

本文件对 `app/` 下所有 Codex 工作生效，是根目录 `AGENTS.md` 的补充。

## 1. 战斗 / 技能 / 英语调用强制规则

只要任务涉及以下任一内容：

- 战斗结算；
- 语灵技能；
- 英语调用与技能效果；
- 战斗取词；
- 100% / 70% / 40% 发挥倍率；
- 技能伤害、回复、护盾、减伤、冷却；

开始修改前必须先读取：

1. `docs/SKILL_ENGLISH_SYSTEM_V2.md`
2. `docs/SKILL_ENGLISH_SYSTEM_V2_ENGINEERING_LOCK.md`

核心契约固定为：

> 技能决定这一回合做什么；英语决定这件事这次发挥多少。

战斗取词固定为：

`Used-or-Maintained + battleEligible`

其中 `Maintained` 必须建立在此前已经达到 `Used` 的证据之上。

战斗层不要求词义与技能语义绑定。世界教学层仍要求语义自然。

不得自行调整技能数值、倍率、词与技能关系或新增正式系统/文案。

---

## 2. Phase B 连续体验冻结规则

涉及“教学页 → 战斗页 → 补弱 → 再战”时，继续遵守：

1. `docs/TEACH_BATTLE_REPAIR_PHASE_B_SPEC.md`
2. `docs/TEACH_BATTLE_REPAIR_PHASE_B_MIGRATION_TASK.md`
3. `docs/TEACH_BATTLE_REPAIR_PHASE_B_HANDOFF.md`

Phase B 已实现，仍只属于独立原型。不得修改主线、EP01–EP03、正式词源、成长、正式技能动画或长期抽词系统。

---

## 3. Candidate A 已关闭

Candidate A `48 / 80 / 12` 已实现，但 Sol 最终判定：

`NOT PASS / PRESSURE TOO LOW / CLOSED`

裁决：

`docs/PHASE_B_COMBAT_PRESSURE_CANDIDATE_A_SOL_VERDICT.md`

Candidate A 历史 profile 必须保留，不得直接改写成 B。

---

## 4. 当前唯一新授权：Candidate B

必须先读取：

`docs/PHASE_B_COMBAT_PRESSURE_CANDIDATE_B_TASK.md`

当前只允许把 Phase B 战斗压力从 A 推进到 B：

- Candidate A 历史 profile：`48 / 80 / 12`，保留；
- Candidate B：`48 / 80 / 14`；
- 唯一平衡变化：敌方基础伤害 `12 → 14`。

本轮允许修改的 app 文件仅按任务单：

- `app/game/phase-b-flow.ts`
- `app/prototype/fusion-slice/page.tsx`

**本轮不得再修改 `app/game/fusion-slice.ts`。** Candidate A 已完成 enemyDamage 可选注入，Candidate B 只使用既有接口。

继续禁止：

- `app/page.tsx`
- `app/game/bridge-config.ts`
- `app/game/spirit-config.ts`
- `app/game/zero-base-teaching.ts`
- `app/learning-engine.ts`
- `app/narrative/**`
- EP01–EP03
- 100 / 70 / 40
- no-call
- 水音 / 回潮效果
- teaching / repair
- 新词、新敌人、新关卡、新剧情、新系统

完成 Candidate B 后立即停止，不得自行继续 Candidate C 或主线。
