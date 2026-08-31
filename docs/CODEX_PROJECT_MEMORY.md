# 《语灵》Codex 项目记忆

更新时间：2026-08-31
状态：`CURRENT / AUTHORITATIVE`

若历史文档、旧 Review 或旧代码与本文件、根目录 `AGENTS.md`、当前冻结规格冲突，以较新的冻结裁决为准。

## 0. 当前方向与工作入口（覆盖下方历史定位）

2026-08-30晚用户明确希望完全去除英语关联，做微信小游戏：立绘、回合制、语灵收集进化、故事探索；希望形成收入，也让玩家开心、平静、愿意耐心观察。
2026-08-31用户要求开始，当前完成纯游戏切片规划与GitHub先验梳理。
阅读入口：`docs/PURE_GAME_VERTICAL_SLICE_V1.md`。

美术补充（2026-08-31用户确认）：不推翻原有概念图和立绘；否决AI重画成简化Q版。通过减少场景数量、动画复杂度来控制产能，不牺牲角色原有气质。首张原画合成排版见 `docs/concepts/original-art-battle-layout-v1.png`，非实机，不代表角色或战斗规格变更。

最新美术裁决：竖屏V1与横屏V2均被用户否决，不继续采用。用户亲自提供旧「雾港守门人」对战截图作为唯一视觉基准，保存在 `docs/concepts/user-approved-battle-reference.png`。保留墨绿金色、雾中遗迹、原横向战场、上下血条和整体布局；只允许局部修整，不再换背景/构图。已用内置图像编辑生成 `docs/concepts/reference-local-polish-v1.png` 局部优化示意：修澜歌方底、移除英语UI、底部换已有技能标签；敌方仍保留占位，PENDING_K3。此示意图尚待用户确认，生成编辑存在细节漂移，不是可替换原立绘的生产资产。未改运行代码或线上站点。

用户进一步要求「一次一只语灵、UI不素、血条明确、技能有介绍和图标」，已授权并实现独立可点击 `/prototype/battle-ui`，不再只做静态稿。背景采用原图去除内嵌三角色的副本；澜歌保持原RGB，仅Alpha抠底。点技能→说明→确认→玩家结果→敌方结果，有暂停/逐步与HP胜负。V2三技能及Phase A 48/60/8仅为UI演示夹具，非新正式平衡。交接：`docs/BATTLE_UI_SINGLE_SPIRIT_HANDOFF.md`。23项验证、局部strict类型检查、完整build通过；全库lint仍有此前两份CJS画图脚本的4个既有错误。尚未做浏览器点击或手机真机，等待用户审美/交互裁决。旧主线/原型/存档未改，微信原生运行验证仍未完成。

- 方向确认不等于新技能/正式剧情/进化规则已经冻结；后者仍需具体工程与内容任务。
最新用户反馈「竟然还不错」认可当前UI基础，并授权修血条、补BOSS、待机与技能动画。本轮在同一 `/prototype/battle-ui` 完成：HP残影key不再随phase重建；守门人透明立绘；分层轻量待机、三招特效、敌方准备/受击；窄屏施放先让战场回到视野。`demo-model.ts`完全未改。专项30/30、类型/构建/既有核心回归通过；浏览器桌面与390×844完成扣血复现对比、三技能、胜利/重开、自动恢复。交接见 `docs/BATTLE_UI_MOTION_HANDOFF.md`。这不是逐帧/骨骼动画或正式BOSS设定；全库lint仍有既有4个CJS错误。

- 首个切片提案：1只起始、1只收集、1只预告，1张节点图、2场必经战斗、最多1场可选战斗；先不批量制作5只新语灵。
2026-08-31用户继续认可UI，指出BOSS过弱，并同意先做水音抬手/更丰富特效样板。当前新样板按 `docs/WATER_CAST_SAMPLE_TASK.md`：原画身体/施法臂裁切分层，单肩关节动作+新透明水流；水音展示2.2秒、0.88秒命中显示扣血，其余结算/数值不变。39项验证与构建通过，0/35/68/88度资产姿势检查完成，未做本轮浏览器/手机手感验收。交接 `docs/WATER_CAST_SAMPLE_HANDOFF.md`。BOSS压力待独立平衡任务，不混改；其他技能不自动扩动画。

