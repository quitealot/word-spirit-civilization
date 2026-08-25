# Vertical Slice RC1验收记录

提交前状态：RC1代码与内容裁决已完成；真实点击路径尚未签字通过。

## 自动与静态验证

| 检查项 | 结果 | 证据 |
|---|---|---|
| 项目代码检查 | PASS | `npm run lint` |
| 正式构建 | PASS | `npm run build` |
| Git差异格式 | PASS | `git diff --check` |
| L2裁决数量 | PASS | 27 PASS / 9 REVISE；9题均含语境、sense、答案、干扰项与理由 |
| L3裁决数量 | PASS | 23 PASS / 1 REJECT；L3-21退回L1/L2 |
| 战败终态 | PASS（代码路径） | HP归零后`outcome=defeated`，清空当前题并只展示重试/退出 |
| FSRS证据保留 | PASS（代码路径） | `recordLearningAnswer`先于伤害与战败判断；重试只重置组件内战斗状态 |
| 剧情不误完成 | PASS（代码路径） | 战败不调用`onWin`；只有敌方HP归零才进入胜利回调 |

## RC1人工路径

要求路径：三选一 → EP01连续剧情 → 3个L1 → EP02 → EP03 → 连续答错战败 → 重新挑战 → 胜利 → EP04绒岚目击 → 中途刷新 → 恢复并继续。

当前执行环境的内置浏览器对`http://localhost:3000`返回URL安全策略阻断。该策略明确禁止改用旁路自动化，因此本次没有伪造人工点击结果。以下项目保持`PENDING HUMAN RUN`，不得写成PASS：

| 人工检查项 | 状态 | 已确认的代码约束 |
|---|---|---|
| 每一步是否可达 | PENDING HUMAN RUN | EP01断点、探索力阈值、EP02–04节点仍保留 |
| 战败后FSRS记录是否保留 | PENDING HUMAN RUN | 重试不调用学习存储重置 |
| 战败是否错误完成EP03 | PENDING HUMAN RUN | 战败分支不调用`onWin/complete` |
| 重试是否正常 | PENDING HUMAN RUN | 重置双方HP、题目、技能、消息、错词优先与换位状态 |
| EP04绒岚目击状态 | PENDING HUMAN RUN | EP04完成写入目击2/3；图鉴显示绒岚、未共鸣 |
| 刷新后剧情/存档是否连续 | PENDING HUMAN RUN | EP01三段断点持久化；战斗本身不新增持久化系统 |
| 跳首页/重复领奖/重复共鸣/死路 | PENDING HUMAN RUN | 本轮未声称通过 |

## RC1停止线

- 未制作EP05–10新内容。
- 未扩竞技、升星、后端或其他新系统。
- L2/L3未导入运行时。
- 下一步只能先完成上述真实点击路径并由Sol做体验Review。
