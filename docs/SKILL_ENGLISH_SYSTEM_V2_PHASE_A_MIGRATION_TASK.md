# 《语灵》技能 × 英语系统 V2：Phase A 工程迁移任务单

状态：`READY FOR CODEX / PHASE-A ONLY`
依赖规格：

1. `docs/SKILL_ENGLISH_SYSTEM_V2.md`
2. `docs/SKILL_ENGLISH_SYSTEM_V2_ENGINEERING_LOCK.md`
3. 根目录 `AGENTS.md`
4. `app/AGENTS.md`

本任务只迁移 `/prototype/fusion-slice`。不得借本任务迁移主线九技能或修改 EP01–EP03。

## 一、任务目标

把当前融合切片从 V1 的“两个技能同伤害 + actionTag 语义匹配 + 无词时临时基础攻击”迁移为 V2：

> **技能决定做什么；英语决定本次发挥多少。**

验证以下体验：

- 「水音」与「回潮」形成清楚的战术差异；
- 词与技能彻底解除战斗层语义绑定；
- 100% / 70% / 40% 只缩放技能原有正向效果，不改变技能身份；
- 没有合格词时仍能使用真实技能直接挑战，不创造临时技能；
- 不触碰主线冻结内容。

## 二、文件范围

### 允许修改

- `app/game/fusion-slice.ts`
- `app/prototype/fusion-slice/page.tsx`
- 如确有必要，可新增 `app/game/skill-english-v2.ts` 或等价的**纯配置/纯结算模块**；本轮必须只被融合切片引用
- `scripts/validate-skill-english-v2.ts`（新建）
- `package.json`：只新增 `validate:skill-english-v2`
- 原型专用 CSS：仅当现有页面无法显示 V2 数值反馈时做最小修改
- 完成后新增 `docs/SKILL_ENGLISH_SYSTEM_V2_PHASE_A_HANDOFF.md`

### 明确禁止修改

- `app/page.tsx`
- `app/game/bridge-config.ts`
- `app/game/spirit-config.ts`
- `app/narrative/**`
- EP01 / EP02 / EP03 任何冻结内容
- 主存档 schema
- 成长系统
- `app/learning-engine.ts`
- 正式 5505 词源数据
- L2/L3
- 任何新词、新敌人、新关卡、新正式技能文案

如果实现发现必须修改禁止文件才能继续，立即停止并报告，不得自行扩大范围。

## 三、Phase A 技能配置

只迁移澜歌当前两个测试技能：

### 水音

- 基础：`18` 伤害
- 同时：敌方**下一次**伤害降低 `20%`

### 回潮

- 基础：`10` 伤害
- 同时：恢复 `22` HP
- 回复不超过 Max HP

所有数值必须来自 V2 显式配置。不得继续让 `executionKind` 或旧 `baseDamage` 分支自行推断。

## 四、英语倍率

配置键必须独立：

- `independent = 1.00`
- `supported = 0.70`
- `failed = 0.40`
- `noCall = 0.40`

其中 `noCall` 与 `failed` 当前数值相同，但必须是两个独立配置键。

不得使用反应时间改变即时效果。

## 五、战斗取词

### 有合格词

合格状态：

- `used + battleEligible`
- `maintained + battleEligible`

`maintained` 必须是曾经达到 `used` 之后的维护成功状态。

战斗层**不再检查 actionTag / 技能语义匹配**。

本切片保持确定性轮换：

- 新战斗从合格词第一个开始；
- 当前两词原型中，连续两回合可以验证 `water → help`；
- 重开战斗后换「回潮」，第一回合也可调用 `water`；
- 选哪个技能不能改变候选词池。

### 无合格词

- 不出英语调用；
- 不出现陌生词；
- 不生成薄弱词；
- 仍显示「水音 / 回潮」两个真实技能；
- 玩家选择哪个，就按该技能 `noCall = 0.40` 的真实组件结算；
- 删除/停用当前“基础技能 20 伤害”兜底。

“直接挑战”按钮只跳过战前训练：如果已有合格词，进入战斗后仍必须正常调用这些词。

## 六、统一结算顺序

每回合严格执行：