- 下一步先做真实微信运行验证，再接探索/收集/战斗；网页只是辅助预览。
2026-08-31用户认可水音样板「帅」，进一步授权提高BOSS伤害、BOSS技能/抬手、回潮与静波动画。新独立 `gatekeeper-v1` 页面配置48/60、石拳16/震击36固定交替；旧默认48/60/8夹具及主线不变。三招+BOSS原画单臂分层，所有伤害/回复在各演出的40%命中点显示。39项旧检查+28项新检查、类型、构建、核心回归通过；7张资产姿势检查完成，但未做本轮浏览器/手机实机。全库lint仍4个既有CJS错误。任务 `docs/BATTLE_UI_BOSS_SKILLS_TASK.md`；交接 `docs/BATTLE_UI_BOSS_SKILLS_HANDOFF.md`，等待用户压力/动作手感裁决，不再自动扩系统。
- 旧英语原型停止扩建并保留；EP01–EP03与旧存档未解冻；无Lite学习证据联动。
2026-08-31用户实机否定BOSS V1压力和动作表现：过猛且技能无重量。按 `BATTLE_UI_IMPACT_V2_TASK.md` 改为独立gatekeeper-v2的14/28（V1 16/36和fixture8仍留），石拳前冲、震击下砸、命中短停顿、金色青色碎石冲击素材，回潮/静波动作节奏优化。HP和玩家技能不改；88项检查、类型/构建/核心回归通过，未做本轮浏览器/真机动态验收。交接 `BATTLE_UI_IMPACT_V2_HANDOFF.md`，不可将工程通过写成手感通过。
- 现有美术3只；现有Intent代码仍依赖zero-base词源，不能直接标为独立纯游戏核心。
- 旧敌伤配置8/12/18与类型12/18/24存在不一致，本轮只记录；后续新增独立类型检查，不以vinext构建替代完整tsc检查。
- 2026-08-31最新私有站点版本31，运行代码b066709，在单语灵UI样机`/prototype/battle-ui`将BOSS回调14/28并优化前冲/重砸/冲击表现。版本30/8f7877d为BOSS16/36、抬手与完整命中时序；版本29/ec19aaf为水音抬手样板，版本28/c413ebf为守门人/轻量动画/血条修复，版本27/acdce51为原单语灵UI。旧运行基线cf9a0bd的主线/学习原型保持不变；本次不改权限。

以下为历史学习产品与工程记录，不再代表纯游戏版立项方向。

## 1. 项目身份

《语灵》面向纯零基础 / 基础断层英语学习者，形态为移动端 Web 叙事养成 RPG。用户负责最终体验裁决；Sol 负责产品/玩法/学习融合与最终 Review；DeepSeek 只做正式剧情/对白第二意见；Codex 只实现冻结任务。

## 2. 冻结主线

- EP01 v6：`FROZEN / APPROVED`
- EP02 v1.1：`FROZEN / APPROVED`
- EP03 v1.1：`FROZEN / APPROVED`

当前暂停 EP04。不得修改 EP01–EP03 的对白、关键因果或冻结战斗流程。第二伙伴正式名未定；旧“绒岚已冻结”为过时信息。

## 3. 词汇与教学

- 正式 5505 Excel 是词汇唯一真源。
- `ts-fsrs` 是唯一时间调度底座。
- L2/L3 继续受 Review 门控制。
- 学习证据：`Introduced → Guided → Retrieved → Used → Maintained`，Maintained 必须建立在 Used 之后。
- 零基础教学遵守 `Unknown Budget = 1`，中文可作支架，世界行动优先。

## 4. 技能 × 英语 V2 默认基线

- 战斗池：`Used-or-Maintained + battleEligible`；
- 战斗层不按技能语义分词；
- independent / supported / failed = `1.00 / 0.70 / 0.40`；
- 默认 no-call = `0.40`；
- 思考时间不影响即时倍率；
- 水音：18伤害 + 20%下一击削弱；
- 回潮：10伤害 + 22回复；
- 统一取整与结算顺序按 `SKILL_ENGLISH_SYSTEM_V2_ENGINEERING_LOCK.md`。

Candidate C 的25/25仍只是 Phase B 候选，不覆盖正式 V2 默认值。

## 5. Phase A / Phase B

### Phase A

- 基线：`0351c80ef607204f71a83a3a613117efdd83206f`
- 状态：`PASS / CLOSED`
- 默认 debug：48/60/8 + failed40/no-call40。

### Phase B

主入口：`/prototype/zero-base?flow=phase-b`

闭环：`语灵站日常 → 战斗 → 真实薄弱 → meaning/retrieve 两步 repair → 自动再战`

Phase B 仍只属于独立原型，不进入主线。

## 6. 候选历史

- Candidate A：48/80/12 + 40/40；`NOT PASS / PRESSURE TOO LOW / CLOSED`。
- Candidate B：48/80/14 + 40/40；`NOT PASS / FEEDBACK UNREADABLE / BALANCE HOLD`。

## 7. Candidate C 当前状态

