# LLM News 应用

一个基于 React 和 Capacitor 开发的跨平台新闻应用，专注于展示LLM（大语言模型）相关公司的最新动态。

## 功能特点

- 📰 展示多家LLM公司的新闻资讯
- 🔄 下拉刷新获取最新新闻
- 🔍 按公司筛选新闻内容
- 🎯 手势滑动切换标签页
- 📱 跨平台支持（Web、Android）
- 🎨 响应式设计，适配不同屏幕尺寸
- 🔔 触觉反馈增强用户体验

## 技术栈

- **前端框架**: React 18
- **构建工具**: Vite
- **跨平台框架**: Capacitor 5
- **样式**: CSS
- **数据服务**: 自定义新闻服务
- **移动功能**: Capacitor 插件（Haptics、Browser等）

## 项目结构

```
llm-news-capacitor/
├── android/           # Android 平台代码
├── dist/              # 构建输出目录
├── src/               # React 源代码
│   ├── App.jsx        # 主应用组件
│   ├── App.css        # 样式文件
│   └── main.jsx       # 应用入口
├── utils/             # 工具函数
│   ├── config.js      # 配置文件
│   └── newsService.js # 新闻服务
├── index.html         # HTML 入口
├── package.json       # 项目依赖
└── capacitor.config.ts # Capacitor 配置
```

## 安装与运行

### 前置要求

- Node.js 16.x 或更高版本
- npm 或 yarn
- Android Studio (如需开发Android应用)

### 安装步骤

1. 克隆项目

```bash
git clone <repository-url>
cd llm-news-capacitor
```

2. 安装依赖

```bash
npm install
```

3. 运行开发服务器

```bash
npm run dev
```

4. 构建生产版本

```bash
npm run build
```

## Android 平台开发

### 添加 Android 平台

```bash
npx cap add android
```

### 同步和构建 Android 应用

```bash
npm run capacitor:build:android
```

此命令会自动构建Web应用、同步到Android平台并打开Android Studio。

## 使用说明

### 浏览新闻
- 在首页可以看到所有LLM公司的最新新闻
- 点击顶部标签可以筛选特定公司的新闻
- 在新闻内容区域左右滑动可以切换标签页

### 刷新内容
- 点击右上角的"刷新"按钮获取最新新闻
- 刷新操作会触发触觉反馈

### 查看详情
- 点击新闻条目可以在浏览器中打开完整新闻
- 点击操作会触发触觉反馈

## 手势操作

- **左右滑动**: 在新闻内容区域左右滑动可以切换公司标签
- **点击**: 点击公司标签切换新闻筛选
- **刷新**: 点击刷新按钮更新新闻内容

## 配置文件

### Capacitor 配置

`capacitor.config.ts` 文件包含了应用的基本配置，如应用名称、ID、服务器设置等。

### 新闻服务配置

`utils/config.js` 包含了新闻服务的相关配置。

## 许可证

MIT License

## 开发说明

### 添加新功能
1. 修改源代码后运行 `npm run build` 构建Web版本
2. 运行 `npx cap sync` 同步到各平台
3. 如需测试特定平台，使用相应的构建命令

### 版本控制
- 代码使用Git进行版本控制
- 遵循标准的Git工作流程

### 贡献指南
欢迎提交Issue和Pull Request来改进此应用。