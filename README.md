# 朱朝阳 · 个人主页

一个纯手写的静态个人主页，无框架、无 CDN、无外部依赖，**双击 `index.html` 就能打开**。

## 目录结构

```
D:\html\zhuchaoyang\
├── index.html            # 页面结构
├── styles.css            # 全部样式（含深色模式）
├── script.js             # 相册渲染、灯箱、主题切换、滚动动画
├── README.md             # 本说明
└── assets\
    └── photos\           # 21 张照片（photo-01.jpg ~ photo-21.jpg）
```

照片由 `D:\zhu` 复制而来，并按文件名排序重命名为 `photo-01` ~ `photo-21`，
**原始文件仍完整保留在 `D:\zhu`，没有删改。**

| 页面用的名字 | 对应的原文件 |
| --- | --- |
| photo-01.jpg | 021409d3b08589f6d8afd79f0459d3fa.jpg |
| photo-02.jpg | 066c9f1394fa7359c37d22b09f277eb1.jpg |
| photo-03.jpg | 0c7b837016a9386dc37d8c62a48bc91f.jpg |
| photo-04.jpg | 214c11cdda1d675b9d1fd1a360ce4077.jpg |
| photo-05.jpg | 2cd88317f451117510d2342976e82339.jpg |
| photo-06.jpg | 40351af3599b0cc40e970a5ca1d3040d.jpg |
| photo-07.jpg | 460b60fe7e843d0a2c9e5b01e6226b39.jpg |
| photo-08.jpg | 461c96fe4a9729212abe04263970a39a.jpg |
| photo-09.jpg | 51a647232c75ac62b352af704754121d.jpg |
| photo-10.jpg | 63c4ab8da1b825e74a6f7517cbdf5379.jpg |
| photo-11.jpg | 6982e9f90d01634f67a2dad3459f2dd9.jpg |
| photo-12.jpg | 701364f1103d792d767b4d926974b07a.jpg |
| photo-13.jpg | 7247925f29d28cd28191e85cfdf44057.jpg |
| photo-14.jpg | 7b42c43ca53b767bf2be25bbb1f1cea5.jpg |
| photo-15.jpg | a594654d3b6d51dffeee7855587e46fd.jpg |
| photo-16.jpg | b8d0760dcd4ebbe5c876ec5294f51deb.jpg |
| photo-17.jpg | b8d794c0a83b2441b8148c69c1e56b12.jpg |
| photo-18.jpg | bac80de458a26c76df53e6cd03840ab2.jpg |
| photo-19.jpg | bd6cdc20ef09d9bc2aa1b89aefab0dd3.jpg |
| photo-20.jpg | c3747b94e4a5233c2089d67686c511b9.jpg |
| photo-21.jpg | ccf540b9d73359bf12c1e68cb0728598.jpg |

## 页面包含哪些内容

1. **首屏**：姓名、三条身份标签（康县 / 2008 / 兰州工业学院）、主视觉照片。
2. **关于**：出生年份、家乡、就读院校、目前状态四张信息卡 + 一段介绍。
3. **成长轨迹**：2008 → 康县少年时光 → 从康县到兰州 → 现在，共 4 个节点。
4. **校园**：兰州工业学院的校训版式块 + 事实清单（1942 年培黎工艺学校、2012 年改建本科等）。
5. **家乡**：康县的位置、物产（核桃、蚕桑、魔芋、水稻）、下辖乡镇。
6. **相册**：21 张照片网格，点击放大，方向键 / 滑动切换，Esc 或点背景关闭。
7. **联系 + 页脚**：邮箱 / 微信 / 学校三张卡片。

校园与家乡的资料来自**兰州工业学院官网《学校简介》**和**康县人民政府网站**公开内容，
页面底部也标注了来源，没有编造细节。

## 怎么改成他自己的资料

| 想改什么 | 改哪里 |
| --- | --- |
| 主页文字、标签、介绍段落 | `index.html` 里搜关键词，直接改中文 |
| 邮箱、微信 | `index.html` 中搜索 `待填写`，替换成真实内容（可把 `<p>` 换成 `<a href="mailto:...">`） |
| 照片说明文字 | `script.js` 顶部 `CAPTIONS` 对象，按 `"photo-03.jpg": "说明"` 的格式添加，留空则不显示 |
| 增加 / 删除照片 | 把照片放进 `assets/photos\`，再改 `script.js` 里的 `PHOTO_FILES` 数组 |
| 首屏大图换成别的照片 | `index.html` 中 `assets/photos/photo-01.jpg` 改成想用的那张 |
| 配色 | `styles.css` 顶部 `:root` 里的 `--primary`（墨绿）、`--accent`（琥珀） |

## 改完之后可以自检

改完文件后，在 `D:\html\zhuchaoyang` 目录下跑一遍：

```powershell
python _selfcheck.pyp-
# 输出应全部为空列表，且照片数量两边都是 21

python ..\check_js_syntax.py script.js index.html
# 用 esprima 校验 JS 语法（本机已有该依赖），应显示「全部通过」
```

`_selfcheck.py` 会检查 HTML 标签是否闭合、CSS 里有没有漏定义的类名、
JS 引用的 id 和导航锚点是否存在、照片文件是否齐全。

## 修复记录

**2026-09-17 修复「往下滑是空白」的问题**，原因是两个叠加缺陷：

1. **CSS 优先级写错**（主因）：为了让 JS 失效时不白屏，隐藏规则改成了
   `html.js .reveal { opacity: 0 }`，它的优先级（0,2,1）**高于**
   `.reveal.is-visible { opacity: 1 }`（0,2,0），于是内容即使被判定为「该显示」也依然是透明的。
   现在两条规则都带 `html.js` 前缀，优先级一致，显示规则才真正生效。
2. **相册卡片没被纳入兜底显示逻辑**：相册的 21 张照片卡片原来只由独立的
   IntersectionObserver 负责显示，一旦该观察器不触发，照片区就是空白。
   现在改为一套统一机制（`watchReveal()`）：IntersectionObserver **+**
   基于 `getBoundingClientRect` 的兜底扫描（初始 / 滚动 / 缩放 / load / 旋转都会扫），
   两条路任一条生效即可显示内容。

无头浏览器实测结果（Edge headless）：

| 检查项 | 结果 |
| --- | --- |
| 43 个渐入元素在视口内时的 `is-visible` 数量 | 43 / 43 |
| 禁用动画后 `.reveal.is-visible` 的最终 opacity | 1 / 1 / 1 / 1 / 1 |
| 未显示的 `.reveal` 元素 opacity（应保持 0，动画保留） | 0 |
| 触发滚动事件后放开的内容数量 | 0 → 43（含相册 21 张） |
| 整页截图 19 个横向条带的内容占比 | 无空白条带，相册区 62%~83% |
| 相册灯箱打开 / 计数 / 关闭 | 10 / 21，开闭正常 |
| 深色模式切换 | light → dark 正常 |

## 说明与注意事项

- **我需要坦白一点**：我无法查看图片内容（当前不具备图像识别能力），所以照片说明、
  以及照片里出现的地点和时间，都留成了空白或通用表述，需要你自己补。
- 页面的照片版权归本人所有。**如果要放到公网，请先征得朱朝阳本人同意**——
  真实姓名、出生年份、就读院校属于个人信息。目前它只是一个本地页面。
- 页面在 `file://` 协议下即可运行，不需要装任何环境；想发布到静态托管（如 GitHub Pages、
  Gitee Pages）时，整个文件夹原样上传即可。
- 深色模式：点右上角圆形按钮切换，选择会记在浏览器本地。
