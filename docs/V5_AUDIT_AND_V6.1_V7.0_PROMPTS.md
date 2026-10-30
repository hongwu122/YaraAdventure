# Yara冒险日记 V5.0 全量自检结论 + V6.1～V7.0 迭代提示词

> 目标：先把“资源底座”补齐，再做人物/怪物动作接入，再解决 100% 浏览器下单屏适配和 UI 精致度，最后做 V7.0 稳定发行版。  
> 原则：**V6.1～V6.5 优先资源，不急着改游戏；V6.6 起才开始大规模接入；V7.0 才做最终整合。**

---

# 一、这次 V5.0 自检是怎么做的

本轮复核使用：

1. V5.0 当前完整项目目录与源代码。
2. V5.0 自带 `playtest_screenshots/`，全部为 **1600×900** 截图。
3. 对角色、怪物、Boss、装备、动作、模型目录逐个盘点。
4. 对 `styles.css`、`ui/theme_v49.css` 的高度、overflow、breakpoint 逐项检查。
5. 对 V5.0 的模型接口文件、动画文件、关卡敌人类型进行实际文件级核对。

当前执行容器中 Chromium / Playwright 访问本地 `localhost` 会被策略拦截并返回 `ERR_BLOCKED_BY_ADMINISTRATOR`，因此这一次无法重新开一轮新的“鼠标式浏览器自动点击”；但 V5.0 已经保留了完整 1600×900 的试玩截图，本报告结合这些截图与当前实际代码/资源文件做二次复核。

---

# 二、总判断

V5.0 现在最大的瓶颈已经不是“功能不够多”，而是下面四件事：

1. **角色、怪物、Boss真正的美术/建模资源没有生产完成。**
2. **很多所谓动作资源只是“能让程序跑”的过渡资源，不是生产级动作。**
3. **UI虽然统一成深色，但仍然是大量网页面板、框框、表格和文字，离真正游戏 HUD 很远。**
4. **“一屏显示”没有成为硬性设计约束，部分页面在 1600×900 就已经接近或发生裁切，在 1366×768 / 浏览器125%缩放时问题会更加明显。**

所以后面不应该继续增加玩法。

**正确顺序应该变成：资源 → 动作 → 接入 → 单屏UI → 精修 → 最终QA。**

---

# 三、目前最严重的问题

## A. Yara 还没有真正 3D 模型

当前目录：

```text
assets/characters/Yara_v44/model/
├─ yara_model.json
├─ skeleton.json
├─ animation_clips.json
└─ README.md
```

但实际不存在：

```text
yara.glb
yara.blend
```

而且当前 `yara_model.json` 自己明确写着：

```text
productionReady: false
installed: false
```

也就是说现在是：

> 有 3D 接口规范，没有真正 3D 模型。

因此角色展台本质上仍然是 2D / 伪3D fallback。

### 必须补：

- 真正 `yara.blend`
- 真正 `yara.glb`
- 骨骼
- 表情 BlendShape / Shape Keys
- 头发骨骼
- 裙摆/衣袖辅助骨骼
- 动画 clips
- 2K/4K 材质
- 正面/侧面/背面检查图

---

## B. Yara 当前“2D动作”不是生产级动作

虽然 V5.0 里面已经有：

```text
idle
run
turn
jump_start
jump_loop
jump_up
fall
jump_fall
double_jump
land
attack_1
attack_2
attack_3
skill_U
skill_I
dash
musou
hurt_light
hurt_heavy
knockback
stun
knockdown
getup
dead
cultivate
```

但打开实际 WebP 会发现明显问题。

例如：

```text
assets/characters/Yara_v44/combat_v44/actions/run_right.webp
assets/characters/Yara_v44/combat_v44/actions/attack_1_right.webp
```

存在：

- 彩色条纹/边缘残留
- 大块异常矩形
- 抠图不干净
- 很多帧只是人物整体轻微位移，不是真正肢体动作
- 普攻剑势更多是“在人物周围画弧线”，人物身体没有完整挥剑动作
- 跑动缺少腿部完整步态
- 身体重心没有明显前后变化
- idle 呼吸感弱
- attack 1/2/3 的“力量递进”不足

**所以现在程序有 animation key，但美术意义上的动画并没有真正完成。**