实现 commit：

`3665f6d11771163c307a799e4719b3def53a5c85`

最终交接：

`e24756b328803859882dd14929a4c00861cbaf97`

Sol Review：

`docs/PHASE_B_COMBAT_FEEDBACK_CANDIDATE_C_SOL_REVIEW.md`

状态：

`ENGINEERING PASS / PRODUCT PLAYTEST HOLD`

Candidate C 只在 Phase B 原型中测试：

- 48 / 80 / 14；
- independent 1.00；
- supported 0.70；
- failed 0.25；
- no-call 0.25；
- 水音/回潮基础效果不变；
- 玩家技能结果 → 敌方行动提示 → 敌方伤害结果 → 下一回合；
- 回复绿色 +N HP；
- 敌伤红色 -N HP；
- HP=0 后先显示“战斗失利”，再进入真实 weakness repair；
- 思考时间仍不影响即时倍率。

工程验证：Candidate C 20/20 PASS；A/B、Phase B flow、V2、fusion-slice、zero-base、lint/build/diff 审计均通过；390×844 无横向溢出和运行错误。

## 8. 文档治理

仓库有两份 Candidate C 前置任务稿：

- 权威：`docs/PHASE_B_COMBAT_FEEDBACK_CANDIDATE_C_TASK.md`
- 历史：`docs/PHASE_B_FEEDBACK_PACING_CANDIDATE_C_TASK.md`

后者不得被当成新的并行任务再次执行。

## 9. 当前产品 Review 只看

1. 是否清楚区分“我的技能结果”和“敌方结果”；
2. 回潮 failed 的 `3伤害 +6回复` 是否还显得奖励过多；
3. 一次 failed 是否仍可挽回，不产生恐惧；
4. 约2.8秒非击杀反馈是否清楚而不拖沓；
5. “战斗失利 → repair → 自动再战”是否清楚但不中断动机。

## 10. 当前停止线

Candidate C 正在等待用户/Sol 产品实机裁决。Codex 不得自行：

- Candidate D；
- 再调倍率或敌伤；
- 把25/25写成正式 V2 全局值；
- 迁移主线九技能；
- 修改 EP01–EP03；
- 修改正式词源、成长或正式动画；
- 新增词、敌人、关卡、剧情或大型系统。

没有新的明确任务单就停下等待。

## 11. Intent Combat V1 新战斗基线

2026-08-30，用户授权Sol全盘规划、执行与Review。独立入口 `/prototype/intent-combat` 已完成并通过Sol Review：

- 状态：`PASS AS NEW COMBAT BASELINE / MAINLINE MIGRATION NOT AUTHORIZED`；
- 敌方意图公开；
- 水音/回潮/静波拥有基础职责；
- 英语只提供离散掌握奖励，不显示统一发挥百分比；
- 水音压制保留到下一次真正攻击；
- 纯战斗模式证明拿掉英语后仍有技能选择；
- 两段式回合反馈；
- 19/19专项、既有回归、lint/build/diff、390×844均通过。

权威Review：`docs/INTENT_COMBAT_PROTOTYPE_V1_SOL_REVIEW.md`。下一步只允许用新任务单做独立的教学/战斗/repair再融合，不得直接迁入主线或覆盖V2。

## 12. XState流程底座

2026-08-30，GitHub先验研究后采用XState v5只负责跨阶段流程编排，战斗领域结算继续使用纯TypeScript；boardgame.io只借鉴纯动作、阶段、日志和无界面模拟测试模式，不引入完整运行时。

Intent Combat独立等价迁移已通过Sol Review：`PASS AS ISOLATED FLOW FOUNDATION / FUSION NOT YET AUTHORIZED`。权威Review为 `docs/INTENT_COMBAT_XSTATE_FOUNDATION_SOL_REVIEW.md`。下一步须另立独立融合任务单，才能接“教学证据→战斗→weakness→repair→再战”；主线迁移仍未授权。

## 13. 教学—新战斗—补弱连续闭环

独立入口 `/prototype/zero-base?flow=intent-loop&restart=1` 已完成：世界教学后一次继续直达Intent Combat，failed产生真实weakness，meaning/retrieve两步repair后自动再战，修复词在前2次调用内出现；全independent无假repair。首页已有“新战斗闭环测试”入口。

状态：`PASS AS INDEPENDENT CONTINUOUS LOOP / MAINLINE MIGRATION NOT AUTHORIZED`。权威Review：`docs/LEARNING_INTENT_REPAIR_LOOP_V1_SOL_REVIEW.md`。下一步只能先做主线迁移影响清单与明确解冻任务，不得直接修改EP03。
