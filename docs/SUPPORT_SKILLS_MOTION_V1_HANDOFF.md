# 回潮 / 静波动画 V1 交接

日期：2026-08-31。基线：74d9344 / 私有 Site34。
状态：ENGINEERING PASS / DYNAMIC PLAYTEST PENDING。

## 授权与范围

用户已自行录制视频，本轮停止录制工作，只打磨其他已有技能。使用游戏美术的预备动作、主体动作、余势原则；复用常驻原立绘、原单臂裁片及水流贴图，不生成新角色，不改正式对白或技能数值。

- 回潮：前伸推出浪头，命中后水流回卷，回到澜歌身旁才亮回复。总长2400ms、伤害960ms维持原值；新增展示层回复点1200ms，留下1200ms读数时间。
- 静波：抬手后下压，水面从起伏变平，透明水幕驻留；敌方实际命中时出现一次局部形变与三圈涟漪。2200/880ms维持原值。水幕表达原30%减伤，不增加护盾池或免伤。
- 回潮仍由原 reducer 一次性结算10伤害与22回复；仅暂存显示旧玩家HP，回流时展示实际回复。手动推进严格依次揭示伤害、回复、下一阶段；切阶段/重开清理计时，减少动态直接显示结果。
- 水音大招、BOSS、全部数值和主线不变。动画仍为原单臂组合与贴图特效，不宣称完整双臂骨骼动画。

## 文件

运行改动限于 battle-ui/page.tsx、water-caster.tsx、新support-motion.ts及support-skills.css。新增scripts/validate-support-skills.ts；旧boss与water-ultimate验证器仅调整3处静态断言，严格检查新增回复等待链与回血可见条件，未放宽数值断言。

## 验证

- battle-ui 39、boss 28、impact-v2 21、cinematic-v3 19、water-ultimate 18、water-ultimate-polish 8、support-skills 15：共148项通过。
- intent-combat 19项、skill-english-v2、fusion-slice回归通过。
- strict TypeScript通过；修改范围ESLint无错误（10条既有原生图片警告）；构建通过。
- 全仓lint仍有4条既有require导入错误，位于docs/concepts两个CJS脚本；没有顺手修改。
- git diff --check通过。相对74d9344，app/page.tsx、app/game、app/narrative、public、zero-base、fusion-slice及battle-ui原模型/时间表/水音大招组件与CSS无差异。
- 本地3012原先无法连接；启动同一仓库开发服务后HTTP 200。预览打开请求处于queued，未声称实际展示。
- 本轮未做浏览器点击、截图或390×844动态验收；视觉丰富度与实际手感仍待用户试玩。

发布记录待部署成功后补充。
