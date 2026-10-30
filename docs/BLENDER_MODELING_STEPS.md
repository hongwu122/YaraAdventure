# Blender 建模步骤

## 0. 前置原则
- 白衣Q版Yara正面图是唯一批准母版。
- 任何侧面/背面都必须服务于“同一个Yara”，不能自由重新设计。
- 本版不做动画，只完成模型、骨骼、表情和导出条件。

## 1. Scene Setup
- Unit：Metric
- 角色目标高度：约 1.12m
- +Y Up
- 推荐 +Z Forward
- Origin：脚底中央

## 2. Blocking
先用简单体块搭：
- Head
- Torso
- Upper/Lower Arms
- Hands
- Thigh / Calf / Foot
- Hair Bun
- Bangs
- Sleeves

先锁轮廓和头身比例，再细化。

## 3. Face
- 保留圆润脸型。
- 大眼睛必须保持母版比例。
- 鼻子、嘴巴极简。
- 脸颊饱满，不做成年真人骨相。

## 4. Hair
拆成：
- 主发体
- 前刘海
- 两侧碎发
- 丸子头

头发需要为后续辅助骨骼留结构。

## 5. Clothing
- 白色宽松上衣
- 袖口
- 白色下装
- 袜子/鞋

避免衣袖和躯干粘成一块无法绑定的单体。

## 6. Topology
重点保证：
- Shoulder
- Elbow
- Hip
- Knee
- Neck

总三角目标：28k~38k，允许范围20k~50k。

## 7. UV
- 面部单独区域
- 头发单独区域
- 衣物单独区域
- 尽量避免拉伸

## 8. Materials
按 `MATERIAL_SPEC.md` 创建材质。

## 9. Rig
使用 `rig/skeleton.json` 命名。
必须补：
- HairRoot
- Hair_Bang_L/R
- Hair_Bun
- Sleeve_L/R

## 10. Facial Shape Keys
至少：
- blink_L
- blink_R
- smile
- angry
- hurt
- surprised

## 11. Validation
- 正面是否还是同一个Yara
- 侧面是否保留同一脸型
- 背面发型/丸子头是否合理
- 袖子抬起是否穿模
- 头转动是否穿模
- 原点是否在脚底中央
- GLB是否能在Three.js加载
