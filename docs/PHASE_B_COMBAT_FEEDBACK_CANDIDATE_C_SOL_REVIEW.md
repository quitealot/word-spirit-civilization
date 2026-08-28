# 《语灵》Phase B Candidate C：Sol Review

状态：`ENGINEERING PASS / PRODUCT PLAYTEST HOLD`
日期：2026-08-28
实现基线：`3665f6d11771163c307a799e4719b3def53a5c85`
交接基线：`e24756b328803859882dd14929a4c00861cbaf97`

## 1. 结论

Candidate C 工程实现通过，产品体验暂不直接判定通过。

已确认实现符合冻结目标：

- Phase B 继续使用玩家48 / 敌人80 / 敌伤14；
- Candidate C 仅在独立 Phase B 原型中测试 failed=25%、no-call=25%；
- V2 默认 Phase A / 历史 Candidate A/B 仍保留原基线；
- 水音 failed 为5伤害 + 5%下一击削弱；
- 回潮 failed 为3伤害 + 6回复；
- 玩家技能结果、敌方行动提示、敌方伤害结果按成熟顺序回合制分段呈现；
- 输入在结果阶段锁定；
- HP=0 后先明确显示“战斗失利”，再进入真实薄弱词 repair；
- 思考时间仍不影响即时倍率；
- EP01–EP03、主线、正式词源、成长、九技能全局配置与正式动画系统未被触碰。

Candidate C 现在真正需要验证的是“玩家是否能读懂代价、25%是否合适、节奏是否拖沓”，这些不能由自动 validator 代替。

## 2. 工程 Review

### PASS：倍率隔离

`resolveFusionBattleCall` 只新增可选 `qualityMultiplier` 注入，未注入时仍读取 V2 默认倍率；`resolveFusionNoCallTurn` 同理只新增可选 `noCallMultiplier`。Candidate C 不把25%写进全局默认规则。

### PASS：技能身份保持

25% 只缩放已有组件：

- 水音仍是伤害 + 下一击削弱；
- 回潮仍是伤害 + 回复；
- 没有因答错改变技能类型或跳过整回合。

### PASS：成熟顺序回合反馈

Phase B 非击杀回合按以下顺序执行：

`skill_result → enemy_prepare → enemy_damage → next_turn`

玩家技能结果先更新为 `stateAfterSkill`，随后才更新敌方行动后的最终 state，因此回复、伤害与 HP 变化不再挤在同一个瞬间。

当前原型节奏：

- 玩家技能结果约1200ms；
- 敌方行动提示约400ms；
- 敌方伤害结果约1200ms。

这些仅作为 Candidate C 可读性测试起点，不冻结为未来正式动画时长。

### PASS：反馈可读性结构

- 回复单独以绿色 `+N HP` 显示；
- 敌方伤害单独以红色 `-N HP` 显示；
- HP条有现有平滑过渡；
- 结果阶段不重新开放技能选择；
- timer 在重开/卸载时清理。

### PASS：战败语义

Phase B 失败后先进入明确的 `战斗失利` 状态，再显示真实 weakness 并进入 repair；不再把战败直接伪装成普通“再确认一下”。

## 3. 自动验证与回归

根据工程交接：

- Candidate C 专项：20/20 PASS；
- Candidate B：16/16 PASS；
- Candidate A：15/15 PASS；
- Phase B flow：16/16 PASS；
- skill-English V2 / fusion-slice / zero-base teaching：PASS；
- lint / build / git diff --check：PASS；
- 冻结文件审计：PASS；
- 390×844 无横向溢出、无运行时错误/警告。

这些结果支持“实现正确”，但不替代产品体验判断。

## 4. 当前产品 Review 只看四个核心问题

### A. 回潮 failed 是否终于读得懂

目标心智：

`回潮25% → 3伤害 +6回复 → 敌方行动 → -14HP`

玩家不需要心算，也应该能直觉理解：答错仍能行动，但这次回潮救不住局面。

### B. 25%是否过重

一次 failed 必须仍让玩家感到“可以救回来”，而不是“错一次就完”。若用户开始害怕尝试，25%过重。

### C. 约2.8秒非击杀反馈是否拖沓

重点不是数字本身，而是：

- 是否终于看清发生了什么；
- 是否已经慢到每回合都想跳过。

若可读但拖沓，下一步只调表现节奏，不再同时改数值。

### D. 战败是否清楚但不中断学习动机

“战斗失利”应让玩家明白确实输了，但不应像考试判错或羞辱；之后进入“处理刚才的问题 → 自动再战”应仍是连续体验。

## 5. 文档治理

仓库目前同时存在两份 Candidate C 前置任务文档：

- `docs/PHASE_B_COMBAT_FEEDBACK_CANDIDATE_C_TASK.md`
- `docs/PHASE_B_FEEDBACK_PACING_CANDIDATE_C_TASK.md`

两份方向高度重合。当前以实际实现交接所采用的 `PHASE_B_COMBAT_FEEDBACK_CANDIDATE_C_TASK.md` 作为 Candidate C 权威任务名；另一份只作为历史前置稿，不得再被 Codex 当成新的并行任务。

## 6. 当前停止线

Candidate C 当前状态：

`ENGINEERING PASS / PRODUCT PLAYTEST HOLD`

暂不允许：

- Candidate D；
- 继续改 failed/no-call；
- 继续提高敌伤；
- 把25%/25%写成正式 V2 全局值；
- 迁移主线九技能；
- 修改 EP01–EP03；
- 扩成长/动画/新系统。

只有用户实机回答第4节四个核心问题后，Sol 才做 Candidate C 最终产品裁决。