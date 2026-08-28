# 《语灵》Phase B Candidate C 工程交接

状态：`IMPLEMENTED / AWAITING SOL REVIEW`
日期：2026-08-28

运行实现 commit：`3665f6d11771163c307a799e4719b3def53a5c85`

## 1. 本轮边界

本轮只实现 Phase B Candidate C 独立原型验证：

- 玩家 `48 HP`；敌人 `80 HP / 14 伤害`；
- `independent = 1.00`、`supported = 0.70`；
- Candidate C 的 `failed = 0.25`、`no-call = 0.25`；
- 水音/回潮基础效果、教学、repair、取词与战斗结算公式不变；
- 反馈顺序为：玩家技能结果 `1200ms` → 敌方行动提示 `400ms` → 敌方伤害结果 `1200ms` → 下一回合；
- HP 归零后先显示明确的 `战斗失利`，再提供 `处理刚才的问题`；
- Candidate A、Candidate B、默认 Phase A 配置均保留。

`docs/PHASE_B_FEEDBACK_PACING_CANDIDATE_C_TASK.md` 使用了另一组 validator/handoff 文件名；本次按根 `AGENTS.md` 与上级交接任务指定的权威命名，采用：

- `npm run validate:phase-b-combat-feedback-c`
- `docs/PHASE_B_COMBAT_FEEDBACK_CANDIDATE_C_HANDOFF.md`

## 2. 修改文件

- `app/game/phase-b-flow.ts`
  - 新增 Candidate C profile；
  - 新增反馈阶段计时与顺序常量。
- `app/game/fusion-slice.ts`
  - 仅新增可选的 `qualityMultiplier` 与 `noCallMultiplier` 注入；
  - 未注入时继续使用默认 V2 `40%/40%`；
  - `resolveFusionBattleCall.length` 保持 `3`。
- `app/prototype/fusion-slice/page.tsx`
  - Phase B 使用 Candidate C；
  - 加入玩家结果 → 敌方预备 → 敌方结果的顺序反馈与输入锁定；
  - 回潮回复单独显示绿色 `+N HP`，敌方伤害单独显示 `-N HP`；
  - 战败先显示 `战斗失利`，再进入真实薄弱词 repair；
  - transient timer 在组件卸载时清理。
- `app/prototype.css`
  - 仅新增反馈颜色、阶段结果和战败状态的原型样式。
- `scripts/validate-phase-b-combat-feedback-c.ts`
  - 新增 Candidate C 20 项专项 validator。
- `package.json`
  - 新增 `validate:phase-b-combat-feedback-c`。

## 3. 未修改范围

本轮未修改：`app/page.tsx`、EP01–EP03、主存档、5505 词源、教学/repair 核心、成长、九技能全局配置、正式剧情与对白、正式动画系统，以及 Candidate A/B 的历史参数。

运行代码已由上级 Codex 检查；本交接将在提交与私有内测发布后补记最终 SHA 与版本。

## 4. 自动验证

Candidate C 专项：`20/20 PASS`。

专项覆盖：

- `48/80/14 + 25%/25%`；
- A/B 与默认 Phase A 隔离；
- 水音 `5 伤害 + 5%削弱`；
- 回潮 `3 伤害 + 6 回复`；
- Candidate C no-call 25% 与默认 no-call 40% 的配置隔离；
- 独立正确约 5 回合剩 23 HP；
- 一次错误仍可挽回，约 6 回合剩 10 HP；
- 连续两次错误的代表路径战败；
- 全程错误不存在胜利路径；
- 击杀后敌人不行动；
- evidence missing 仍显式断链；
- 顺序常量与阶段文案存在。

既有回归：

- `validate:phase-b-combat-pressure-b`：PASS `16/16`；
- `validate:phase-b-combat-pressure`：PASS `15/15`；
- `validate:phase-b-flow`：PASS `16/16`；
- `validate:skill-english-v2`：PASS；
- `validate:fusion-slice`：PASS；
- `validate:zero-base-teaching`：PASS；
- `npm run lint`：PASS。

- `npm run build`：PASS；
- `git diff --check`：PASS；
- 冻结文件 diff 审计：PASS。

## 5. 390×844 实机证据

本地页面按 `http://localhost:3000/prototype/zero-base?flow=phase-b` 验证：

1. 水音独立：在英语调用页停留超过 3 秒后正确作答，仍显示 `100% / 造成 18 伤害 / 敌伤降低 20%`，证明反应时间不削弱技能；随后依次显示 `敌方行动`、`-11 HP`，最后才恢复技能选择。
2. 回潮 failed：结果先显示 `25% / 造成 3 伤害 / +6 HP`；之后才显示敌方行动与 `-14 HP`。
3. 水音 failed：结果先显示 `25% / 造成 5 伤害 / 敌伤降低 5%`；之后单独显示 `-13 HP`。
4. 连续 failed 后明确进入 `战斗失利` 页面，并列出真实 `water / help` 薄弱词；补弱与自动再战路径已实机回归。
5. 390×844 下 `scrollWidth = clientWidth = 390`、`scrollHeight = clientHeight = 844`；无横向溢出，控制台无运行时错误/警告。

## 6. 待 Sol 判断

工程闭环已停在 Candidate C 实机 Review：请重点判断 `+6 HP` 是否仍显得过多、约 `2.8s` 的非击杀回合是否拖沓，以及战败提示是否清楚但不产生羞辱感。不得自动进入 Candidate D 或主线迁移。