---

## C. 其他角色资源差距也很大

### Aster / Moyu

有 WebP 动作，但多数动作 strip 高度只有约：

```text
190 px
```

相比 Yara 的 512×512 规范，仍然属于旧资源体系。

并且：

- 无 GLB
- 无 Blender 源文件
- 无统一 512×512 生产级预渲染动作

### Langa

当前基本只有：

```text
portrait.webp
preview/front.webp
preview/left_3q.webp
preview/right_3q.webp
...
```

**没有战斗动作资源。**

所以 V5.0 角色资源并没有真正统一。

---

# 四、怪物 / Boss 资源问题非常大

当前 1～20 关使用了约 11 类基础怪物：

```text
peachling
redpanda
golem
fireling
phoenix
frostling
shadowfox
abyssling
runegolem
jiangshi
sunling
```

这些虽然都有部分 WebP 动作，但没有真正 3D 模型。

更大的问题是 Boss。

当前关卡数据存在：

```text
peachlingBoss
redpandaBoss
golemBoss
firelingBoss
phoenixBoss
frostlingBoss
shadowfoxBoss
abysslingBoss
runegolemBoss
jiangshiBoss
sunlingBoss
```

但实际专用 Boss 美术目录只有：

```text
assets/bosses/peach_spirit_guardian/
```

代码中大量 Boss 是通过：

```js
type.replace(/Boss$/,'')
```

回退到普通怪资源，再把体型放大。

这就是为什么：

> Boss 很容易看起来只是“大号普通怪”，缺少角色辨识度、阶段感和压迫感。

### 必须解决

以后 Boss 不能再只是普通怪 Scale × 1.5。

Boss 要有自己：

- 模型
- 轮廓
- 武器/装饰
- Attack A/B/C
- Special
- Phase Change
- Stagger
- Dead
- 第二阶段视觉变化

---

# 五、装备现在只有“图标”，没有真正装备资源

当前 `assets/items/icons/` 只有 21 个图标。

例如：

```text
eq_wood_sword.webp
eq_travel_robe.webp
eq_cloud_shoes.webp
...
```

但没有：

```text
weapon.glb
robe.glb
headwear.glb
shoes.glb
necklace.glb
...
```

所以角色装备页目前只能做到：

> “人物 + 七个装备框 + 图标”

做不到：

> 真正装备穿到人物身上。

这也是为什么装备页即使布局调整过，仍然有很明显的“网页装备管理器”感觉。

---

# 六、洞府设施也仍然是平面背景热点

木鱼、丹炉、药圃、聚灵阵、灵泉等目前本质仍然嵌在大背景图片里。

点击区域是 HTML hotspot。

因此无法做到真正高级的：

- 丹炉转动
- 火焰变化
- 木鱼敲击
- 药草生长
- 聚灵阵粒子环绕
- 灵泉流动
- 相机轻微移动

未来至少需要把关键设施做成：

- 独立透明 WebP 动画层，或
- 独立 3D prop / GLB

---

# 七、1600×900 / 正常100%浏览器下的 UI 问题

V5.0 的现有 QA 截图全部是 **1600×900**。

这已经可以看出一批明显问题。

## 1. 角色展台

问题：

- 页面底部信息已经接近被截断。
- CSS 本身就是：

```css
.character-v35-view { overflow:auto }
.character-stage-v35 { min-height:calc(100vh - 100px) }
```

同时页面还有 header、margin、padding。

这意味着：

> 它并没有真正按照“一页100vh”设计。

在 1366×768 或浏览器 125% 缩放时更容易出现滚动。

---

## 2. 装备 / 背包 / 商店

这是当前最严重的单屏适配区域之一。

当前：

```css
.economy-v36-view { overflow:auto }
.economy-shell-v36 { min-height:730px }
.v47-equipment-page { min-height:730px }
.v47-inventory-page { min-height:730px }
.v47-shop-page { min-height:730px }
```

再加：

- 顶部 header
- tabs
- 18px / 60px margin

所以在 1600×900 就已经很紧。

在 1366×768 基本必然纵向滚动。

而且 `max-width:1050px` 后，右侧详情栏会直接堆到下面：

```css
grid-template-columns:1fr
```

这就彻底破坏“一页显示”。

### 结论

