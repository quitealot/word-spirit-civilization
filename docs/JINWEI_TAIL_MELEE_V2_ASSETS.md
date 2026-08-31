# 焰尾四姿势素材记录

方式：内置imagegen（素材代理，仅素材，无源码/Git/Sites权限）。项目路径public/battle-ui/jinwei-melee-poses-v1.png。采用源C:/Users/孟誉/.codex/generated_images/01a056ac-1d3d-7473-af5c-44930f6a66c2/jinwei-melee-poses-alpha.png。
生成输出未能给出有效透明；代理制作alpha副本：RGB保留，近中性高亮(max-min≤12、mean≥215)边界连通区与≥100像素独立区域透明，其他alpha255。主代理不再次编辑像素，读alpha和视觉审查接入。1254方图/627方格。二值边缘存在毛边风险。

## 初始生成提示词

Use case: stylized-concept
Asset type: game battle animation sprite sheet
Primary request: Create ONE single square transparent PNG sprite sheet containing exactly four separate full-body poses of the original Jinwei fox spirit, arranged as a strict 2x2 grid of four equal square cells. Treat the supplied reference image as the identity reference for Jinwei only: preserve the same gold-orange fox face, very tall upright ears, amber eye, cream muzzle and chest, ornate gold shoulder armor, and the same large attached orange-gold flame tail.
Input images: Image 1: reference image for character identity, colors, armor, face, ears, and flame-tail construction.
Scene/backdrop: genuinely transparent alpha across the entire canvas; no environment or backdrop.
Subject: the same single original fox spirit character repeated once in each cell, one complete creature per cell, all at equal head/body scale, each fully inside its own cell with approximately 12% transparent margin around the cell content and feet/baseline near the lower 80% of each cell. The creatures must not touch, overlap, or cross cell boundaries.
Style/medium: polished non-chibi painted fantasy game art, expressive anatomy and readable action silhouettes, rich brush-painted fur and flame detail matching the reference.
Composition/framing: exact square canvas with four equal square quadrants, no visible dividers or borders. Top-left: right-facing running pose with forelegs and hind legs extended in a long stride. Top-right: right-facing running pose in the gathered-leg phase of the run cycle. Bottom-left: left-facing sideways turn/swipe pose, body facing left while the attached flaming tail sweeps prominently to the RIGHT into the opponent; tail must visibly emerge from the hip and remain connected. Bottom-right: left-facing airborne jump, tucked hind legs and forepaws reaching left.
Lighting/mood: clean readable game-asset lighting, warm highlights within the character, no cast shadow or scene lighting outside the creature.
Color palette: Jinwei’s gold-orange fur and vivid orange/yellow flame tail, cream accents, warm antique-gold armor, amber eye.
Materials/textures: detailed painted fur, layered flame ribbons and armor engraving; preserve the original flame-tail identity.
Text (verbatim): none.
Constraints: output exactly one 2x2 sprite sheet; exactly four full creatures; exact equal square cells; same character identity and scale; true transparent alpha, not a checkerboard or black background; each cell independently usable; no text, no labels, no watermark.
Avoid: borders, grid lines, cell backgrounds, backdrop, glow halo, enemy, opponent body, extra characters, detached fireballs, disconnected flames, cropped limbs, cropped tails, malformed anatomy, chibi proportions, icons, or repeated miniatures within a cell.

## 第一次透明重试

Use case: background-extraction
Asset type: game battle animation sprite sheet
Primary request: Edit this existing 2x2 Jinwei sprite sheet with ONE targeted change only: replace the baked checkerboard backdrop with a genuinely transparent PNG alpha channel. Preserve every one of the four fox drawings exactly in place, with the same poses, silhouettes, identity, colors, armor, flame tail details, scale, margins, and strict equal-square 2x2 layout. Remove only the checkerboard pixels; do not redraw, crop, resize, mirror, reposition, or reinterpret the characters.
Input images: Image 1: edit target, the existing four-pose Jinwei sprite sheet.
Scene/backdrop: fully transparent alpha outside all character pixels; no visible background of any kind.
Subject: the same four complete Jinwei fox spirit poses, unchanged.
Style/medium: preserve the existing polished non-chibi painted fantasy game art.
Composition/framing: preserve the exact square canvas and four equal quadrants; no dividers or borders; each creature remains fully inside its own cell.
Text (verbatim): none.
Constraints: output a true RGBA PNG with transparent pixels, not a checkerboard, white fill, black fill, or transparency simulation. Keep all creature pixels and edges intact.
Avoid: any other visual change, pose drift, altered anatomy, extra fire, glow backdrop, text, labels, watermark, borders, or grid lines.

## 第三次工具调用（未采用）

Use case: background-extraction
Asset type: game battle animation sprite sheet
Primary request: Edit this current Jinwei 2x2 sprite sheet to remove ALL white and light-gray checkerboard squares from the visible image and output a genuinely transparent RGBA PNG. The checkerboard is unwanted background, not part of the artwork. Preserve the four existing Jinwei fox drawings exactly: same poses, silhouettes, facial identity, tall ears, shoulder armor, attached flame tails, colors, scale, positions, margins, and strict equal-square quadrants. Change only the background transparency.
Input images: Image 1: current edit target sprite sheet.
Scene/backdrop: zero visible backdrop; every pixel outside the four creatures, including all enclosed holes between flame ribbons, must be fully transparent alpha 0. Do not render, paint, or bake any white, light-gray, gray, black, checkerboard, grid, or solid-color background.
Subject: exactly the existing four complete Jinwei poses, unchanged.
Style/medium: preserve the polished non-chibi painted fantasy game art.
Composition/framing: preserve the exact square canvas and four equal 1:1 quadrants; no divider lines; no crop, resize, reposition, redraw, mirror, or pose changes.
Text (verbatim): none.
Constraints: final file must be a real RGBA PNG with alpha transparency, with all background pixels alpha 0 and character pixels retained. The checkerboard must not be visible when composited over any color. Keep all four creatures separate and fully inside their cells.
Avoid: checkerboard, white/light-gray squares, background fill, borders, grid lines, halo, glow backdrop, enemy, extra characters, detached fireballs, disconnected flames, text, labels, watermark, altered anatomy, or any change to the four poses.
