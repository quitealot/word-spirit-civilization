# 《语灵》敌方意图战斗独立样机 V1 工程交接

状态：`IMPLEMENTED / AUTOMATED PASS / 390×844 PASS`

日期：2026-08-30

实现 commit：`242c0d376b87d51d136276e4b78599720d6edb63`

依据：`docs/INTENT_COMBAT_PROTOTYPE_V1_TASK.md`

## 1. 完成范围

已新增独立入口：`/prototype/intent-combat`

本轮只新增敌方意图战斗样机，不接主线，不替换 Phase A/B/C，不写入存档，不改变 V2 正式基线。

页面默认直接进入战斗，不设入口菜单；可在页面顶部切换：

- `英语调用开启`：先选技能，再调用两个正式词之一；
- `只测战斗选择`：不出现英语题，技能卡隐藏掌握奖励描述，只执行技能基础结果。

## 2. 工程行为证据

- 初始状态为澜歌 `48 HP`、测试敌人A `66 HP`。
- 敌方意图循环固定为：攻击12 → 攻击18 → 蓄力（本回合不攻击，下一回合24）→ 攻击24 → 攻击12 → 蓄力 → 攻击24，之后从攻击12继续。
- 水音执行基础12伤害；支架/独立调用分别追加“敌方下一次真正攻击”降低3/6。该压制在实际状态中显示为待生效；蓄力回合不消耗，下一次攻击先应用压制再结算护盾，实际攻击后清零。
- 回潮执行基础6伤害+回复4；支架/独立调用分别追加回复5/10，回复受玩家最大生命限制。
- 静波执行基础8护盾；支架/独立调用分别追加护盾5/10，敌方伤害先由护盾吸收。
- 英语错误仍执行技能基础结果，只记录本次真实调用词为薄弱词；页面不使用统一发挥百分比。
- 两个调用词严格读取 `ZERO_BASE_WORDS` 中现有 `water(w1718)`、`help(w729)` 及其 `targetGloss`，按回合交替。
- 思考时间不进入结算；纯战斗模式不生成奖励或薄弱词。
- 反馈严格收敛为两段：Step1 同屏显示技能基础结果、掌握奖励（若有）和技能后实际状态；Step2 显示敌方执行、实际承伤/护盾/压制、结算后状态及下一回合预告。第二段点击“进入下一回合”后回到技能选择或终局；击杀在 Step1 明确敌人未行动并直接进入胜利结果。
- 胜利显示双方 HP 与本场三类调用次数；战败先显示“战斗失利”，只列真实薄弱词，并提供重新挑战，不实现 repair。

## 3. 修改路径

- `app/game/intent-combat-v1.ts`
- `app/prototype/intent-combat/page.tsx`
- `app/prototype.css`（仅追加 `.intent-` 样式）
- `scripts/validate-intent-combat-v1.ts`
- `package.json`（仅新增 `validate:intent-combat-v1`）

## 4. 自动验证

- `npm run validate:intent-combat-v1`：`18/18 PASS`
- `npm run validate:phase-b-combat-feedback-c`：`20/20 PASS`
- `npm run validate:phase-b-flow`：`16/16 PASS`
- `npm run validate:skill-english-v2`：`PASS`
- `npm run validate:fusion-slice`：`PASS`
- `npm run validate:zero-base-teaching`：`PASS`
- `npm run lint`：`PASS`
- `npm run build`：`PASS`
- `git diff --check`：`PASS`

Intent 专项 validator 覆盖初始 HP、意图轮换、三技能基础与两档奖励、错误不依赖统一倍率、回复上限、护盾先吸收、水音压制保留到下一次真正攻击并在攻击后清除、蓄力无伤、击杀跳过敌方行动、两词交替、词源完整性、思考时间不参与、纯战斗无奖励/薄弱、真实薄弱记录、战败明确与重开复位。

## 5. 390×844 Sol实机证据

1. 代表路径完成：独立水音 → failed静波 → supported水音 → 独立静波 → 独立回潮。蓄力回合获得的水音压制保留到24点重击，重击先降为21，再由18护盾吸收，玩家实际承受3。
2. 连续failed静波在第7回合明确进入“战斗失利”；调用统计为failed 7，只列真实薄弱词 `help / water`，没有伪造记录。
3. 纯战斗模式完成5回合；无英语题、无掌握奖励展示、无薄弱记录，技能卡只显示基础结果，意图选择仍成立。
4. 回合反馈收敛为两段：我的技能结果 → 敌方结果与下一回合预告；不再要求4–5次连续确认。
5. 390×844下 `scrollWidth = clientWidth = 390`、`scrollHeight = clientHeight = 844`；最小按钮高度44px；控制台无error/warning。

该交接不授权迁入主线、Phase B或正式V2。
