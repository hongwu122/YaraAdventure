# Yara V6.1 材质规范

## 目标
高质量卡通Q版，不追求真人写实皮肤和毛发。

## 材质槽

建议至少：

- `MAT_Face`
- `MAT_Eyes`
- `MAT_Hair`
- `MAT_Skin`
- `MAT_Cloth`
- `MAT_SocksShoes`

## 贴图

建议主贴图统一 2048×2048：

- `body_albedo.webp`
- `face_albedo.webp`
- `hair_albedo.webp`
- `clothing_albedo.webp`
- `normal.webp`
- `roughness.webp`
- `ao.webp`

## 风格要求

### Face / Skin
- 皮肤柔和、干净、偏卡通。
- 不做真实毛孔、雀斑、皮肤粗糙度细节。
- 脸颊可保留母版中的轻微粉红。

### Eyes
- 保持母版超大眼睛比例。
- 大瞳孔、高光清晰。
- 不改成写实玻璃眼。

### Hair
- 深棕色，与母版一致。
- 丸子头必须保持体量和轮廓。
- 使用块状发束 + 卡通高光，不使用真实毛发粒子系统作为最终Web资产。

### Clothing
- 白色宽松上衣、白色下装/袜鞋。
- 白色保持干净，允许暖灰阴影，不要脏黄。
- 袖子必须考虑后续绑定和动作变形。

## PBR建议
- Metallic：0（除非后续新增金属饰件）
- Roughness：皮肤 0.45~0.65；头发 0.28~0.45；衣物 0.55~0.75
- Normal：轻量，不要破坏Q版柔和轮廓
- AO：用于发根、衣褶、袖口、鞋底接触位置
