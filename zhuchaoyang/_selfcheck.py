# -*- coding: utf-8 -*-
"""一次性自检：HTML 标签闭合 / CSS 大括号平衡 / 类名与 id 引用 / 照片文件是否齐全。"""
import re
import pathlib
from html.parser import HTMLParser

ROOT = pathlib.Path(r"D:\html\zhuchaoyang")
html = (ROOT / "index.html").read_text(encoding="utf-8")
css = (ROOT / "styles.css").read_text(encoding="utf-8")
js = (ROOT / "script.js").read_text(encoding="utf-8")

print("1) CSS 大括号: { =", css.count("{"), "} =", css.count("}"))

used = set()
for m in re.finditer(r'class="([^"]+)"', html):
    used.update(m.group(1).split())
for m in re.finditer(r'className\s*=\s*"([^"]+)"', js):
    used.update(m.group(1).split())
for m in re.finditer(r'classList\.(?:add|remove|toggle)\("([^"]+)"', js):
    used.update(m.group(1).split())

defined = set(re.findall(r"\.([a-zA-Z][\w-]*)", css))
missing = sorted(c for c in used if c not in defined)
print("2) HTML/JS 里用到但 CSS 里没有的类名:", missing)

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link",
        "meta", "source", "track", "wbr"}


class Checker(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.errors = []

    def handle_starttag(self, tag, attrs):
        if tag not in VOID:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if not self.stack:
            self.errors.append("多余的 </%s>" % tag)
        elif self.stack[-1] != tag:
            self.errors.append("闭合不匹配：期望 </%s>，实际 </%s>" % (self.stack[-1], tag))
        else:
            self.stack.pop()


checker = Checker()
checker.feed(html)
print("3) HTML 结构错误:", checker.errors, "| 未闭合:", checker.stack)

ids = set(re.findall(r'id="([^"]+)"', html))
js_ids = set(re.findall(r'\$\("#([\w-]+)"\)', js))
print("4) JS 引用了但 HTML 里不存在的 id:", sorted(js_ids - ids))

anchors = set(re.findall(r'href="#([\w-]+)"', html))
print("5) 导航锚点缺失:", sorted(anchors - ids))

files = {f.name for f in (ROOT / "assets" / "photos").glob("*.jpg")}

# 只统计 PHOTO_FILES 数组内部，避免把注释里的示例文件名也算进来
array_block = re.search(r"var PHOTO_FILES = \[(.*?)\];", js, re.S)
array_files = set(re.findall(r"photo-\d+\.jpg", array_block.group(1))) if array_block else set()

referenced = set(re.findall(r"photo-\d+\.jpg", html)) | array_files
print("6) 引用但缺文件:", sorted(referenced - files))
print("   存在但没引用:", sorted(files - referenced))
print("   PHOTO_FILES 数组中的照片数:", len(array_files))
print("   磁盘上的照片数:", len(files))
