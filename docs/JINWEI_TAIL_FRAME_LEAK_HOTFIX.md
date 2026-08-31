# 焰尾相邻帧泄露修复

日期：2026-08-31。用户截图显示跑动时主体左侧出现断开的火尾。根因：四格图通过同一大图位移取帧，根SVG的CSS overflow在当前渲染路径没有可靠裁切，前一格超出viewBox的尾部仍被绘制；这不是透明背景问题，也不是设计中的第二条尾巴。

修复：每个姿势拥有useId生成的唯一clipPath，显式1024×1024矩形裁切，image先进入裁切g；根SVG同时写overflow=hidden作双重保护。四姿势、时间、位移、伤害、素材和其他技能均不改。

验证：tail专项由13增为14，新增检查要求四格显式硬裁；原烬尾21和旧battle-ui169回归不降标；strict/build/diff审计。截图给出直接产品证据，但修复后未做新的浏览器截图/点击，因此状态ENGINEERING FIX / USER RECHECK REQUIRED。

发布：私有Site38 succeeded，源5f130cb2763c35b4903877960a8bb2d960e69448；原battle-ui地址与仅所有者权限不变。