经济系统必须重新变成：

```text
100dvh 固定舞台
│
├ 左固定区
├ 中央角色/物品区
└ 右固定详情区
```

不能再靠页面往下堆。

---

## 3. 装备页视觉仍然“框框太多”

虽然已经比 V4.6 好，但仍然是：

- 左一个框
- 中一个框
- 右一个框
- 七个装备框
- 底部物品框

整体依然像：

> 游戏化后台管理系统。

而不是类似 V3.7 宣传图的：

> “人物就是视觉中心，装备和属性只是围绕人物出现”。

### 应整改

- 中央人物占比增加
- 七装备槽缩成真正的装备位 icon
- 不再用大矩形文本框
- 属性做短条/数值/图标
- 比较信息只在选中装备时滑出
- 背包行囊放到独立 Tab，不要塞在装备页最底部

---

## 4. 背包页虽然能一屏，但太空

当前只有一个物品时，页面巨大空间都是黑色。

说明布局没有真正做到：

> “内容少时也精致”。

应加入：

- 物品容量
- 角色小立绘
- 快捷筛选
- 稀有度图例
- 物品信息背景纹理
- 动态陈列底座

而不是空白矩阵。

---

## 5. 商店还是“列表 + 详情”

功能是清晰的，但高级游戏感不够。

缺少：

- 商人角色/NPC
- 场景
- 商品陈列台
- 品质光效
- 商品轮播
- 购买反馈
- 灵石飞入/减少动画

---

## 6. 修行页面已经比较接近目标，但仍然是“背景 + HUD”

问题主要是：

- Yara 还是贴图，不是打坐模型。
- 设施不是独立资源。
- 右侧 Facility HUD 仍然有网页卡片感。
- 左侧境界轨在低高度显示器会非常拥挤。

V6 后应该把洞府先保留，不急着大改数值，重点补独立设施资源。

---

## 7. 技能树布局逻辑已经对，但视觉素材还不够

现在已经有中心核心 + 四向分支。

但是节点依然主要靠 CSS 卡片。

缺少：

- 技能图标
- 技能纹章
- 元素纹理
- 解锁粒子
- 节点动画
- 连线流光

这也是为什么仍然“不像大型游戏”。

---

## 8. 山海录仍暴露了资源问题

角色图鉴中 Yara 仍然出现了“动作表/多帧图”式预览。

这说明：

> 当前 UI 再怎么改，也会被低质量资源拖下来。

山海录只有在真正角色、怪物、Boss、装备立绘/模型补齐之后才会高级。

---

## 9. 操作说明虽然风格统一，但动作演示是假动作感

目前 WebP 动作预览本身不是高质量动画，因此 UI 再漂亮，也只能展示低质量动作。

所以操作说明不应该继续精修，应该先等 V6.2 动作资源完成。

---

# 八、“一屏显示”以后必须成为硬性标准

从 V6.7 开始统一执行以下验收。

## 目标设备

必须在以下 CSS viewport 下无需页面滚动：

```text
1920×1080 @ 100%
1600×900  @ 100%
1536×864  @ 100%   （接近 1920 屏幕下浏览器125%后的有效空间）
1366×768  @ 100%
```

额外检查：

```text
浏览器 90%
浏览器 110%
浏览器 125%
```

## 硬性规则

所有主要 `.view`：

```css
height: 100dvh;
overflow: hidden;
```

禁止：

```text
body滚动
主页面滚动
因为margin导致多出20px滚动条
右栏掉到下一行
装备栏掉到第二屏
```

内容过多时应采用：

- Tab
- 折叠
- 弹层
- 页内区域缩放
- 小型内部 scroll（尽量少）

而不是让整个页面滚动。

## 推荐新增全局 UI Scale

```text
--ui-scale: clamp(0.78, min(100vw / 1600, 100dvh / 900), 1.12)
```

并按高度增加 compact 模式：

```css
@media (max-height: 820px) { ... }
@media (max-height: 760px) { ... }
```

不要只看屏幕宽度。

---

# 九、V6.1～V7.0正确开发顺序

## 核心原则

### V6.1～V6.5

**只生产资源。**

中间版本甚至可以完全不运行。

### V6.6

开始真正接入模型与动画。

### V6.7

解决全游戏单屏 UI。

