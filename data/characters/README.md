# V3.5 角色注册数据

角色统一由 `assets/characters/index.json` 注册。UI 不枚举角色名，而是：

1. 读取 `index.json`；
2. 按 `folder + data` 读取各角色 `character.json`；
3. 自动建立角色展台列表；
4. 按 `growthDefaults` 为存档补齐独立角色成长档案。

## 角色目录约定

```text
assets/characters/<CharacterId>/
├─ character.json
├─ portrait.webp
├─ preview/
│  ├─ left_far.webp
│  ├─ left_3q.webp
│  ├─ front.webp
│  ├─ right_3q.webp
│  └─ right_far.webp
├─ v32/animations.json      # 有完整动作时使用
└─ model/character.glb      # 未来接口，本版不要求存在
```

## 存档结构

```json
{
  "selectedCharacter": "Yara",
  "characters": {
    "Yara": {"level":1,"exp":0,"skillPoints":0,"equipment":{},"skills":{}},
    "Aster": {"level":1,"exp":0,"skillPoints":0,"equipment":{},"skills":{}},
    "Moyu": {"level":1,"exp":0,"skillPoints":0,"equipment":{},"skills":{}},
    "Langa": {"level":1,"exp":0,"skillPoints":0,"equipment":{},"skills":{}}
  },
  "cultivation": {
    "stones": 0,
    "herbs": 0
  }
}
```

V3.5 仍让 Yara 使用现有战斗代码；其他三名角色先注册、展示与拥有独立成长存档，不伪装成已完成战斗角色。
