# GLB 导出规范

## Blender导出前
- Apply Scale / Rotation
- 不要改变模型原点
- 删除测试灯光、相机、辅助网格
- 检查 Mesh / Armature / Materials 命名
- 检查 Shape Keys 存在
- 检查贴图路径

## 推荐导出
Format：`glTF Binary (.glb)`

Include：
- Selected Objects

Geometry：
- Apply Modifiers
- UVs
- Normals
- Tangents

Materials：
- PBR兼容材质

Animation：
- V6.1不要求动作
- 但必须保留 Armature / Skin / Morph Targets

## 必须验证
导出的 `yara_v61.glb` 在 Three.js `GLTFLoader` 中：
- 可正常加载
- Skin 正常
- Materials 正常
- Morph Targets 可读取
- BoundingBox 合理
- 人物脚底接近 y=0
- 朝向符合 model.json

验证完成后更新：
- `model/model.json`
- `model/validation.json`