1. 选择技能；
2. 确定英语倍率或 `noCall`；
3. 计算技能所有组件；
4. 整体应用技能：伤害、回复、削弱/减伤状态；
5. 若敌方 HP = 0，立即胜利，本回合不再反击；
6. 敌方仍存活：
   - 原始伤害；
   - 先乘敌方下一击削弱；
   - 再乘己方下一击减伤（本 Phase A 当前没有，但 resolver 不能反着写）；
   - 最终伤害 `Math.round` 一次；
   - 护盾先吸收（本 Phase A 当前没有）；
   - 余量扣 HP；
   - 一次性状态消耗；
7. 玩家 HP = 0 判负，否则下一回合。

整数型效果统一最后 `Math.round` 一次；百分比逻辑保留小数，UI 可显示整数百分比。

## 七、当前原型数值的预期结果

### 水音

- independent：18 伤害 + 20% 削弱
- supported：13 伤害 + 14% 削弱
- failed：7 伤害 + 8% 削弱
- noCall：7 伤害 + 8% 削弱

### 回潮

- independent：10 伤害 + 22 回复
- supported：7 伤害 + 15 回复
- failed：4 伤害 + 9 回复
- noCall：4 伤害 + 9 回复

不得修改这些 Phase A 初值。

## 八、UI 最小要求

- 技能选择页先显示真实技能；
- 有合格词时，选择技能后在**该技能区域内**展开英语调用；不得跳转到独立答题页；
- 反馈只需清楚显示：技能名、本次发挥%、实际伤害、实际回复或削弱%；
- 不以 `WRONG` 作为主要反馈；
- 正式表现文案缺口用 `PENDING_K3`，不得自行润色技能；
- 无合格词时不得显示“基础技能”；仍用水音/回潮。

## 九、必须新增的自动验证

新增 `scripts/validate-skill-english-v2.ts`，至少覆盖：

1. `Introduced / Guided / Retrieved` 不可进入 battleEligible 池；
2. `Used` 可进入；
3. `Maintained` 可进入，且测试数据必须体现其来自 Used 之后；
4. 战斗取词不按技能 actionTag 过滤；
5. 连续两回合「水音」可稳定取得 `water → help`；
6. 新战斗第一回合「回潮」同样可取得 `water`；
7. 水音 100/70/40 的结果为 `18+20% / 13+14% / 7+8%`；
8. 回潮 100/70/40 的结果为 `10+22 / 7+15 / 4+9`；
9. `22 × 0.70` 最终回复为 `15`，证明统一取整；
10. 水音 independent 面对当前 `enemyDamage = 8` 时，20% 削弱后本次敌方整数伤害为 `6`；
11. 技能击杀敌人时，本回合敌人不再反击；
12. 合格词池为空时：
    - 不产生英语调用；
    - 不产生 weakness；
    - 水音按 noCall 得到 `7 + 8%削弱`；
    - 回潮按 noCall 得到 `4 + 9回复`；
    - 不存在临时“基础技能20伤害”；
13. 当前融合切片参数下，无合格词时至少有一条真实技能策略可以完成战斗，证明直接挑战不是伪入口；
14. 反应时间不参与倍率计算。

## 十、必须运行的回归

- `npm run validate:skill-english-v2`
- `npm run validate:zero-base-teaching`
- `npm run lint`
- `npm run build`
- `git diff --check`

另外确认现有 EP01 / EP02 / EP03 相关文件无 diff。

## 十一、手机实机路径

390×844 至少走完：

1. 两词都合格：连续两回合选水音，看到 `water → help`；
2. 重开：第一回合选回潮，仍可调用 `water`；
3. 满血时比较水音/回潮选择感；
4. 掉血后比较水音/回潮选择感；
5. 各验证一次 independent / supported / failed 的实际组件差异；
6. 无合格词：仍显示水音/回潮，无英语题，无基础攻击，占用真实技能 noCall 40%；
7. 无合格词路径实际完成一次战斗；
8. 英语调用始终嵌在技能区域内，无独立考试页。

## 十二、停止线

完成 Phase A 后立即停止并提交 Review 材料。

**不得继续：**

- 把 V2 接入 `app/page.tsx` 主线；
- 迁移另外七个技能；
- 调整 EP03 战斗；
- 修改成长/星级/共鸣；
- 增词；
- 做 EP04；
- 新增状态、元素、资源条、复杂冷却系统；
- “顺手”重构旧 V1 全局战斗。

交付必须包含：修改文件清单、明确未改文件、自动验证结果、390×844 实机结果、commit SHA，并等待用户/Sol Review。
