# BOSS技能 / 回潮与静波动画交接

2026-08-31。工程与资产姿势检查通过；产品手感待用户试玩。

入口：`/prototype/battle-ui`。任务：`BATTLE_UI_BOSS_SKILLS_TASK.md`。

## 本次结果

- 页面独立选用 `gatekeeper-v1`，HP仍48/60；BOSS石拳16伤害、震击36伤害固定交替。沿用历史48/60/8的默认夹具保留，不覆盖其他原型。
- BOSS技能有图标、提前意图、可展开介绍，玩家选招后显示削弱/减伤后的伤害；可击杀时注明不反击。
- BOSS原图的小臂独立旋转：出拳和举臂重击两条动作轨道，附金色冲击、命中环与光点。
- 回潮有向外引流/回收、手臂收回、回复光效；静波有抬手持护幕、环流及回复。水音原2.2秒演出保留。
- 玩家三招和BOSS全部使用40%时点显示结算结果：水音/静波0.88秒，回潮/BOSS0.96秒。伤害/回复/HP同时揭示，逻辑不重复结算；结果至少保留1.2秒。
- 自动暂停只停阶段推进，当前演出继续。手动下一步先揭示待显示结果，再推进；重开清理展示key。减少动态效果模式不等待命中，并隐藏关节/特效。
- 旧HP残影不随phase重播修复保留。

## 验证证据

- `node --experimental-strip-types scripts/validate-battle-ui.ts`：39/39。
- `node --experimental-strip-types scripts/validate-battle-ui-boss.ts`：28/28。
- 旧validator只更新3项UI布线断言以对应新组件；原数值/顺序/HP行为断言未放宽。
- 穷举至8回合：HP始终合法，26条终止胜利路径；全水音第3回合败；水/水/潮/水第4回合胜、12HP；全回潮第6回合胜、32HP；水/波/潮/潮/潮/水第6回合胜、18HP。
- 局部strict类型通过（命令带 `--allowImportingTsExtensions`）；局部ESLint零错误、7条img性能警告。
- 全库lint仍失败于此前两份 `docs/concepts/*.cjs` 的4个require错误，本轮没有修改或压制。
- `validate:intent-combat-v1` 19/19、V2、fusion-slice回归通过；完整build通过；diff check通过。
- 使用真实组件SVG裁切渲染BOSS 0/35/80/135度、澜歌38/95/112度；检查7张资产姿势。BOSS验证画布向左扩展，确认拳头不是被原图边框裁掉。不是浏览器页面截图，不是手机真机验收。
- 本轮未进行浏览器点击、390×844路径或手机动画手感检查，不将以上静态资产检查称为实机PASS。
- 冻结范围审计：app/page、app/game、其他原型、EP01–03、词源和存档均无diff；原背景/澜歌/BOSS原图无改动。

## 素材记录

内置imagegen一次编辑，用于补出原图小臂后方的接缝，不重画整只BOSS。源：`public/battle-ui/gatekeeper.png`。

生成原始文件：`C:/Users/孟誉/.codex/generated_images/01a055a6-d439-7b33-8afe-eaafbfc5f2f6/exec-8ba0d4e2-40a8-4579-9dc4-cf1d9b75b5c3.png`。

入库：`public/battle-ui/gatekeeper-seam-source.png`，1024×1536，RGB。只显示肩/躯干接缝polygon，不能当透明整图替换角色。资产代理另做的alpha后处理版本未采用、未入库；全部角色可见主体仍来自原图。

实际提示词：

```text
Use case: precise-object-edit
Asset type: game battle UI character sprite
Input image: Image 1 is the edit target; use it as the exact source and preserve its composition and character design.
Primary request: On the 1024x1536 source canvas, remove ONLY the small hanging arm on the IMAGE LEFT / viewer-left side of the gatekeeper, starting below its left shoulder plate. The intended removed region is roughly x130–268, y594–794 for the upper arm and including the forearm/fist roughly x25–222, y735–976. Naturally reconstruct the left torso/hip and nearby armor, cloth, and lighting that were behind that removed arm so the result reads as a clean, believable single-arm pose.
Composition/framing: Keep exactly the same 1024x1536 canvas, framing, scale, camera angle, pose of every remaining part, and placement of the character.
Style/medium: Preserve the existing high-detail dark fantasy stone-and-bronze guardian illustration, materials, texture, teal magical glow, moss, and painterly rendering exactly.
Color palette: Preserve all original colors, contrast, highlights, shadows, mist, and atmosphere.
Transparency: Preserve the source's genuine alpha/transparency exactly where applicable; output must have a real transparent alpha channel, never a checkerboard pattern painted into the image.
Constraints: Change only the specified small IMAGE LEFT hanging arm and the immediately hidden torso/hip patch needed to repair its removal. Keep the face, head, horns, hair, neck, chest, all shoulder armor, belt, cloth, torso outside the repair, the entire large IMAGE RIGHT arm, both legs, feet, background, mist, effects, colors, and all other pixels unchanged. Do not remove or alter the large arm on IMAGE RIGHT. Do not redesign, add limbs, change the pose, crop, resize, or introduce new objects.
Avoid: any edit to the large IMAGE RIGHT arm; extra arms or hands; pose redesign; regenerated character; changed face or armor; changed background; checkerboard-looking transparency; text; watermark.
```

## 风险 / 停止线

这是原画裁切单关节动画，不是全身骨骼；大幅放大可见局部接缝和旧澜歌白边。回潮连续使用仍存在慢速胜利路线，未声称最终平衡通过；它与快攻在回合数/剩余HP间取舍。BOSS名称/技能只作系统样机标签，非新增正式世界观。无声音、元素、资源或新成长系统；不扩主线。发布完成后追加精确SHA和版本。
