# 今天吃什么？

一个使用 Next.js、TypeScript 和 TailwindCSS 重构的随机吃饭决策器。页面被重新设计为“夜市抽签机”：转盘、候选菜牌、结果仪式感、烟花和音效都集中在首屏。

## 功能

- 随机转盘选择今天吃什么
- 候选菜牌支持新增、删除、编辑、单项恢复和全部恢复默认
- 候选列表保存在浏览器 localStorage
- 抽中结果高亮，并保留最近 5 次结果
- 结果展示时播放 `man.mp3` 并显示 `man.png`
- Canvas 烟花动画在结果公布后播放
- 响应式布局，适配桌面和移动端

## 技术栈

- Next.js App Router
- React 19
- TypeScript
- TailwindCSS
- Node test runner + tsx

## 本地运行

```bash
npm install
npm run dev
```

默认访问地址为 `http://localhost:3000`。

## 验证

```bash
npm test
npm run lint
npm run build
```

## 主要结构

```text
app/
  layout.tsx
  page.tsx
  globals.css
components/
  food-decider.tsx
  fireworks-canvas.tsx
  toast.tsx
hooks/
  use-local-foods.ts
lib/
  foods.ts
  spin.ts
public/
  man.png
  man.mp3
```
