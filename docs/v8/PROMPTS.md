# V8 图像生成提示词记录与复现规范

以下为本次生成任务的保存规范和内容记录。生成使用 imagegen，所有输出要求透明背景、无文字、无水印、完整主体和清晰图格。原始输出在 assets/v8/source，以 exec 文件名追溯。

Yara 主图：Use the supplied original cute chibi Yara reference. Preserve her big brown eyes, brown hair bun, cream wrap hoodie, white shorts and shoes. Create a transparent 4 by 4 sprite atlas, full body, consistent scale and foot baseline. Four run poses, four sword attack poses, four jump poses, then idle, hurt, meditation and victory. No labels, no background, no clipped limbs.

Yara 补充：Same original chibi Yara identity. A transparent 4 by 4 atlas with distinct second and third sword combos, blue magic projectile poses, hurt, knockdown, get-up and stun. Keep each figure isolated with generous gutters.

其他角色：Transparent 3 by 4 atlas. Rows are Aster, a white-haired navy star mage; Moyu, a black ponytail red warrior; Langa, a mint and jade character. Columns are idle, run, attack and hurt. Full body, matching cute chibi 2D game style.

普通怪各 4×4 图集：Each row is one creature and each column idle, walk, attack, hurt. First set peachling, red panda, stone golem, peach guardian. Next set fireling, phoenix, frostling, shadow fox. Final set abyssling, rune golem, jiangshi, sunling. Cute readable silhouettes, transparent RGBA, no text, keep effects inside cells.

Boss 三组：Transparent 4 by 4 atlas. Each row one boss, columns idle, movement, attack, hurt. Set one red panda chief, stone golem lord, fire spirit lord, phoenix lord. Set two frost spirit, shadow fox queen, abyss lord, rune golem lord. Set three jiangshi lord, sun spirit lord, celestial phoenix, jade thunder golem. Boss ornaments and halos remain fully inside isolated cells.

装备图标：Transparent 4 by 4 inventory icon sheet, three swords, hairpin, headband, crown, two robes, three shoes, jade belt, talisman, necklace, refined iron and spirit dust. Consistent fantasy chibi game rendering, no text.

服装附件：Transparent 4 by 2 sheet of headless wearable layers. Four robes or armor layers (linen, cloud blue, star purple, jade) and four pairs of shoes (straw, cloud, thunder, leather). No body, no heads, no ground, front three-quarter orientation to fit chibi character. Large separated gutters.

材料与药水：Transparent 4 by 2 sheet of red potion, blue potion, peach petals, bamboo fiber, spirit dust, refined iron, peach core and old quest map. Isolated fantasy inventory icons, no labels.

生成输出之后做了自动切帧、图条打包和锚点处理。再次生成不能保证像素级一致，需要人工审阅身份、比例和动作连续性。