### V6.8～V6.9

用新资源做高品质 UI / 战斗表现。

### V7.0

最终全流程稳定发行。

---

# V6.1｜Yara 真3D角色母版资源包

复制下面提示词即可：

```text
基于 Yara冒险日记 V5.0 的角色规范做 V6.1。

本版只做“Yara 真3D角色母版资源包”，不要改游戏代码，不做UI，不做关卡。

【唯一角色定稿】
以我已经提供的白衣Q版Yara正面图作为唯一母版。
绝对禁止重新设计：
- 脸型
- 大眼睛比例
- 鼻子嘴巴
- 发型与丸子头
- 发色
- 白色衣服
- 头身比例
- 整体Q版气质

【必须交付真正的3D文件】
目标目录：

assets/production/characters/Yara_v61/
├─ model/
│  ├─ yara_v61.blend
│  ├─ yara_v61.glb
│  ├─ model.json
│  └─ validation.json
├─ textures/
│  ├─ body_albedo.webp
│  ├─ face_albedo.webp
│  ├─ hair_albedo.webp
│  ├─ clothing_albedo.webp
│  ├─ normal.webp
│  ├─ roughness.webp
│  └─ ao.webp
├─ rig/
│  ├─ skeleton.json
│  └─ facial_blendshapes.json
├─ reference/
│  ├─ front.webp
│  ├─ back.webp
│  ├─ left.webp
│  ├─ right.webp
│  ├─ front_left.webp
│  ├─ front_right.webp
│  └─ proportion_sheet.webp
└─ preview/
   ├─ turntable_01.webp
   ├─ turntable_02.webp
   ├─ turntable_03.webp
   └─ model_check.html

【模型标准】
1. Q版高质量卡通3D，不做写实真人。
2. 20k~50k triangles。
3. 角色高度统一约1.12m虚拟单位。
4. 眼睛、头发、皮肤、白色衣服分材质。
5. 边缘干净，不穿模。
6. 袖子、头发必须有辅助骨骼。
7. 面部至少提供：
   blink_L
   blink_R
   smile
   angry
   hurt
   surprised
8. Skeleton至少包含：
   Root
   Pelvis
   Spine_01
   Spine_02
   Chest
   Neck
   Head
   HairRoot
   UpperArm_L/R
   LowerArm_L/R
   Hand_L/R
   Thigh_L/R
   Calf_L/R
   Foot_L/R
   Toe_L/R
9. GLB必须在Three.js中可直接加载。
10. 模型原点位于脚底中央。
11. +Y为上，+Z/约定方向写进model.json。
12. 正视图、侧视图、背视图必须保持和母版同一人物。

【非常重要】
如果当前工具不能真正输出合格的 .blend / .glb：
禁止生成假的空文件冒充完成。
必须明确告诉我还缺什么工具，并先完整交付：
- 正交建模参考图
- 骨骼规范
- 材质规范
- Blender建模步骤
- GLB导出规范

最终给我“资源包”，中间不要求游戏可运行。
本版不要做动作。
```

---

# V6.2｜Yara完整动作模型 + 2D预渲染动作包

```text
基于 V6.1 的 Yara 真3D模型做 V6.2。

本版只做Yara动作资源，不改游戏逻辑。

目标：
同一套Yara模型同时产出：
1. GLB AnimationClips
2. 2D横版战斗预渲染WebP动作

【3D动画必须完成】
Idle
Run
Turn
JumpStart
JumpLoop
DoubleJump
Fall
Land
Attack01
Attack02
Attack03
SkillU
SkillI
Dash
Musou
HurtLight
HurtHeavy
Knockback
Stun
Knockdown
Getup
Death
Cultivate

补充建议：
Walk
Victory
Interact
CastStart
CastLoop

【动作要求】
- Idle：10秒原地绝对不漂移。
- Run：真正腿部跑动，不是整张人物平移。
- Attack01/02/03：三段明显不同，第三段力量最大。
- JumpStart → JumpLoop → Fall → Land 连贯。
- DoubleJump必须有二次发力动作。
- Hurt / Knockback / Knockdown / Getup完全区分。
- Dash必须有身体前倾和残影姿态。
- Musou是完整爆发动作，不只是人物旁边画圆圈。
- Cultivate是真正盘坐/打坐。

【2D预渲染】
从同一个3D模型固定正交相机渲染横版动作。

每帧：
512×512
RGBA透明背景
脚底anchor固定：[0.5, 0.92]
人物在每一帧的脚底基线完全一致。

输出：

assets/production/characters/Yara_v62/combat/
├─ animations.json
├─ idle_right.webp
├─ run_right.webp
├─ turn_right.webp
├─ jump_start_right.webp
...
└─ dead_right.webp

如果动作左右可安全镜像，只生产right并在metadata写：
mirrorSafe: true

如果武器/手性导致不能镜像，则左右都生成。

【质量要求】
禁止：
- 彩色条纹
- 残留矩形
- 黑边
- 白边
- 抠图锯齿
- 每帧人物突然跳位置
- 人物整体平移冒充跑步

提供：
- animation_debug.html
- 每动作GIF/WebP预览
- 脚底基线检查
- alpha边缘检查
- 帧数/FPS表

最终只交资源包，不接入游戏。
```

