# 2D 资源生产与编辑

资源由 imagegen 生成透明 RGBA 图集，原图保存在 assets/v8/source。以原始 assets/characters/Yara/20260814.png 为 Yara 身份参考，保持棕色丸子头、大眼睛、奶白衣服和 Q 版比例。

每个实体目录包含 animations.json、frames/*.png 与各动作左右 WebP 图条。帧画布为 384×384，脚底基线约 365，统一底部锚点。宽图集按透明行列间隙找边界，避免均分裁切切掉 Boss 光环。先根据 alpha 裁出完整主体，再放入透明标准帧。原图 alpha 保留，不把预览底色误当成图片背景。

animations.json 的方向路径、帧数、fps、循环、锚点和 timing 控制运行时。主角攻击 timing 从旧版保留，确保换图后伤害窗口仍生效。相同图条按内容去重引用，独立帧仍保留便于修改。

装备图标在 items/icons.json，紧裁服装和鞋在 wearables。ui/v80-presentation.js 的附件位置控制穿戴外观；新增服装需要配套逐姿态校准。此处不是骨骼动画，也没有真实 3D 模型。
