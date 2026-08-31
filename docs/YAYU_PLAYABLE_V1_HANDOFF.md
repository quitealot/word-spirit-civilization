# 芽语独立试玩交接

发布：私有Site43 succeeded，源b050dba9871ac608b4f4e3c3a4cc6d23f41bb8e9，原battle-ui地址与权限不变。

同一/prototype/battle-ui新增“芽语 · 守护”。默认澜歌不变，切换新开一场，不做战中换人。叶拍24、护芽8+24盾、扎根40%均为既有V2演示数值，不宣称正式平衡。盾累加并保留余量；先减伤取整，再盾吸收，再HP。独立leaf-model不导入学习/存档。

正常站姿、举杖、向前施法、落杖防护四姿势；叶拍用原画叶片像素飞出，护芽用叶片汇聚和盾罩，扎根用原枝条像素翻转表现地面根系。原始展示图保留。不是完整骨骼，不包含新正式剧情。根系为原画裁片示意，视觉质量等待试玩。未启动后续冒险或成长系统。

素材：public/battle-ui/yayu-battle-poses-v1.png，yayu-original-cutout-v1.png；原始生成图docs/concepts/yayu-battle-poses-raw.png。内置imagegen一次生成，原始输出不透明；沿已获批准独立处理流程去掉明亮近中性棋盘格，脚本prepare-yayu-battle-art.ps1。16/16边缘探针透明，主代理检查四姿势朝右且完整。浅边风险仍保留。

验证：芽语22、烬尾21、焰尾17、基础界面39、BOSS28、水音大招18，共145项通过；strict类型/build/diff通过。全仓lint既有4条CJS错误；14条图片警告（新增1条原画fallback警告）。未做本轮浏览器/390×844动态测试，不宣称实机PASS。当前委派任务未另外开启本地预览；发布后用户在原入口测试。

## 素材生成完整提示词（内置工具）

Use case: stylized-concept
Asset type: game character 2D sprite sheet
Input images: Image 1 is the reference image; use it strictly for identity, silhouette language, colors, costume construction, antler shape, face, and staff design. Preserve the same character, not a new creature.

Primary request: Generate one square 2x2 sheet of four equal square cells, a consistent full-body character-pose sheet of the same leaf-robed antlered green humanoid forest spirit holding the same natural branched wooden staff. Painterly fantasy game concept-art rendering, clean readable silhouettes.

Scene/backdrop: genuinely transparent alpha background in the final PNG; absolutely no floor, ground, scene, backdrop, shadows, checkerboard, border, cell lines, or background color. Transparent empty space around and between cells.

Subject: the same tall slender green forest spirit in every cell: layered overlapping leaf cloak/robe, long narrow pointed face and ears, luminous pale eyes, large branching antlers with small leaf buds, organic bark-and-leaf staff. Keep the character fully inside each cell, with the complete antlers, complete staff, and both feet visible. Leave at least 7% transparent margin on every side of every cell. Keep identical scale, proportions, rendering, and foot baseline across all four cells. Every pose faces and looks directly to the RIGHT in profile/three-quarter profile; never looks over the shoulder, never faces left, never faces front.

Composition/framing: exact 2 columns by 2 rows, equal cells, one character per cell, centered and similarly scaled. TL = idle battle-ready stance, both feet firmly planted, staff upright close to the body. TR = windup: staff arm raised back, torso and cloak preparing a sweeping cast, still facing RIGHT. BL = release: staff/hand extended toward the RIGHT in the casting motion for a leaf attack, but show no projectile or special effect. BR = root/ward pose: both feet firmly planted and rooted, staff grounded vertically, free hand extended protectively toward the RIGHT. Ensure no crop and no overlap across cell boundaries.

Style/medium: polished painterly fantasy illustration, hand-painted foliage textures and soft controlled highlights, matching the reference’s green-on-green leaf layering and organic silhouette; crisp enough for in-game sprite readability.

Lighting/mood: neutral soft diffuse studio-like character lighting only, no cast shadow or environment.
Color palette: deep forest greens, moss, muted jade, bark brown, small restrained yellow-green highlights, matching the reference.
Materials/textures: layered leaves with visible brush texture, subtle bark texture on staff and antlers, no glossy armor, no added costume pieces.
Text (verbatim): none.
Constraints: preserve the reference character’s identity in all four cells; four poses only; all face RIGHT; entire antlers/staff/feet inside each cell with >=7% margins; consistent scale and baseline; actual transparency.
Avoid: any background or floor; checkerboard; opaque white or colored fill; cell borders or dividers; text; logos; watermark; new characters; new creatures; extra props; extra weapons; staff redesign; cropped antlers; cropped staff; cropped feet; feet floating; left-facing or over-the-shoulder head turns; front-facing portrait; dramatic effects; glowing aura; leaf projectile; particles; smoke; motion lines; scenery; hard shadows.