---

# V6.3｜前5关普通怪 + Boss资源包

```text
基于 Yara冒险日记 V5.0 做 V6.3。

本版只生产第1~5关怪物/Boss美术资源，不改代码。

重点解决：
当前Boss基本只是普通怪放大，没有真正Boss形象。

覆盖：
1. 桃灵 peachling
2. 竹笠狸兵 redpanda
3. 石守 golem
4. 火灵 fireling
5. 凤凰灵 phoenix

以及对应独立Boss：
- 桃灵头领
- 竹笠教头
- 玄石护法
- 熔岩Boss
- 天宫凤凰Boss

【普通怪动作】
Idle
Walk/Run
Turn
Spawn
AttackA
AttackB
HurtLight
HurtHeavy
Knockback
Stun
Knockdown
Getup
Dead

普通怪可以轻量、可爱、略有威胁。
不要设计得像Boss。

【Boss动作】
Idle
Walk
Turn
AttackA
AttackB
AttackC
Special01
Special02
Hurt
Stagger
Knockback
PhaseChange
Death

Boss不能只是普通怪Scale×1.5。
必须有：
- 不同轮廓
- 不同武器/饰品
- 更完整材质
- 独有招式
- 阶段变化

【文件结构】
每个怪物独立：

assets/production/monsters/<id>/
├─ model/<id>.glb
├─ textures/
├─ combat/
│  ├─ animations.json
│  └─ *.webp
├─ portrait.webp
└─ metadata.json

Boss：
assets/production/bosses/<boss_id>/...

2D预渲染：
普通怪 512×512/frame
Boss 768×768/frame
WebP透明背景。

本版只交资源，不接入游戏。
```

---

# V6.4｜第6~20关怪物 + 阶段Boss资源补全

```text
基于 V6.3 继续做 V6.4。

本版只补齐第6~20关战斗资源，不改游戏代码。

覆盖剩余怪物：
- frostling
- shadowfox
- abyssling
- runegolem
- jiangshi
- sunling

必须建立真正独立Boss资源：
- frostlingBoss
- shadowfoxBoss
- abysslingBoss
- runegolemBoss
- jiangshiBoss
- sunlingBoss

特别强化阶段Boss：
第10关
第15关
第20关

每个阶段Boss必须至少包含：
Phase1
PhaseChange
Phase2视觉变化
AttackA/B/C
Special01/02
Ultimate
Hurt
Stagger
Death

禁止继续使用普通怪模型放大冒充Boss。

资源规格、透明背景、anchor、命名方式与V6.3一致。

最后输出：
- monster_index.json
- boss_index.json
- resource_manifest.json
- 缺失检查表

本版仍然只做资源包。
```

---

# V6.5｜装备外观 + 洞府设施 + 游戏UI美术资源包

