# 演出V3原创素材与完整提示词

两次均使用内置imagegen（不是CLI/API），由仅负责素材的Luna子代理执行，主代理检查后接入。未使用参考游戏的图像作为生成输入，未改任何生成像素/Alpha。生成请求2048×1024，实际均1774×887，CSS按4×2比例采样。水图RGBA、石图RGB，石图在屏幕混合模式下合成；两图有轻微配准漂移和峰值接近边界的问题，先作为原型资产。

## 水花

项目：`public/battle-ui/water-impact-atlas-v3.png`（1,721,379 bytes）。
来源：`C:/Users/孟誉/.codex/generated_images/01a055db-d454-7d63-bbc2-d008e61f333e/exec-f78b21e3-f0fb-4e28-b297-ca4802ff336e.png`。

```text
Use case: stylized-concept
Asset type: 2D RPG game VFX animation spritesheet
Primary request: Create one original raster VFX spritesheet for a rich magical water impact explosion. Exact canvas: 2048x1024 landscape. Divide the canvas into exactly 4 columns by 2 rows of equal 512x512 square cells, with no visible borders or separator lines, no labels, and generous pure-black gutters inside each cell. Read frames left-to-right across the first row, then left-to-right across the second row. This must be one continuous chronological animation of the same impact, not eight unrelated effects. Keep the identical exact center point and matching scale in every cell; contain all artwork within the central 80% of each 512px cell and never spill into neighboring cells.
Scene/backdrop: perfectly pure black opaque background in every cell for screen blending; empty black space is intentional.
Subject: a single magical teal-blue water impact at the exact center of each cell, evolving frame by frame:
Frame 1: narrow blue-white collision spark.
Frame 2: sharp four-point impact.
Frame 3: powerful bright turquoise water crown bursting radially.
Frame 4: fullest broad spiraling water burst with navy/cyan/white sharp painted foam.
Frame 5: curling water petal arcs breaking into droplets.
Frame 6: spreading lower-density spray.
Frame 7: only a few faint blue glowing droplets.
Frame 8: almost gone wisps, more than 85% black.
Frames 3 and 4 are the strongest, brightest, most spectacular hit.
Style/medium: original painterly fantasy 2D RPG hand-painted effects, crisp readable silhouettes, sharp painted foam edges, layered water ribbons and droplets, polished production game-art spritesheet; not pixel art.
Composition/framing: orthographic flat contact-sheet view; exactly eight isolated square cells in the stated 4x2 register, equal spacing, centered impact, generous black negative space, no cropping and no overlap between cells.
Lighting/mood: luminous turquoise-blue magical water glow against absolute black, with frame 3/4 peak intensity.
Color palette: teal, turquoise, cyan, deep navy-blue, white foam highlights; black background only.
Materials/textures: hand-painted fluid water, wet translucent ribbons, sharp foam and spray marks, small luminous droplets.
Text (verbatim): none.
Constraints: preserve exact 4x2 grid registration; each cell exactly 512x512; one consistent center and scale progression; all art inside each cell's central 80%; use the supplied 2048x1024 canvas size.
Avoid: borders, grid lines, separators, labels, numbers, text, logos, watermark, character, terrain, environment, forest, ruins, lightning, electricity, fire, smoke, unrelated effects, multiple centers, perspective distortion, pixel art, copied IP.
```

## 碎石

项目：`public/battle-ui/stone-impact-atlas-v3.png`（1,213,350 bytes）。
来源：`C:/Users/孟誉/.codex/generated_images/01a055de-581d-7cf2-a30b-e477be76abdd/exec-0e3864e9-eec7-4ecf-b112-bdf3b00b0130.png`。

```text
Use case: stylized-concept
Asset type: game VFX animation spritesheet / registered animation atlas
Primary request: Create exactly one original painted fantasy RPG VFX spritesheet on a 2048x1024 canvas. The sheet is a precise 4 columns by 2 rows grid of 8 equal 512x512 square cells. No borders, no grid lines, no labels, no captions, no UI. It must read as one chronological animation of the same heavy stone/bronze guardian impact explosion, with the same fixed center point in every cell. Each frame is isolated within roughly 80% of its cell, with generous pure-black gutters between effects. The eight frames are ordered left-to-right on the first row, then left-to-right on the second row:
1) small sharp gold-white contact star;
2) angular powerful gold starburst;
3) large explosive ochre/gold core with teal energy wisps and sharp flying stone fragments;
4) strongest dramatic outward smash, brilliant core, large angular shards, sharp motion streaks;
5) fragments spreading while the core fades;
6) dusty ochre/teal arcs and glowing embers;
7) only a few dim falling fragments;
8) faint disappearing dust, with more than 85% of that cell remaining black.
Keep the exact same center in every cell and keep every effect self-contained to its own cell. This is one registered animation sheet, not eight unrelated illustrations.
Scene/backdrop: pure uniform solid black background throughout, intended for screen-blend compositing; never gray, textured, transparent, checkerboard, or a scene/ground.
Subject: abstract heavy stone/bronze guardian impact explosion only; no visible character or guardian body.
Style/medium: original hand-painted fantasy RPG VFX sprite art, crisp readable silhouettes, high contrast, controlled painterly brush texture, production-ready game effect.
Composition/framing: orthographic flat atlas view, exact 4x2 equal-square cell layout, perfectly aligned rows and columns, identical fixed center in every cell, no overlap across cell boundaries, generous black gutters.
Lighting/mood: kinetic, weighty, dramatic impact; warm gold/ochre core contrasted by cool teal outer dust and wisps.
Color palette: gold-white highlights, warm ochre and bronze, cool teal accents, all against absolute black.
Materials/textures: angular stone shards, bronze-gold energy, dusty particulate arcs, crisp impact streaks, painterly but legible at game scale.
Text (verbatim): none.
Constraints: exact 2048x1024 output; exactly 8 frames; 4 columns x 2 rows; each cell exactly square; chronology as specified; same center registration; each frame isolated within its cell; pure black backdrop; no borders or labels.
Avoid: gray background, checkerboard, transparency, gradients filling the backdrop, characters, guardian figure, ground, environment, fireball, smoke cloud that fills a cell, text, logos, watermark, copied IP, extra frames, uneven cells, perspective collage, different centers, effects crossing gutters.
```
