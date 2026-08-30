# 《语灵》敌方意图战斗独立样机 V1 工程任务单

状态：`FROZEN / AUTHORIZED FOR IMPLEMENTATION`

日期：2026-08-30

依据：`docs/TURN_BASED_COMBAT_PAPER_PROTOTYPE_V1.md`

## 1. 目标与入口

新增完全独立的移动端战斗样机，验证“敌方意图先产生技能选择；英语调用只提供离散掌握奖励，不使用统一发挥百分比”。

入口：`/prototype/intent-combat`。不接主线、不替换Phase A/B、不修改V2正式基线。

## 2. 唯一允许修改

- 新建 `app/game/intent-combat-v1.ts`
- 新建 `app/prototype/intent-combat/page.tsx`
- 在 `app/prototype.css` 追加仅以 `.intent-` 开头的样式
- 新建 `scripts/validate-intent-combat-v1.ts`
- `package.json` 只新增 `validate:intent-combat-v1`
- 新建最终 handoff 文档

若编译必须，可做最小导入修正；不得修改其他战斗结算文件。

## 3. 禁止范围

禁止修改 `app/page.tsx`、`fusion-slice.ts`、`phase-b-flow.ts`、`zero-base-teaching.ts`、`bridge-config.ts`、`spirit-config.ts`、EP01–EP03、叙事、主存档、成长、5505词源及Candidate A/B/C历史实现。禁止新增正式敌人、技能、剧情、对白、资源条、元素克制、速度轴、装备或队伍系统。

## 4. 测试内容

- 澜歌48 HP；测试敌人A 66 HP。
- 水音：基础12伤害；supported使敌方下一次真正攻击降低3；independent降低6。蓄力回合不会浪费该奖励，减伤保留到敌人实际攻击后再消耗。
- 回潮：基础6伤害+回复4；supported额外回复5；independent额外回复10。
- 静波：基础8护盾；supported额外护盾5；independent额外护盾10。
- failed只执行基础结果；页面不得显示25%、40%、70%或100%发挥。
- 敌方意图循环：攻击12 → 攻击18 → 蓄力（本回合不攻击并预告下一回合24）→ 攻击24 → 攻击12 → 蓄力 → 攻击24；超过序列后从攻击12继续。

## 5. 英语调用

- 只从 `ZERO_BASE_WORDS` 读取正式现有 `water(w1718)`、`help(w729)` 与现有 `targetGloss`；禁止复制或新造释义。
- 两词交替；先选技能，再在技能卡内调用。
- 独立正确=independent；使用一次“回想世界动作”后正确=supported；错误=failed并记录真实薄弱词。
- 思考时间不参与结算。

## 6. UI与反馈

390×844首屏同时看到双方HP、敌方下一步意图与精确数字、三个技能的基础结果和掌握奖励；不设入口菜单。

反馈保持同一结算顺序，但只使用两段玩家确认：第一屏同时清楚显示技能基础结果、掌握奖励（若有）和实际状态；点击“继续”后第二屏显示敌方执行与结算后状态；再次点击即进入下一回合。不得把一次行动拆成4–5张连续确认卡，也不强制等待固定秒数。

胜利显示HP与本场独立/支架/错误次数；战败先显示“战斗失利”，再列真实薄弱词；本轮不实现repair，只提供重新挑战。

页面提供“英语调用开启 / 只测战斗选择”开关。纯战斗模式直接执行基础结果，不生成薄弱词，也不获得掌握奖励，不写存档。

## 7. 自动验证至少18项

覆盖：初始48/66；意图顺序；三个技能三档离散结果；failed不依赖统一倍率；回复上限；护盾先吸收；水音压制保留到下一次真正攻击并在使用后清除；蓄力无伤；击杀后敌人不行动；两词交替；正式词义读取；时间不参与；纯战斗无奖励/薄弱；failed真实记录；战败明确；重开复位。

回归Candidate C、Phase B flow、V2、fusion-slice、zero-base、lint、build、`git diff --check`。

## 8. 390×844实机

1. 英语开启：独立水音 → failed静波 → supported水音 → 独立静波 → 独立回潮。
2. 连续failed至战败，确认只列真实薄弱词。
3. 纯战斗模式至少5回合，确认无英语题、奖励和薄弱词但仍有意图选择。
4. 无横向溢出、无运行错误、触控按钮可用。

## 9. 停止线

完成独立样机、验证、handoff与commit后停止。不得迁入主线、Phase B或V2正式规格；等待Sol实机Review。