```text
基于 V6.4 做 V6.5。

本版只生产“非角色资源”，不改游戏代码。

【一、装备可视资源】
当前只有装备图标，没有真实可穿戴资源。

为现有装备建立：
- weapon模型/挂点
- head模型/挂点
- body服装层
- waist
- shoes
- talisman
- necklace

优先把现有样例装备全部做完，不新增装备数量。

文件：
assets/production/equipment/<item_id>/
├─ icon.webp
├─ model.glb 或 attachment.glb
├─ preview.webp
└─ attachment.json

【二、洞府设施独立资源】
木鱼
聚灵阵
药圃
丹炉
藏经阁
灵泉
静修台

要求：
不能继续只依赖背景图。
至少拆成透明WebP动画层；能做GLB的设施优先做GLB。

木鱼：hit动画
丹炉：idle / flame / craft_success
药圃：empty / growing / ready / harvest
聚灵阵：idle / active / levelup
灵泉：loop
静修台：idle / aura

【三、UI高级美术资源】
建立统一：
- 装备槽框
- 品质边框
- 金/水/火/木/土元素纹章
- 技能节点底图
- Boss徽章
- 地图区域徽章
- 面板角花
- 分割线
- Tab图标
- 货币图标
- 丹药品质框

全部WebP/SVG（如果现有系统支持SVG）。

本版只交资源包和manifest。
```

---

# V6.6｜真正接入Yara/怪物/Boss模型与动作

```text
基于 Yara冒险日记 V5.0 + V6.1~V6.5资源包做 V6.6。

本版第一次开始大规模接入新资源。
不要改UI大框架。
不要新增玩法。

【Yara】
1. 角色展台优先加载真正 yara.glb。
2. 如果加载失败才fallback WebP。
3. Three.js Viewer必须真正使用：
   OrbitControls
   AnimationMixer
   dispose
4. 展台支持：
   360旋转
   缩放
   正/背/左/右
   Idle
   Victory
   Cultivate

【战斗】
5. 横版战斗仍保持2D玩法。
6. 优先加载V6.2预渲染动作WebP。
7. 统一anchor。
8. 删除旧V4.4存在彩条/残块的动作资源引用。
9. J/K/L/U/I/Space与动画状态严格同步。
10. 身体碰撞仍不直接扣血。

【怪物】
11. 第1~20关全部切换新怪物动作。
12. Boss必须加载独立Boss资源，不再type.replace(/Boss$/,'')后只放大普通怪。
13. 第10/15/20关PhaseChange必须切真正阶段动作/模型。

【验收】
实际试玩：
第1关
第5关
第10关
第15关
第20关

检查：
- idle漂移
- run脚滑
- attack跳位
- boss放大冒充
- alpha黑边
- 帧裁切

最后给V6.6完整ZIP和战斗资源QA。
```

---

# V6.7｜全游戏100%浏览器“一屏显示”重构

```text
基于 V6.6 做 V6.7。

本版只处理：
响应式布局 / 单屏适配 / UI尺寸系统。
不要重新画角色，不改战斗数值。

【核心硬指标】
以下分辨率100%浏览器缩放下：

1920×1080
1600×900
1536×864
1366×768

所有主要页面必须：
- 无body滚动条
- 无view纵向滚动
- 不需要用户往下滚
- 不发生按钮被裁
- 不发生右栏掉到第二屏

额外测试浏览器：
90%
110%
125%

【重构方式】
所有主页面采用：

height:100dvh;
overflow:hidden;

建立：
ui/layout_v67.css
ui/responsive_v67.css

不要继续在旧CSS末尾无限叠override。

【统一UI scale】
根据宽度和高度同时计算UI缩放。
必须加入max-height breakpoint：

max-height:900
max-height:820
max-height:768
max-height:700

不能只按max-width。

【逐页修】
主菜单
诸界舆图
角色展台
山海录
修行总殿
洞府
装备
背包
商店
技能树
操作说明
设置

特别修：
1. 角色展台底部被裁问题。
2. 装备/背包/商店 min-height:730 导致滚动。
3. max-width:1050 时经济页右栏堆到下方的问题。
4. help页面overflow:auto的问题。
5. 低高度下境界轨过长。

允许“内部小区域scroll”，但主页面不能滚动。

最后输出四种分辨率逐页截图矩阵和overflow检测表。
```

---

# V6.8｜角色 / 装备 / 背包 / 商店高品质UI重做

