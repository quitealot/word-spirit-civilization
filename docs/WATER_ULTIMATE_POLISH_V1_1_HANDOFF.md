# 水音吟唱与水流厚度优化 · V1.1

2026-08-31。用户反馈“有那么点感觉了”，要求吟唱更明显、攻击技能特效更饱满。
基线：bfa1de4 / 私有Site33。只改现有水音大招样板，不扩技能或系统。

## 变化

- 按游戏美术技能的预备动作、蓄力、释放、余势原则细化已有样板，不新增角色美术。
- 角色姿势与手部能量共用同一方形坐标父层；手机缩放也从同一手部锚点汇聚，不再各自按战场百分比摆放。
- 约0.5–1.4秒：水流上卷、两道相向收缩光环、六点水光汇入双手；蓄力姿势轻抬，释放前短暂停稳。
- 约1.4–2.1秒：同一水流素材合成主流、下层水浪、上沿飞溅；三层宽度、角度、出现/消退时间不同，不改成三次攻击。
- 原命中水花适度放大，并增加1100ms消退的水流余势；仅水音大招分支生效，伤害数字仍在特效上方。
- 仍3800ms整体、2200ms命中、1600ms结果阅读；不靠延长等待强化存在感。
- 只复用既有water-surge与两姿势图，无新增下载素材、声音、咒语台词或生成图；常驻原画未动。

## 修改范围

- app/prototype/battle-ui/water-ultimate.tsx
- app/prototype/battle-ui/water-ultimate.css
- scripts/validate-water-ultimate-polish.ts
- 本交接和CODEX_PROJECT_MEMORY.md

page.tsx、所有结算/时间配置、旧演出、BOSS、其他技能、主线、教学、词源、原画及存档均不改。

## 检查

- 原125项全部通过，未调整既有测试；新增8项通过，总计133。
- intent-combat-v1、skill-english-v2、fusion-slice回归通过。
- 页面+两份水音validator strict TypeScript通过。
- 局部ESLint 0错误/10个既有img警告；全库仍有两份既有CJS绘图脚本的4个require错误，本轮不处理。
- git diff --check与冻结范围diff通过。
- npm run build通过；部署包由下述精确源构建，原包和临时ASCII路径副本SHA256一致。
- 减少动态、素材失败短版回退、手动命中揭示、单次结算、击杀不反击保持原逻辑；新特效无事件回调、计时器、循环或模糊滤镜。
- 本任务在隐藏/委派任务中执行，依Sites规则未打开新的本地预览；没有本轮浏览器截图/手机动态实测，不把静态检查当成手感通过。

## 审阅与停止线

工程结构仅增加绘制层，不触及战斗状态；新增光点只有六个且单次收拢。水流叠层和大水花仍需用户实际审阅是否过亮、挡住角色或拥挤。低端微信设备性能仍未验证。当前为2D关键姿势合成，非完整骨骼动作。完成发布后即停，不扩大到另外两招或BOSS。

## 发布结果

- 状态 ENGINEERING PASS / PUBLISHED / DYNAMIC PLAYTEST PENDING。
- 实现/发布源：2cfe0a948ffa6f1ad29d021ef4498cf84e107c6e，GitHub和Sites source均已推送。
- 私有版本34：appgprj_6a8b08d481fc819185986f60235ed2d1~appgver_21546cb7a2f881918e6ec7fd897114d3。
- 部署appgdep_6a950e15ce3c8191ba5947877f0f1de0，于2026-08-31T05:16:22Z查询succeeded。
- https://word-spirit-civilization-demo.eeevan137.chatgpt.site/prototype/battle-ui
- 权限仍custom/owner一人/0外部访客/无群组，未修改权限。
- 保存版本前两次工具序列化失败，经查询确认未创建版本；同字节打包文件改用临时ASCII路径后保存成功，未省略归档或更换代码。失败根因未确定。
- 当前记录为发布后的纯文档补充，不影响线上运行包。
