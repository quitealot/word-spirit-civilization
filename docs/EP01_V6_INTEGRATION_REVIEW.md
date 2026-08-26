# EP01 v6 工程接入与回归记录

状态：`FROZEN / APPROVED`

唯一运行时内容真源：`app/narrative/ep01-v6.ts`

本次只迁移已经获 Sol 最终 PASS 的 EP01 v6，不修改、润色或补写正式文本；EP02 及以后内容没有扩写。

## 运行时场景链

```text
ep01.morning
→ ep01.north_view
→ ep01.qiaoyi
→ ep01.link_test_pre
→ initial-bond-test
→ ep01.link_test_result
→ ep01.spirit_choice
→ ep01.spirit_reselect（仅选择非推荐语灵）
→ ep01.partner.{芽语|烬尾|澜歌}
→ ep01.first_guide
→ ep01.departure
```

链接测试继续使用既有玩法实现：4 个行动倾向情境，随后按芽语、烬尾、澜歌的顺序各体验一次技能；每次技能调用 3 个正式 L1，共 9 词。`recommendedSpirit` 由行动倾向结果动态计算并写入存档。最终选择与推荐相同时跳过 `spirit_reselect`，不同时才播放该场景。

## v3 → v6 sceneId 迁移表

| v3 位置 | v6 位置 | 处理 |
|---|---|---|
| `ep01.morning` | `ep01.morning` | 保留对应 beat 位置 |
| `ep01.north_view` | `ep01.north_view` | 保留对应 beat 位置 |
| `ep01.cenpo` | `ep01.qiaoyi` | 确定性映射到最接近 beat |
| `ep01.spirits` 前段 | `ep01.link_test_pre` | 映射到测试前场景 |
| `ep01.spirits` 已进入选择 | 链接测试结束边界 | 由 checkpoint 或已有伙伴决定是否绕过测试 |
| 已选伙伴 | `ep01.partner.*` / `ep01.first_guide` | 不重新执行链接测试 |
| `ep1_lesson` | `ep01.first_guide` 的训练流程 | 保留训练进度与学习记录 |
| `ep1_outro` | `ep01.first_guide` 结果 + `ep01.departure` | 保留对应 checkpoint |
| EP02 或更后 | 原进度 | 不回退到 EP01 |

## 旧存档兼容策略

- 存档 schema 升至 v9；所有迁移先走统一 `migrateSave`，不直接重置存档。
- v3 的显式 `sceneId + beatIndex` 优先映射；只有缺少 sceneId 时才使用旧的扁平 `openingIndex`。
- 未选伙伴且仍处于旧开场的存档，映射到 v6 对应开场位置。
- 已经选过伙伴的存档直接保留伙伴，并进入现有伙伴后流程，不强制补做链接测试。
- 已在 `first_guide`、`departure` 或 EP02 之后的存档保留 checkpoint、训练结果、FSRS、XP、等级、技能、探索力与已完成关卡。
- v6 测试进行中会保存 `recommendedSpirit` 和最多 9 条链接证据；刷新后从结果、最终选择或非推荐确认场景继续。
- 链接测试答题证据只在最终选择伙伴后兑换为既有成长记录，沿用原有防重复证据键和成长数值。

## 自动恢复路径

`npm run validate:ep01-v6-migration` 覆盖以下路径：

1. 旧 `ep01.cenpo` 中途 → v6 `ep01.qiaoyi`。
2. 旧 `ep01.spirits` 选择边界 → v6 链接测试结束边界。
3. 已选择伙伴、尚未开始第一次引导 → 保留伙伴并绕过链接测试。
4. 第一次引导进行中 → 保留 `ep1_lesson` 与题目位置。
5. 已进入出发段 → 保留 `ep1_outro` 与出发位置。
6. 已到 EP02 → EP01 保持完成，不重新打开。
7. v6 链接结果页刷新 → 保留动态推荐、9 条答题证据和当前位置。

## 纯净存档手机实机路径

```text
第一屏《雾退了》
→ morning
→ north_view
→ qiaoyi
→ link_test_pre
→ 4 个行动倾向情境
→ 芽语技能体验（3 L1）
→ 烬尾技能体验（3 L1）
→ 澜歌技能体验（3 L1）
→ 动态推荐结果
→ 最终选择
→ 条件式 spirit_reselect
→ 对应 partner.*
→ first_guide（训练或跳过）
→ departure
→ EP01 完成并点亮 EP02
```

实机关注项：结果页不得写死推荐语灵；选择推荐语灵不得出现重新确认段；选择非推荐语灵必须出现一次 `spirit_reselect`；任一阶段刷新后不得回到开场或重做已经完成的链接测试。

手机视口回归（390 × 844）结果：PASS。

- 从纯净存档逐 beat 走完 `morning → north_view → qiaoyi → link_test_pre`，未出现旧 `cenpo / spirits` 场景。
- 4 个行动情境后依次出现芽语、烬尾、澜歌的技能体验，共完成 9 个正式 L1。
- 本次选择产生的动态推荐为“芽语”；结果场景和乔姨对白均正确代入“芽语”，未写死在内容层。
- 最终改选“烬尾”后仅出现一次 `ep01.spirit_reselect`，随后进入 `ep01.partner.jinwei`。
- 在第一次引导选择页刷新，恢复到同一选择页，没有回到开场或链接测试。
- 选择直接出发后完整播放 `first_guide → departure`；EP01 标记完成，EP02 正确解锁。

## 边界与停止线

- EP01 v6 正文永久冻结，遗留的 `DRAFT_FOR_SOL_REVIEW` 不作为运行时状态。
- 运行时状态明确为 `FROZEN_APPROVED`。
- 没有新增 L2/L3、语灵、成长数值或 EP02 内容。
- `app/narrative/ep01-v3.ts` 仅作历史参考，不再由活动场景注册表引用。

## 校验结果

- `validate:ep01-v6-migration`：PASS（7 条恢复路径）
- `validate:narrative`：PASS（0 errors / 0 warnings）
- `validate:initial-bond`：PASS
- `validate:learning-adventure`：PASS
- `validate:dev-presets`：PASS
- `lint`：PASS
- `build`：PASS

GitHub commit SHA：提交后记录于本次交付说明。
