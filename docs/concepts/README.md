# 原立绘战斗排版提案

## 当前候选：横屏 V2（等待用户审美确认）

用户否决竖屏 V1：「不好看，没欲望，赛尔号呗」。V1仅作历史保留，不能当作获批方向。

新图：`original-art-landscape-battle-v2.png`（1600×900）。参考赛尔号战斗的信息结构：两侧对峙、顶部对称HP、底部集中技能和捕捉/换灵操作。没有复制赛尔号素材。参考截图来源：[赛尔号战斗截图](https://www.9game.cn/news/8571178.html)。

角色仍为原始澜歌/烬尾PNG，复用V1临时遮罩和等比缩放/镜像，无AI重画。背景 `forest-battle-background-v2.png` 由内置imagegen生成，UI和最终合成由 `compose-landscape-battle.cjs` 确定性绘制。未使用CLI图像生成。原始public素材、运行代码、冻结剧情全部未改；未部署。

自查：角色相向、地面/投影明确、顶部HP无遮挡、三个已有技能标签可读。原始素材抠底仍有亮边，尚不具备生产级透明资产品质。等级、数值、伙伴列表、捕捉按钮和未收集状态均为视觉提案，不冻结正式收集/成长/战斗规则。不用静态图宣称微信实机或可操作。

背景最终提示词：

> Use case: stylized-concept. Asset type: reusable 2D side-view turn-based monster battle background, landscape 16:9, no UI. An inviting mossy forest ruin clearing beside a stream, rich hand-painted fantasy game background, broad designed shapes and visible brush strokes, not photorealistic or 3D. Clear flat walkable sandy stone ground spanning whole width at lower half, horizon at 45% height. Empty standing spaces at x=25% and x=75%, both ground plane at y=77%, for two large opposing creatures to be composited later. Frame only outer corners with dark teal trees and ferns, middle distance broken low stone arch with warm afternoon light, atmospheric layered forest and a glimpse of water behind. Moderate detail, readable broad value masses, warm pale ochre ground contrasting cool teal foliage, natural daylight, no epic bloom, no sparkles, no glowing magic circle. Attractive polished actual 2D RPG battle location asset, not a poster. No people, no creatures, no characters, no text, no logos, no interface, no border.

## 历史 V1（用户否决）

2026-08-31：用户否决重新生成的Q版角色。保留原概念图与立绘，降低场景数量、动画复杂度，而非降低角色美术标准。

预览：`original-art-battle-layout-v1.png`（780×1688，竖屏静态排版，非实机）。

通过 `compose-original-art.cjs` 使用原始PNG确定性合成，未调用图像生成服务。背景为 `public/world-awakening.png` 的无角色区域裁切；角色来自 `public/spirit-lange.png` 与 `public/spirit-jinwei.png`。原文件未改动。角色只做中性棋盘底色去除、等比缩放与水平镜像；没有重画、重新配色或生成新造型。

抠底为排版用临时遮罩，边缘仍有浅色残留；正式动画资产需单独精修透明边缘与拆层。本图不代表已完成生产级抠图。界面数值、演练对手关系为视觉示意，不冻结正式战斗规则或剧情。

可复用的产能策略：原立绘静态呈现，辅以位移、受击明暗和少量技能特效；先少量场景复用，不承诺每个角色复杂骨骼动画。