```text
基于 V6.7 + V6.5美术资源做 V6.8。

本版只精修：
角色展台
装备
背包
商店

目标：
彻底摆脱“网页后台 / 卡片矩阵”。

【角色展台】
- 真GLB角色居中
- 左侧角色缩略选择
- 右侧属性/定位
- 不使用大段说明文字
- 属性用图标、条形、短标签

【装备页】
人物是视觉中心。
七装备槽围绕人物，不再是七个文字方框。
已装备模型可显示在人物身上。

左侧：
核心属性

中央：
角色 + 装备位

右侧：
只在选中装备时显示比较

背包不要再塞在装备页最下方。

【背包】
- 物品格
- 容量
- 稀有度边框
- hover tooltip
- 快捷筛选
- 角色小立绘/环境装饰
- 少物品时不能出现大片死黑空白

【商店】
加入商人/摊位场景或至少高品质商铺背景。
商品不是后台列表。
要有：
- 商品陈列
- 当前选中商品大图
- 价格
- 库存
- 解锁
- 购买动画反馈

所有页面继续满足V6.7单屏标准。
```

---

# V6.9｜修行 / 技能 / 山海录 / 地图 / 操作说明最终视觉精修

```text
基于 V6.8 做 V6.9。

本版只精修剩余UI与场景，不新增系统。

【修行总殿 / 洞府】
使用V6.5独立设施资源。
木鱼、丹炉、药圃、聚灵阵不再只是背景热点。
设施hover / active / harvest / craft要有真实动画。

【技能树】
使用真正技能图标、元素纹章、节点底图。
连线加入流光。
已学习/可学习/锁定有真实视觉层次。

【山海录】
全面替换旧spritesheet预览。
角色使用角色立绘/3D截图。
怪物使用portrait。
Boss使用独立Boss立绘。
装备使用品质图标和模型预览。

【操作说明】
直接使用V6.2真实动作演示。
不再展示旧的假动作WebP。

【诸界舆图】
不改地图逻辑，只做节点图标、Boss徽章、区域纹章和层级精修。

【验收】
所有页面100%浏览器一屏显示。
字体、边框、按钮、圆角、阴影、间距统一。
禁止再出现：
“这里像一个网页，那边像另一个网页”。
```

---

# V7.0｜最终资源完整 + 全流程稳定发行版

```text
基于 V6.9 做 Yara冒险日记 V7.0。

V7.0不增加玩法。
只做最终：
资源完整性
集成
性能
存档
音效
全流程QA
发行整理

【一、资源完整性】
建立完整 resource_manifest.json。
检查：

Yara GLB
Yara全部动作
Aster
Moyu
Langa
11种普通怪
11种Boss
第10/15/20阶段Boss
装备模型
洞府设施
技能图标
UI纹章

任何缺失不能静默fallback成明显低质量旧资源。
必须记录fallback原因。

【二、完整流程实际跑】
新存档：
主菜单
→ 世界地图
→ 第1关
→ 背包
→ 装备
→ 修行
→ 木鱼
→ 药圃
→ 炼丹
→ 技能树
→ 副本
→ 第5关
→ 第10关
→ 第15关
→ 第20关

【三、单屏最终验收】
1920×1080
1600×900
1536×864
1366×768

浏览器：
90%
100%
110%
125%

主页面零滚动。

【四、性能】
- Three.js模型离开页面dispose
- Texture dispose
- 关卡图片按需加载
- 对象池
- 粒子池
- 20关连续切换不持续涨内存

【五、错误】
console未处理error = 0
404 = 0
损坏存档拒绝覆盖
BAT不闪退

【六、最终交付】
YaraAdventure_V7.0.zip
README.md
CHANGELOG.md
DATA_SCHEMA.md
RESOURCE_MANIFEST.md
ART_ASSET_GUIDE.md
V7.0_QA_REPORT.md
V7.0_KNOWN_ISSUES.md
playtest_screenshots/

V7.0的目标不是继续做“大”，而是第一次真正做到：
资源完整、动作可信、页面一屏、UI统一、视觉像游戏、可以长期继续扩展。
```

---

# 十、下一步最重要的决定

现在不要直接做 V6.6。

**下一步只做 V6.1。**

把 Yara 真正的：

```text
blend
glb
骨骼
材质
正交四视图
表情
```

先做出来。

然后 V6.2 再专门做动作。

因为如果角色模型没有定稿，继续写战斗代码、角色页、装备页，只会继续拿临时贴图补洞，后面还要返工。

这次应该真正从“资源生产”开始。
