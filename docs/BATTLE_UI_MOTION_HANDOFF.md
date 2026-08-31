# 血条修复 / 守门人 / 轻量动画交接

日期：2026-08-31。范围：独立 `/prototype/battle-ui`。
前置运行版本：acdce51；前置文档HEAD：8c82b3c。

## 完成

1. 血条金色残影原来以 `phase + hp` 为key，切换阶段会销毁并重建同一笔扣血动画。改为只按HP标识；减少动态模式始终具有明确最终宽度。
2. 守门人占位替换为一张1024×1536 RGBA新制立绘，头像复用。仅为样机美术，正式设定仍为PENDING_K3，不新增敌人机制/剧情。
3. 嵌套sprite层做待机（水灵4px轻浮动；守门人1px与0.8%呼吸），外层做出手/受击。不会覆盖镜像或移动名字牌的待机位置。
4. 水音：水流+命中圈；回潮：较轻水流+回复光；静波：回复光+防护轮廓。敌方准备→发力→我方受击；无全屏闪光。特效不拦截点击，不驱动数值结算。
5. 手机点击屏幕下方施放后，如战场已离开视野，则立即把完整战场滚回视野，再开始反馈。无需等待滚动结束，不改变阶段时长。

## 未改

`demo-model.ts` 原文件完全不变：48/60/8、三技能、1.4s/1s/1.4s阶段、结算顺序保留。主入口、其他原型、game、narrative、EP01–EP03、主存档、成长、英语词源未改。仍非微信原生游戏。

## 验证

- 专项30/30（原23项保留，新增7项动画/美术/视野契约）。
- 局部strict TypeScript通过；局部ESLint 0错误、3条img性能警告。
- Intent Combat 19/19、Skill English V2、fusion-slice回归通过。
- 完整build通过；diff check通过；冻结路径diff为空。
- 全库lint仍失败于此前两份concepts CJS脚本的4个require-import错误，本次未修改或放宽规则。

## 浏览器证据（桌面与390×844视口，不冒称实体手机）

- 线上旧版复现：水音后敌方残影已到695.80px，点下一步切enemyReady后跳回994px。
- 修复版：player / enemyReady / enemy连续保持695.80px，即70%残血；不重播、不回弹。
- 水音：敌60→42，我方48保持到敌方结果，再→42。
- 回潮：敌42→32，我方42→48实际+6；之后敌方行动我方→40。
- 静波：我方40→48实际+8、敌方不扣血、随后我方→42；防护效果按减伤而非额外护盾。
- 接续两次水音：敌32→14→0；胜利时我方36不再被敌方追加扣血；重新演示恢复60/48。
- 水音的水流/命中效果实机截图可见；静波/回潮效果分支与样式实际挂载；两张立绘成功解码。
- 390×844：布局稳定后clientWidth/scrollWidth均375（桌面滚动条占15px），无横向溢出；技能可点。施放时arena top约12px、bottom约414px，敌我血条均在屏内。
- 已走暂停逐步/恢复自动路径，自动阶段能继续。减少动态分支做静态契约验证，未改变操作系统设置做真实偏好切换。
- 开发热更新时出现过旧SSR头像与新客户端图片不匹配的hydration错误；停开发服务后用最终生产构建重新打开验证，不以热更新旧页面作为发布依据。

## 美术来源与边界

`public/battle-ui/gatekeeper.png`由内置图像生成工具生成，2,905,144 bytes，RGBA（Alpha包含0，未手工抠图）。原背景和澜歌不重画。

生成方向：ancient gate guardian, weathered stone and aged bronze, broad shoulders, grounded stance, recognizable calm imposing mask, three-quarter facing LEFT, detailed painterly fantasy style matching existing spirits, old muted gold/deep teal/desaturated stone, sparse glowing seams, whole body, transparent background, no scenery/text/UI/frame/extra characters. Avoid chibi, gore, oversized weapons, overdecorated armor, checkerboard.

这是整张立绘的轻量运动与抽象特效，不是角色肢体逐帧动画或骨骼绑定。BOSS外观与手感待用户最终审美裁决。下一轮不自动扩新角色、技能或玩法。

发布SHA与站点版本在发布成功后追加。
