# 烬尾去底派生素材

使用内置imagegen编辑模式；原public/spirit-jinwei.png及card图不覆盖。
最终工作区素材：public/battle-ui/jinwei-cutout-v1.png，1254×1254 RGBA。检查角点alpha0、外侧透明区alpha1；保持原朝向、耳/面部/甲片/坐姿/火尾构图，但生成去底不保证逐像素一致，颜色及边缘有轻微差异，不能声称完全原RGB。现阶段作为试用派生，非角色重新定稿。
首轮生成错误地返回带背景横图，未接入项目。第二轮透明去底后接入；无额外生成火焰素材，基础火尾特效取同一派生图尾部像素区域。

## 最终提示词（原文）

Background extraction only from provided square checkerboard image (not a card). CRITICAL: transparent PNG alpha channel outside fox and between tails. NO black background, NO orange background glow, NO painted background, NO solid colors, NO checkerboard pixels. Preserve original square pose, exact original head/ears/face, paws, armor and tail layout. Only remove background, no new lighting or style. Output fully isolated original animal on true transparent alpha, square 1024x1024.

工具输出原件：C:/Users/孟誉/.codex/generated_images/01a0413d-d7be-7510-ada1-17af5238848e/exec-178aed74-a8ce-49f2-9f6c-3cd8142d9298.png。
