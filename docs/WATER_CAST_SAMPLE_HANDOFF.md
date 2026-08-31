# 水音抬手施法样板交接

2026-08-31；用户同意先做澜歌水音一招。当前为样板，待用户体验确认后才扩其他动作。

## 做了什么

- 保持原立绘：在SVG容器中裁切原bitmap为身体/施法臂，围绕肩部独立旋转，配合小幅身体后收和前送。SVG只承担裁切/分层，不用路径重画角色。
- 手臂0→后收-7→聚水68→释放88→收手0度。是单肩关节的有限2D分层动作，不是全身骨骼系统，不伪称Spine绑定。
- 聚水光、旋转细环、新制透明水流、命中圈与6个水滴；特效只在战场内，不接收点击。
- 水音展示2200ms，880ms命中时才显示残血/伤害数字。逻辑伤害仍由原reducer一次计算；UI时间不影响命中、伤害或胜负。
- 水流预加载；减少动态偏好下显示原静止立绘并跳过命中等待。两套计时器均有清理；手动跳阶段不残留旧HP。

## 没做什么

- 没有调整BOSS压力；48/60/8、三技能效果完全保留。
- `demo-model.ts`、其他原型、主入口、game、narrative、EP01–EP03、存档、英语源、成长未改。
- 没扩回潮/静波的抬手动作，没换原画、没做3D、没换渲染引擎。

## 先验与取舍

先查 [Spine官方运行库](https://github.com/EsotericSoftware/spine-runtimes) 与 [Pixi Spine集成](https://github.com/pixijs-userland/spine)。采用局部图层+关节的既有做法，不复制运行库/素材；当前没有可用Spine骨骼数据，也未新增许可与依赖。详细范围见 `WATER_CAST_SAMPLE_TASK.md`。

## 素材

- `public/battle-ui/lange-cutout.png`：原RGB/Alpha文件原样保留，运行时裁切出手臂。
- `public/battle-ui/lange-shoulder-source.png`：内置imagegen编辑，1254×1254。输出不具备Alpha且存在棋盘格，**不作为整张透明角色使用**；只把完全位于肩部内部的小补片用于填补拆层处，其他生成像素不显示。
- `public/battle-ui/water-surge.png`：内置imagegen生成，1672×941，RGBA，真实透明。右边缘有很淡的光晕，主水花未被裁切。
- 旧角色/背景/BOSS文件未覆盖。

### 肩部编辑实际prompt

```text
Use case: precise-object-edit
Asset type: game character animation layer
Primary request: Edit the provided character cutout with one surgical change: remove ONLY the character's arm on the image LEFT, the arm extending from approximately shoulder x490 y550 down-left to the fingers around x350 y710. Remove that entire left-side arm cleanly, including the hand and fingers. Repair only the tiny shoulder/body area that was formerly covered so the remaining shoulder edge is natural and consistent with the original.
Input images: Image 1 is the edit target and the sole source of truth.
Subject: Preserve the exact same approved water-spirit game character.
Style/medium: Preserve the original painted fantasy game-art illustration exactly.
Composition/framing: Preserve the exact 1254 x 1254 square canvas, pixel layout, scale, placement, pose, silhouette, and alignment. Do not crop, resize, shift, recompose, or redraw unrelated areas.
Lighting/mood: Preserve the original lighting and shading.
Color palette: Preserve every original color and value outside the removed arm.
Materials/textures: Preserve the original translucent water, hair, dress, body, and tendrils with no changes outside the surgical removal.
Constraints: Change only the image-left arm and the minimal shoulder/body pixels needed to close the gap. Keep the other arm on the image RIGHT completely unchanged. Keep the head, face, hair, all water tendrils, torso, dress, legs/tail, droplets, and every other pixel/edge in the same position and appearance. Output a real transparent-background PNG with a true alpha channel, not a checkerboard painted into the image. Maintain the original transparent canvas and keep all unchanged transparent regions transparent.
Avoid: any redesign, identity drift, pose drift, scale drift, alignment drift, extra limbs, arm remnants, accidental removal of the image-right arm, changes to hair/head/tendrils/body/dress, new background, checkerboard pixels, text, symbols, effects, glow, particles, watermark, or canvas-size change.
```

### 水流实际prompt

```text
Use case: stylized-concept
Asset type: isolated horizontal water-magic impact/splash sprite for a mobile fantasy game battle UI; final raster PNG with genuine transparent alpha
Primary request: Create one elegant, bright cyan and turquoise magical water surge moving clearly from LEFT to RIGHT. It is a horizontal ribbon of liquid with visibly fluid, painterly curled edges, layered flowing folds, and a concentrated burst of small water droplets at the RIGHT impact end. The motion should read instantly at mobile scale.
Scene/backdrop: no scene and no backdrop; the entire area outside the water effect must be genuinely transparent
Subject: a single sweeping horizontal ribbon of liquid water, slightly tapering and curling through the body, with a stronger splash/impact bloom and scattered droplets only at the rightmost end
Style/medium: painterly luminous fantasy game VFX sprite, clean readable silhouette, hand-painted brushwork, polished production asset
Composition/framing: wide horizontal composition with generous empty transparent margin around the ribbon and especially around the right-side droplets; keep the main surge centered vertically; leave all edges isolated and unclipped; no circular frame
Lighting/mood: energetic magical motion, crisp internal highlights, restrained glow; luminous but not a screen-filling opaque white bloom
Color palette: match the supplied reference palette—saturated bright cyan/turquoise water, richer teal and ocean-blue shadow strokes, cool blue midtones, pearl-white highlights used as small specular accents; avoid muddy green or purple
Materials/textures: translucent liquid layers, glossy pearl-like glints, thin streams, curled wave tips, varied droplet sizes, soft painterly edges while preserving a clean game-sprite silhouette
Text (verbatim): none
Constraints: one isolated effect only; transparent background with preserved alpha; left-to-right directional read; right-end impact burst; enough negative space for every droplet; optimized for mobile readability
Avoid: characters, creatures, hands, scenery, floor, cast shadow, text, logos, watermark, UI, circular frame, border, checkerboard pattern, opaque white background, giant white flash, smoke, fire, lightning, unrelated objects, cropped droplets, vertical composition, multiple separate effects
```

## 验证与边界

- 原30项未删除，专项增加9项，总计39/39通过。
- strict局部TypeScript通过；局部ESLint 0错误、4条img性能警告。
- 完整build、Intent Combat 19/19、V2、fusion-slice、diff check通过。
- 全库lint仍有旧两份concepts CJS的4个require-import错误，未放宽规则。
- `scripts/review-water-rig.mjs`渲染真实组件SVG图层的0/35/68/88度姿势，并逐张检查肩部、原画保持和抬手差异。输出在ignored `outputs/water-rig-review/`，只是资产检查图，不是游戏截图或运行资产。
- 未在本轮执行浏览器点击/手机真机测试；不能把上述静态姿势检查称为实机手感验收。完整水音节奏、手机实际表现待用户体验。
- 保留原图已有细小浅色抠图边缘；本轮不另行重画整只澜歌解决这一旧问题。

## 发布

- 运行SHA：`ec19aaf7d5c0604405793e99d4b13e52d94483c1`，已推送GitHub及Sites源仓库。
- 私有站点版本29，部署succeeded，原owner-only权限未变。
- 入口：https://word-spirit-civilization-demo.eeevan137.chatgpt.site/prototype/battle-ui
- 发布补记为后续docs-only提交，不改变上述运行代码。
