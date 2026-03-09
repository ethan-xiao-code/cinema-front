# 汪汪影院（cinema-front）

## 项目简介

汪汪影院是一个影院票务管理与在线购票系统，支持电影信息管理、排片管理、在线选座购票以及订单管理等功能。  
系统包含影院后台管理与用户购票两部分，旨在模拟真实影院购票业务流程，并提升系统的可维护性与用户体验。

## 项目功能

### 用户端
- 用户注册 / 登录
- 电影列表浏览
- 电影详情查看
- 在线选座购票
- 实时座位状态同步
- 订单查看与管理

### 管理后台
- 电影信息管理
- 排片管理
- 影院与影厅管理
- 用户管理
- 订单管理
- 数据统计展示

## 技术栈

### 重构前
- Vue2
- ElementUI
- Axios
- Vuex
- Vue Router
- WebSocket

### 重构后
- Vue3
- TypeScript
- Element Plus
- Pinia
- Vue Router
- Vite
- Axios
- WebSocket

## Vue2 → Vue3 重构说明

本项目对原有 Vue2 架构进行了升级与重构，主要优化内容包括：

- **框架升级**  
  将项目从 Vue2 升级至 Vue3，使用 Composition API 重构部分业务逻辑，提升代码复用性与可维护性。

- **类型系统引入**  
  引入 TypeScript，对接口数据与组件逻辑进行类型约束，提高代码可读性与安全性。

- **状态管理优化**  
  将 Vuex 迁移至 Pinia，简化状态管理逻辑，使代码结构更加清晰。

- **UI 组件库升级**  
  ElementUI 升级为 Element Plus，适配 Vue3 生态。

- **构建工具升级**  
  从 Vue CLI 迁移至 Vite，提升开发环境启动速度与构建效率。

- **组件结构优化**  
  对部分公共组件进行抽象封装，提高组件复用率与系统一致性。


## 项目目录结构
src
├── api # 接口请求
├── assets # 静态资源
├── components # 公共组件
├── router # 路由配置
├── store # Pinia 状态管理
├── views # 页面模块
├── utils # 工具函数
└── main.ts # 项目入口


## 运行环境
Node >= 16


## 安装依赖及打包

```bash
npm install
npm run build