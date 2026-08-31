# 水音大招演出样板 V1 · 任务与交接

日期：2026-08-31
状态：ENGINEERING PASS / DYNAMIC PLAYTEST PENDING
基线：3ffe559（已发布运行版4749e45 / Site32）。

## 授权与范围

用户在认可演出V3后提出“技能动画”“口袋觉醒释放大招的究极动画”，随后确认“对”。本轮只把澜歌水音做成3–4秒专属镜头样板；不加正式大招、能量、冷却、倍率或剧情。保留原常驻立绘、遗迹背景与UI。新姿势只出现在该招切镜中，仍有生成细节漂移，不冒称原画逐像素不变。

沿用上一轮已查阅的成熟演出参考及其限制，见 BATTLE_UI_CINEMATIC_V3_TASK.md / HANDOFF.md。借鉴特写—蓄力—释放—受击的节奏，不搬运对方角色、画面或素材，不宣称本轮重新完成逐帧视频研究。

## 实现

入口仍是 /prototype/battle-ui。默认勾选“水音 · 大招演出样板”；等待素材准备后选择水音并确认。取消勾选可对比原2.2秒短版；开关只能在选择阶段切换，不写存档。

| 时段（约） | 表现 |
| --- | --- |
| 0–0.68秒 | 角色近景与水音标题 |
| 0.68–1.45秒 | 专用双手蓄力姿势、聚水 |
| 1.45–2.10秒 | 专用向前释放姿势、水流推进、擦镜回场 |
| 2.20秒 | 单次命中：HP、伤害数字、原八帧水花、敌方回弹同步 |
| 2.20–3.80秒 | 结果阅读；之后原敌方准备/出手顺序 |

演出封闭在战场区域，不晃HP/操作面板。新增两帧动作插画+镜头/水流合成，不是全身骨骼或完整手绘逐帧动画；不把两张关键姿势说成商业游戏同等级动画。

water-ultimate-motion.ts 独立提供3800/2200时间；旧water-motion.ts与battle-motion.ts未改。逻辑结算仍由demo-model完成且仅一次；界面只投影延迟HP。预解码图片，未载入/失败走短版；每次施放时快照选择，迟到的素材不会中途改时间。系统减少动态时停用切镜。手动下一步先揭示命中，遮罩即时消失；重开清理本次选择与显示key。

## 验证

- 新专项18/18。
- 原battle-ui39、boss28、impact-v2 21、cinematic-v3 19：合计125项通过。
- 唯一旧测试调整：原“所有技能使用原单臂动作”的页面静态断言明确改为非大招时使用，要求大招时抑制重复单臂轨道。其余断言未放宽；新18项补充该分支。
- intent-combat-v1（19项）、skill-english-v2、fusion-slice回归通过。
- 页面+新validator strict TypeScript通过。
- 范围ESLint：0错误、10个原生img警告（本轮增加1个）。全库lint仍失败于两份既有CJS绘图脚本，共4个require错误；未处理无关文件。
- npm run build成功；本地页面与新图HTTP200；git diff --check通过。
- 冻结文件diff：app/page.tsx、app/game/**、app/narrative/**、旧教学/融合/Intent原型、demo-model.ts、battle-motion.ts、water-motion.ts均零改动。玩家48HP、敌60HP、BOSS14/28；三技能数值全部不变。
- 实际查看了两次生成图。初次假透明棋盘被拒用，修正图确认无棋盘。保存的PNG保持生成原始字节。
- 本轮没有浏览器点击/截图或390×844动态实机验收，不把代码断言/HTTP200等同视觉和手感通过。

## 改动路径

- app/prototype/battle-ui/page.tsx
- app/prototype/battle-ui/water-ultimate-motion.ts
- app/prototype/battle-ui/water-ultimate.tsx
- app/prototype/battle-ui/water-ultimate.css
- public/battle-ui/lange-ultimate-poses-v1.png
- scripts/validate-water-ultimate.ts
- scripts/validate-battle-ui.ts（单个接线断言）
- 本交接、WATER_ULTIMATE_V1_ASSETS.md、CODEX_PROJECT_MEMORY.md

## 待用户体验审查 / 停止线

1. 刷新当前试玩，素材准备后水音能否清楚看到近景→蓄力→伸手释放→回战场扣血。
2. 关闭样板对比短版；水音18伤害/20%削弱不变，回潮/静波/BOSS节奏不变。
3. 手机下角色/标题是否遮挡，转场是否生硬；恢复自动/手动揭示、重开、击杀不反击。
4. 慢网络/素材失败使用原短版，减少动态偏好不播放切镜。

主要风险：两张关键帧之间仍依靠快速转场遮接，非连续完整身体动作；深蓝不透明图底在特殊屏幕可能看到轻微色差，已用运行时边缘遮罩衔接；低端微信环境、移动GPU与动态体验尚未测。本轮到单招样板结束，不扩其他角色/技能，不继续数值平衡。发布证据在完成部署后补记。
