# Gameplay Skeleton Handoff（提交 Sol Review）

状态：`STATIC_VERIFIED_PENDING_HUMAN_RUN`

本轮只完成剧情/玩法解耦与 EP05–EP10 Gameplay Skeleton。没有创作正式对白，没有接入 L2/L3，没有扩真实竞技、升星或后端。

## 1. 解耦后的文件结构

```text
app/
  page.tsx                         # 页面编排与现有 UI
  learning-engine.ts               # L1 与 FSRS 调度
  vocabulary.ts                    # 正式词库入口
  game/
    episode-config.ts              # 集数、解锁、交互、战斗与完成效果
    progression.ts                 # Boss 题层上限与换位规则
    save.ts                        # v3 存档、迁移、章节状态 helper
    spirit-config.ts               # 语灵机器配置与技能配置
  narrative/
    types.ts                       # NarrativeBeat / NarrativeScene schema
    temporary-content.ts           # TEMPORARY_CONTENT_PENDING_K3
docs/
  NARRATIVE_HANDOFF_FOR_K3.md
  SOL_GAMEPLAY_SKELETON_HANDOFF.md
```

`page.tsx` 不再保存 Opening、初伴观察、EP01–EP10 或战后对白数组。玩法通过 episode config 和 narrative 内容层接入。当前页面仍较大，Battle/UI 组件拆分留作后续小步迁移，不为架构重写可运行系统。

## 2. K3 内容接口

交付文件：[NARRATIVE_HANDOFF_FOR_K3.md](./NARRATIVE_HANDOFF_FOR_K3.md)。

接口定义 `dialogue`、`narration`、`action`、`choice`、`interaction` 五种积木。K3 只需交付稳定 scene/beat id、人物与文本，不写 React/TypeScript，不决定解锁、战斗、学习、奖励或存档规则。正式稿按 `sceneId` 替换内容层，不修改玩法代码。

## 3. EP05–EP10 骨架状态

| 集数 | 已接入玩法流程 | 状态 |
|---|---|---|
| EP05 | 寂静广场节点、群落展示位、蚀影战、战后节点、第三次目击、`sightings = 3`、EP06 解锁 | 静态完成，待实机 |
| EP06 | 三阶段接近、共鸣确认、绒岚获得、双伙伴队伍/图鉴、防重复获得、断点保存 | 静态完成，待实机 |
| EP07 | 双伙伴战、必须换位一次、换位状态/冷却字段、战后接口、EP08 解锁 | 骨架完成；战术价值待 Review |
| EP08 | 碑正/背面、残字与位置记录、旧擂台解锁、可选竞技快照；跳过竞技可推进 | 静态完成，待实机 |
| EP09 | 三个追踪槽，每槽恰好一次 L1 行动、稀有试探战、不捕捉、线索 1/3、天空剪影、图鉴 | 静态完成，待实机 |
| EP10 | 三阶段 Boss、三重题层上限、连错降级、战败重试、双伙伴可通关、章末地图/三钩子 | 静态完成，待实机 |

全主线只依赖 L1。L2/L3 不按集数或 Boss 阶段强塞。

## 4. `PENDING_K3` 清单

当前 Opening、EP01–EP10、战前/战后、绒岚接近动作、无名碑内容、稀有语灵事件、天空剪影、守门人及章末叙事全部仍是 `TEMPORARY_CONTENT_PENDING_K3`。页面中的 `[PENDING_K3]` 是明确占位，不代表正式内容。

现有 Opening/EP01–EP04 文本原样迁移，仅用于维持测试版本可运行；EP05–EP10 旧文本同样只作兼容测试内容。Codex 未新增正式剧情答案。

## 5. Opening / EP01–EP04 兼容性

- v3 存档保留旧 key，并提供旧结构迁移和缺省状态补齐。
- 三选一、Opening/EP01 断点、探索力、已完成集数、伙伴与目击状态均进入统一存档层。
- EP01 完成会清除剧情断点；重新开始会同时清理新旧存档和学习记录。
- 内容数组从页面迁出，现有调用已改接临时内容层。

结论：类型检查、lint、build 兼容；从全新/旧存档的完整点击回归仍标记 `PENDING HUMAN RUN`，不能用静态构建冒充实机通过。

## 6. 检查结果

- `npm run lint`：PASS
- `npm run build`：PASS
- `git diff --check`：提交前复核
- 旧存档迁移：代码路径已实现，PENDING HUMAN RUN
- EP01–EP04 实机回归：PENDING HUMAN RUN
- EP05–EP10 骨架回归：PENDING HUMAN RUN

## 7. 真正尚未完成的玩法系统

- K3 正式稿导入、内容校验器和 Sol 整体一致性 Review。
- EP05–EP10 全流程人工试玩与断点/刷新回归。
- EP07 两伙伴各自 HP/状态与换位冷却的真实战术价值；当前只验证骨架和必要换位。
- Boss 战中刷新恢复完整战斗现场；当前保存最高阶段，不保存本场全部 HP/题目状态。
- 等级/经验与共鸣的完整反馈闭环；正式升星继续后移。
- 真实异步竞技；当前仅本地测试快照。
- L2 9 个 REVISE、L3 Review 后的运行时接入；当前不阻塞 L1 通关。
- 正式美术、声音与演出资源。

## Handoff 结论

本轮请求 Sol 做静态架构/流程 Review，并安排后续人工实机回归。未通过实机前，EP05–EP10 只能称为 Gameplay Skeleton，不能称为十关成品。
