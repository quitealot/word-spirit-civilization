# Skill × Guidance Prototype V1 · Sol Review

## 1. 实现差异清单

- 保持 Learning × Adventure Bridge V1、EP01剧情和EP02以后内容不变。
- 三只初伴均保留3个技能，并为9个技能增加稳定 `skillId` 与真实功能说明。
- 技能数值统一放入 `BRIDGE_V1_RULES`：基础效果、答错折损、迟疑倍率、原型敌方伤害与训练时长均可调整。
- 建立18个标志引导关系，全部引用正式80词池的原始 `wordId`，不复制或改写词义。
- 正常战斗仍由FSRS到期词、薄弱词和本次准备词共同选词；标志词只在候选词中给予配合提示，不是技能锁。
- 玩家词汇进度继续存放于 `word-spirit-learning-v2`；技能熟练、共鸣和配合记录单独存放于 `word-spirit-skill-guidance-v1`。
- 战斗薄弱证据由“只有wordId”扩充为“wordId + spiritId + skillId + quality + effectPercent”，因此针对训练可以明确回指刚才未完整发动的技能。
- 引导、维护、针对训练三种入口已换成验收文案，并显示相应的技能配合或实战薄弱状态。
- 增加独立验收页 `/prototype/skill-guidance`，不写入EP01剧情流程。

## 2. 标志引导词数据结构

```ts
type SignatureGuidanceRelation = {
  wordId: string;
  word: string;
  spiritId: '芽语' | '烬尾' | '澜歌';
  skillId: StarterSkillId;
  skillName: string;
};
```

18个关系位于 `app/game/skill-guidance.ts`。完整性校验会检查：数量必须为18、`wordId`不得重复、`wordId`与正式词池中的英文拼写必须一致。

## 3. 玩家层与语灵层

| 层级 | 保存内容 | 调度责任 |
|---|---|---|
| 玩家词汇能力 | FSRS卡片、作答次数、正确次数、层级、反应时间 | 决定长期复习与题目优先级 |
| 语灵技能关系 | 技能熟练、共鸣、见过的标志词、成功/迟疑/失败调用 | 记录技能配合，不创建第二份单词学习记录 |

因此，`maintain` 换到烬尾或澜歌仍沿用同一张FSRS卡；只有技能配合证据随具体技能分别记录。

## 4. 实机闭环记录

1. 打开 `/prototype/skill-guidance`，三个训练入口状态同时可见。
2. 芽语使用「护芽」，用正式词池中的 `maintain / w2341` 引导。
3. 故意答错：护盾按配置降为35%，只形成8/24点护盾。
4. 敌方造成40点伤害；伙伴初始32HP，扣除8点护盾后承受32点伤害，HP归零，战败。
5. 战报显示“护芽 ×1 未完整发动”“maintain 未稳定”“技能只发挥35%”。
6. 点击“针对训练 · 约40秒”，训练内容只来自刚才的 `maintain` 薄弱证据。
7. 答对后点击“再次挑战”。
8. 再次用 `maintain` 引导护芽并答对：形成24/24完整护盾，受到16点伤害，剩余16HP。
9. 页面给出训练前8点护盾与训练后24点护盾的直接对比。

## 5. 截图

- `docs/skill-guidance-screenshots/01-training-entrances.png`
- `docs/skill-guidance-screenshots/02-failed-battle-report.png`
- `docs/skill-guidance-screenshots/03-targeted-training.png`
- `docs/skill-guidance-screenshots/04-retry-result.png`
- `docs/skill-guidance-screenshots/05-mobile-entry.png`

## 6. 自动验证

- `npm run validate:narrative`：PASS
- `npm run validate:gameplay`：PASS
- `npm run validate:dev-presets`：PASS
- `npm run validate:learning-adventure`：PASS
- `npm run validate:skill-guidance`：PASS
- `npm run lint`：PASS
- TypeScript `--noEmit`：PASS
- `npm run build`：PASS
- 浏览器控制台错误/警告：0
- 390×844手机视口：页面宽度375px，未出现横向溢出

## 7. 停止线核对

未制作EP02正式剧情、未新增语灵、未制作进化树、未生成L2/L3、未扩写世界观、未制作复杂技能树、未增加属性克制。
