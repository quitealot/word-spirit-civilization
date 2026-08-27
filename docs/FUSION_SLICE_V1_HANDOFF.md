# 语灵站日常 × HP测试战斗 · 最小融合切片 V1

状态：V1.1 已实现，等待 Sol 实机体验验收。

独立入口：`/prototype/fusion-slice`

## 本轮目的

只验证一条极短闭环：世界事件中真正学会词 → 同一份 Used 证据赋予 battleEligible → 技能区域内调用 → 敌方可见 HP 发生明确变化 → 战后只修复刚才的薄弱词 → 立即再挑战。

本轮不修改 EP01–EP03，不生成正式剧情、角色对白或新词源内容。

## 最终 Sol Review

- GPT 的定向审查通过：战斗词必须满足 `Used + battleEligible + 技能语义自然关联`。
- 普通战斗不得因直接挑战而塞入陌生词；没有合格词时仍允许无英语调用的直接挑战。
- 英语调用嵌在技能区域内，不跳转独立答题页。
- 即时技能效果只反映本次独立调用程度，不按答题速度惩罚：独立正确 100%，轻度支架后正确约 70%，错误约 40%。数值均配置化。
- 反应时间继续记录，可供 FSRS 与长期分析使用，但不直接削减当次技能效果。
- 战斗只给技能结果和伤害反馈；意义解释与修复放在战后针对训练。
- 正式文本缺口保持 `PENDING_K3`；本切片没有新增正式对白。

## 正式词源与本场调用关系

| wordId | word | 正式显示义 | battleEligible 条件 | 本场行动语义 |
| --- | --- | --- | --- | --- |
| w1718 | water | 水 | 零基础证据达到 Used/Maintained | 语灵站支援行动 |
| w729 | help | 帮助 | 零基础证据达到 Used/Maintained | 语灵站支援行动 |

二者均复用 `ZERO_BASE_WORDS`，没有复制或改写释义、例句或 wordId。完整性断言由 `validate:fusion-slice` 执行。

V1.1 取消 `water → 水音`、`help → 回潮` 的固定所有权。玩家先选择技能，系统再从本场同时满足 `Used + battleEligible + 行动语义匹配` 的候选池中确定“本次调用词”。技能按钮只显示技能名与原有技能效果；调用词只在技能选择之后出现。当前两个技能与两个词在本场“语灵站支援行动”语境下形成多对多候选，但不代表永久绑定，也不改变全局技能或词汇规则。

## 可玩分支

1. 完成 `/prototype/zero-base` 后，结算页可直接进入融合切片。
2. `water/help` 达到 Used 后才进入本场英语调用池；Retrieved 仍不够。
3. 玩家先选择技能，系统再从当前行动的合格词池中确定本次调用词，并在同一战斗面板内完成调用。
4. 敌人显示 60 HP；技能造成伤害，HP 归零即胜利。
5. 使用世界动作重演后正确，技能按 70% 发挥；错误仍按 40% 造成非零伤害。
6. 战后只列出本场真实薄弱调用，重新建立正式词义后立即再挑战。
7. 若没有 battleEligible 词，仍可选择“直接挑战”；本场使用基础技能，不出现陌生英语。

## 实现边界

- 新增 `app/game/fusion-slice.ts`：纯规则、资格判断、HP战斗结算。
- 新增 `app/prototype/fusion-slice/page.tsx`：独立验收入口。
- 零基础原型仅增加进入融合切片的链接，原教学链与正式词源不变。
- 公共即时战斗结算已取消“慢速正确=效果折损”；旧存档中的 hesitant 证据仅做兼容迁移。
- FSRS 的反应时间记录和长期调度职责保持不变。

## 自动验证

- `npm run validate:fusion-slice`
- `npm run validate:zero-base-teaching`
- `npm run validate:learning-adventure`
- `npm run validate:skill-guidance`
- `npm run validate:narrative`
- `npm run validate:gameplay`
- `npm run validate:ep01-v6-migration`
- `npm run validate:ep02-v1-1`
- `npm run validate:ep03-v1-1`
- `npm run lint`
- `npm run build`

## 实机只审四件事

1. 玩家是否觉得自己是在世界里学会这个词，而不是做完词卡。
2. 战斗再看到它时，是否理解自己正在调用什么。
3. 独立答稳后，是否能通过敌方 HP 明显感到技能更强。
4. 答错后，是否愿意修复刚才的词并立即再战。
