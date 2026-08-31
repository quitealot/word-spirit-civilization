# 水音大招样板 V1 · 素材记录

2026-08-31。使用内置 imagegen 图像编辑。未从参考游戏复制任何素材；未用脚本扣背景或重绘像素。

## 素材

- 参照：public/battle-ui/lange-cutout.png，既有1254×1254原立绘。
- 第一次输出：exec-73c8bea3-a6be-4b04-be1e-e3fea215e1a7.png，1774×887 RGB。虽然要求透明，但生成了烘焙棋盘，拒用，未进仓库。
- 第二次输出：exec-f22bc4f7-f01b-4d3b-8fe4-90ad078c3e0d.png，1774×887 RGB，深蓝不透明底，两格各887×887。
- 采用路径：public/battle-ui/lange-ultimate-poses-v1.png；输出字节原样复制。
- SHA256：7C99B90E0D0845B578DBDFADB720C898A156334657DABC88F0F22C1305B97C7B。
- 主代理与素材代理均查看结果。两姿态保持同一水灵轮廓和颜色：左格蓄力、右格前伸释放，原图朝左，运行时朝右。细部由生成重绘，不能声称逐像素保留原画。
- 修正背景不是精确恒定色：角落样本(3,23,41)/(2,24,42)/(2,22,40)，主要色(1,21,39)。不谎称真透明；在专属深蓝演出台上使用CSS径向边缘遮罩。未替换常驻立绘。
- 无新图片库/依赖。演出水流复用 water-surge.png。

## 精确提示词1（编辑原立绘；初版拒用）
```text
Use case: stylized-concept
Asset type: production game character pose spritesheet
Primary request: Create a new transparent 2:1 landscape spritesheet at exactly 2048x1024 pixels, containing exactly TWO evenly sized square pose cells side by side, each 1024x1024. Use the supplied image as the identity/style reference for the same recognizable original azure aquatic spirit, preserving its painterly finish and proportions. This is a production character pose asset, not a concept poster.
Input images: Image 1: reference image for character identity, silhouette, painterly rendering, colors, and proportions only.
Scene/backdrop: genuinely transparent background only; no environment, no checker pattern, no border, no divider, no labels, no text, no watermark.
Subject: the same slender azure aquatic spirit from the reference — big dark eye with cyan pupil, leaf-like dark-blue swept crown, slender arms, flowing leaf/water dress and tendrils, complete figure including water-tails. Do not redesign, simplify, chibi-ify, humanize, or add clothes or armor.
Style/medium: preserve the original painterly fantasy game-art finish, translucent layered aqua/cyan/teal water forms, dark blue crown and dress accents, crisp production-ready cutout edges.
Composition/framing: landscape canvas split into two equal square cells side by side with an invisible center boundary; one complete figure centered in each cell at a consistent scale, with approximately 10% padding on every side. Both figures face LEFT exactly like the source (runtime mirrors them). Keep each silhouette fully inside its own half and do not let tendrils cross the center boundary.
Lighting/mood: consistent soft luminous aqua painterly highlights and intentful cinematic action poses, matching the reference.
Color palette: azure, cyan, turquoise, teal, deep watery blue; no unrelated colors.
Materials/textures: flowing brush-painted water ribbons, leaf-like translucent dress/tails, soft painterly edges and internal watery highlights matching the source.
LEFT CELL — anticipation pose: torso gently leaning BACK toward the right; both elbows bent, both hands cupped together at chest/face height toward the left; eyes intent; ribbons rise upward.
RIGHT CELL — release pose: torso leaning FORWARD toward the left; both arms extended out toward the left at shoulder height; palms forward; ribbons sweep BACK toward the right.
Constraints: exactly two poses only; same character in both; consistent scale and visual identity; transparent alpha must be preserved; complete water-tails; no changes outside the stated pose differences.
Avoid: spell projectile, water orb, particles, sparkles, extra VFX, environment, scenery, ground, shadows, new character, human anatomy, clothing, armor, weapons, text, labels, borders, frames, checkerboard, white background, colored background, center seam, duplicated limbs, cropped figure, missing water-tails, facing right.
```

## 精确提示词2（编辑第一次输出；采用）
```text
Use case: precise-object-edit
Asset type: production game character pose spritesheet for a cinematic panel compositor
Primary request: Edit ONLY the background of the supplied two-pose spritesheet. Preserve both characters, their poses, silhouettes, proportions, scale, placement, spacing, and the entire canvas/layout exactly as shown. Keep the existing 2:1 landscape ratio and two evenly sized square pose cells side by side exactly unchanged. Replace every checkerboard/white background area with one perfectly uniform opaque very dark deep-navy background, exact color #031b29 (RGB 3, 27, 41).
Input images: Image 1: edit target; the existing two-pose Lange aquatic-spirit spritesheet. It is the sole source of truth for the characters, poses, layout, and rendering.
Scene/backdrop: a flat, seamless, uniform opaque deep-navy #031b29 background across the entire canvas, including behind and between both cells; no transparency.
Subject: keep the same two recognizable azure aquatic-spirit figures exactly as in the edit target: left anticipation pose with hands cupped and ribbons rising; right release pose with arms extended left and ribbons sweeping right. Preserve every water-tail, tendril, facial feature, crown, dress layer, highlight, edge, and painterly mark. Do not redraw or reinterpret the figures.
Style/medium: preserve the original painterly fantasy game-art finish exactly; background replacement only.
Composition/framing: preserve the exact original canvas dimensions, 2:1 ratio, two equal square cells, side-by-side placement, centered figures, padding, and invisible center boundary. No crop, resize, repositioning, mirroring, or layout change.
Lighting/mood: preserve the figures' existing aqua illumination and internal highlights exactly; do not relight or recolor the characters.
Color palette: characters remain their existing azure/cyan/turquoise/teal/deep-water-blue palette; the only new color is the uniform background #031b29.
Materials/textures: preserve all existing painterly water textures and edges; background must be a completely flat solid color with no texture.
Text (verbatim): ""
Constraints: background-only correction; replace all baked checkerboard/white background with solid #031b29; output intentionally opaque RGB with no alpha required; maintain both poses and all existing artwork exactly; no manual pixel editing, masking artifacts, or invented details.
Avoid: any checkerboard, grid, white or light pixels in the background, gradients, texture, noise, seams, center divider, border, frame, labels, text, watermark, particles, sparkles, spell projectile, water orb, environment, scenery, shadows, extra objects, extra characters, altered limbs, altered poses, changed scale, crop, resize, transparency, alpha checker pattern, recoloring, repainting, or simplification of either figure.
```
