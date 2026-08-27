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

该两份文档是当前技能 × 英语系统的权威规格。若现有 `spirit-config.ts`、`bridge-config.ts`、`page.tsx` 或其他 V1 代码与 V2 规格冲突：

1. 不得以旧代码反向覆盖 V2；
2. 不得自行做游戏设计折中；
3. 不得自行调整技能数值、倍率或词与技能的关系；
4. 不得自行新增技能效果、正式文案或系统；
5. 规格缺口使用 `PENDING_K3` 或停下报告。

核心契约固定为：

> 技能决定这一回合做什么；英语决定这件事这次发挥多少。

战斗取词固定为：

`Used-or-Maintained + battleEligible`

其中 `Maintained` 必须建立在此前已经达到 `Used` 的证据之上。

战斗层不要求词义与技能语义绑定。世界教学层仍要求语义自然。

---

## 2. Phase B 连续体验规则

涉及“教学页 → 战斗页 → 补弱 → 再战”必须先读：

1. `docs/TEACH_BATTLE_REPAIR_PHASE_B_SPEC.md`
2. `docs/TEACH_BATTLE_REPAIR_PHASE_B_MIGRATION_TASK.md`
3. `docs/TEACH_BATTLE_REPAIR_PHASE_B_HANDOFF.md`

Phase B 已实现，但仍是独立原型；不得进入主线。

---

## 3. 当前唯一新增授权：Candidate A 独立战斗压力测试

用户已批准：

`docs/PHASE_B_COMBAT_PRESSURE_CANDIDATE_A_TASK.md`

Codex 只允许严格按该任务单进行 Candidate A 测试。

Candidate A 只作用于 `flow=phase-b`：

- 玩家 Max HP `48`；
- 敌人 Max HP `80`；
- 敌人基础伤害 `12`。

默认 `/prototype/fusion-slice` 必须继续保持 Phase A debug 的 `60 HP / 8伤害`。

### 对旧“不得改 fusion-slice.ts”的唯一窄例外

Candidate A 任务允许 `app/game/fusion-slice.ts` 只做一项接口扩展：

- 给 `resolveFusionBattleCall` 增加带默认值的可选 `enemyDamage` options 注入；
- 默认仍读取 `FUSION_SLICE_RULES.enemyDamage`；
- 不得修改技能公式、100/70/40、no-call、weakness、结算顺序或任何其他核心逻辑。

除此之外，`app/game/fusion-slice.ts` 仍视为冻结。

若实现需要超过该例外，立即停止并报告。

---

## 4. 持续禁止

不得：

- 修改 `app/page.tsx` 主线；
- 修改 `app/game/bridge-config.ts`；
- 修改 `app/game/spirit-config.ts`；
- 修改 `app/game/zero-base-teaching.ts`；
- 修改 `app/narrative/**` 或 EP01–EP03；
- 修改 100/70/40 或 `noCallMultiplier`；
- 修改水音/回潮；
- 新增正式技能动画、词、敌人、关卡、剧情、成长或长期抽词系统；
- 把 Candidate A 的 `80/12` 传播到默认 debug、主线或未来正式平衡。

正式实现前不得修改 EP01–EP03 冻结剧情或冻结战斗流程。
