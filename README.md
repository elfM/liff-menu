# LINE 设置菜单 (LIFF Menu)

Vue 3 + TypeScript 项目，用于通过拖拽配置 LINE 设置菜单的方法与顺序。

## 技术栈

- **Vue 3** + **TypeScript**
- **Vite** 构建
- **vue-draggable-plus** 拖拽（左：LINE 菜单方法，右：按顺序同步执行）

## 使用

本项目使用 [pnpm](https://pnpm.io/) 管理依赖。

### 本地开发（需两个终端）

```bash
pnpm install

# 终端 1：Express 代理（解决 CORS）
pnpm dev:server

# 终端 2：前端
pnpm dev
```

访问 http://localhost:5173

### 生产部署（单服务）

```bash
pnpm build
pnpm start
```

访问 http://localhost:3001（或 `PORT` 环境变量指定端口）。Express 同时托管静态页面并代理 LINE API。

## 项目结构

- `src/config/menuMethods.ts` - 预设的菜单方法（可在此新增/修改方法）
- `src/types/menu.ts` - 方法类型定义
- `src/views/MenuConfig.vue` - 拖拽配置页（左：LINE 菜单方法，右：按顺序同步执行的列表）
- 配置可透过「复制配置 JSON」导出；`items` 的 `order` 即执行顺序，供 LIFF 按序调用
