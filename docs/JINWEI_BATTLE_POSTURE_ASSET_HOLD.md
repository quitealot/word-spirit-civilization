# 烬尾战斗姿势素材：透明处理待授权

状态：ASSET HOLD / NOT DEPLOYED。线上仍Site40。仅文档、原始候选图、只读素材检查脚本变更，无运行代码修改。

内置imagegen生成正常待机与两帧正向跑步；主代理查看原图确认头颈胸/前腿在右，臀部/尾巴在左。待机四脚落地。原展示图未覆盖。

未通过项：两张实际都是不透明RGB，棋盘格是画入的背景。只读检查idle边缘0/10透明，失败符合预期。run首帧前爪越过等分边界约26px；不能直接按二格裁切接入。无手动抠图，无Python图像处理，无发布。需用户允许独立去底与重新排帧后继续；透明边缘和火焰内部空隙必须复核。

原始候选：docs/concepts/jinwei-battle-posture/idle-raw.png (1254×1254)，run-raw.png (1774×887)。仅供审阅，不是可上线素材。

## 最终run生成提示词（内置工具，重试输出）

Focused retry for a final game asset. Use case: stylized-concept. Generate a NEW wide transparent PNG spritesheet with exactly two equal square cells side by side, no gap, border, divider, or bleed. The same painterly orange fox spirit Jinwei from Image 1 appears once per cell, same scale and baseline, with orange fur, cream muzzle/belly, tall flame crest, ornate gold chest ornament, and long luminous flame tail. The fox must run unmistakably toward screen RIGHT in both cells: nose, head, neck, chest and forelegs lead RIGHT; rump, hindlegs, tail root and tail stream LEFT. Never mirror the anatomy, never face left, never glance over the shoulder, never twist the head. Left cell: extended gallop, body stretched and foreleg reaching right. Right cell: gathered gallop, legs tucked under body, still facing right. Neutral forward-running head, not a tilted presentation pose. Hand-painted fantasy game sprite, crisp silhouette, warm orange/amber/gold brushwork. IMPORTANT OUTPUT: real RGBA alpha transparency around both characters; transparent pixels, not a checkerboard pattern and not a white/gray/colored background; no floor or shadow. No text, UI, scenery, extra characters, crop, clipping, watermark.

## idle生成提示词（内置工具）

Use case: stylized-concept
Asset type: 2D game character battle-idle sprite, final square transparent PNG
Primary request: Create a NEW square PNG of the same orange fox spirit Jinwei from Image 1 in a neutral normal battle idle stance, standing with all four feet grounded. Use the supplied image only as character identity and painterly fantasy game-art reference; do not copy its four-panel layout.
Input images: Image 1: reference for the orange fox, gold chest ornament, tall fiery crest, long flame tail, colors, and brushwork.
Scene/backdrop: none; genuine transparent alpha background.
Subject and orientation: one complete orange fox spirit with orange fur, cream muzzle and belly, tall flame-like crest, large ears, ornate gold chest ornament, and long luminous flame tail. ENTIRE head, nose, neck, shoulders, chest, torso, and front legs face screen RIGHT. Hindquarters and hind legs are at screen LEFT. The tail root is at the rump and the long flame tail trails and curls LEFT behind the body. The whole body is a clear right-facing profile, never mirrored or backward. Head is neutral and natural for battle, not tilted; no presentation pose, no looking over the shoulder, no head twist.
Pose: calm alert battle idle, four clearly separated feet firmly grounded on one shared baseline, weight balanced, legs anatomically attached and readable, tail flowing behind to the LEFT without hiding the legs.
Composition/framing: one centered fox on a square canvas, same scale and margins all around, no crop or clipping.
Style/medium: polished hand-painted fantasy game sprite matching the reference, crisp cutout silhouette, warm orange, amber, cream, and gold, detailed painterly fur and flame ribbons.
Lighting/mood: warm ember highlights, consistent across the character.
Text (verbatim): none.
Constraints: IMPORTANT OUTPUT must be a real RGBA PNG with genuine transparent pixels surrounding the character; preserve alpha transparency. Do not draw a checkerboard pattern. No white, gray, colored, or scenic background, no floor, no shadow, no glow box, no frame, no UI, no text, no watermark.
Avoid: extra characters, scenery, borders, panels, crop, clipping, checkerboard, opaque background, transparent-looking grid, left-facing head, backward anatomy, tilted head, over-the-shoulder glance, raised or floating feet.
