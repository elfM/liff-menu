# LINE 设置菜单 (LIFF Menu)

Vue 3 + TypeScript 项目，用于通过拖拽配置 LINE 设置菜单的方法与顺序。

## 技术栈

- **Vue 3** + **TypeScript**
- **Vite** 构建
- **VueDraggable** 拖拽
- **LIFF SDK**（可选，用于在 LINE 内运行）

## 使用

```bash
# 安装依赖
npm install

# 开发
npm run dev

# 构建
npm run build

# 预览构建结果
npm run preview
```

## 项目结构

- `src/config/menuMethods.ts` - 预设的菜单方法（可在此新增/修改方法）
- `src/types/menu.ts` - 方法类型定义
- `src/views/MenuConfig.vue` - 拖拽配置页（左：可选方法，右：当前菜单顺序）
- 配置可透过「复制配置 JSON」导出，供 LIFF 或后端使用

## 后续

- 在 LIFF 中根据 `actionKey` 实现各方法逻辑（如 `liff.openWindow`、`liff.shareTargetPicker` 等）
- 可将配置存到后端，按用户或频道区分
