# EP03《第一次并肩》v1.1 工程接入记录

状态：`FROZEN / APPROVED` 正文已接入；本轮只修改 EP03，EP01 / EP02 正文未改。

## 手机试玩路径

1. 使用已完成 EP01、EP02 的存档，在地图点击 EP03《第一次并肩》。
2. 行动简报可直接选择“立即挑战”，训练不是硬门票。
3. 依次观看：坡后旧路 → 同行语灵警觉 → 雾中异响 → `？？？`出现 → 同行语灵站到玩家前面。
4. 战斗中先选择当前真实已解锁技能，再完成一次现有 L1 判断。界面显示“逼退进度”，不把目标描述为击杀。
5. 成功时观看：`？？？`退入雾中 → 语灵停留 → 主动走回 → 安静停顿 → `临时同行 → 初伴` → 石门。
6. 结尾固定停在阿洛“先别往前。回吧。”，返回地图；不自动进入 EP04。

私有试玩地址：<https://word-spirit-civilization-demo.eeevan137.chatgpt.site/>

## 四类回归结果

| 路径 | 结果 | 证据 |
|---|---|---|
| 成功 | PASS | 胜利只切入 `ep03.victory`；初伴在胜利静默段更新；石门结束后才完成 EP03 |
| 失败 | PASS | HP 到安全阈值后切入 `ep03.retreat`，不显示 GAME OVER，不完成 EP03 |
| 针对训练 | PASS | 仅使用本战 `quality !== stable` 的真实词；训练结果写回现有学习/成长记录；结束后立即重开战斗 |
| 直接再试 | PASS | 有薄弱词时与针对训练并列；无薄弱词时仅显示直接再试；战斗 HP 重置，学习证据不回滚 |

以上四项由 `validate:ep03-v1-1`、现有学习桥接校验和构建共同覆盖。发布后的真机主观体验仍交由用户 / Sol 按上述路径裁决。

## 刷新与旧存档

- EP03 保存 `phase + narrativeIndex`，剧情中途刷新从当前 beat 恢复。
- `ep03.first_enemy_action_glance` 是战斗事件；首次敌方行动后立即持久化，重试与刷新均不重复。
- 被迫撤退保存本战薄弱词 ID；退出后重新进入仍能选择相应路径。
- 旧版已完成 EP03 的存档确定性迁移为 `complete + bonded + glanceSeen`，不会重演首次遭遇。
- 旧存档的 EP01、EP02 完成状态及 EP02 叙事位置保持不变。

## 边界核查

- 玩家可见敌名始终为 `？？？`；内部 battle ID 保持不变。
- 战斗读取当前等级下真实已解锁技能，没有赠送技能或新数值。
- 答错降低技能效果，不取消整回合。
- 没有新增词、L2/L3、世界观解释、语灵或 EP04 内容。
- 冻结 EP01 / EP02 正文文件零差异。

## 校验

- `lint`: PASS
- `build`: PASS
- `validate:narrative`: PASS
- `validate:gameplay`: PASS
- `validate:dev-presets`: PASS
- `validate:learning-adventure`: PASS
- `validate:skill-guidance`: PASS
- `validate:initial-bond`: PASS
- `validate:ep01-v6-migration`: PASS
- `validate:ep02-v1-1`: PASS
- `validate:ep03-v1-1`: PASS
- `git diff --check`: PASS
