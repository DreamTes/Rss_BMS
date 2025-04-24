# RSS信息管理系统

基于Vue 3 + Vite + Element Plus开发的RSS信息管理系统前端项目，支持RSS源管理、文章管理、分类管理等功能。

## 项目结构

### 目录结构

```
src/
├── api/                # API接口请求
│   ├── article.js      # 文章相关API
│   ├── auth.js         # 认证相关API
│   ├── category.js     # 分类相关API
│   ├── dashboard.js    # 仪表盘相关API
│   ├── request.js      # Axios请求封装
│   ├── rssSource.js    # RSS源相关API
│   └── settings.js     # 设置相关API
├── assets/             # 静态资源
│   └── logo.png        # 系统Logo
├── components/         # 通用组件
│   ├── SideMenu.vue    # 侧边栏导航组件
│   └── TopHeader.vue   # 顶部导航栏组件
├── router/             # 路由配置
│   └── index.js        # 路由定义与权限控制
├── views/              # 页面视图
│   ├── CategoriesView.vue  # 分类管理页面
│   ├── HomeView.vue        # 首页/仪表盘
│   ├── LoginView.vue       # 登录/注册页面
│   ├── RssArticlesView.vue # RSS文章管理页面
│   ├── RssSourcesView.vue  # RSS源管理页面
│   └── SettingsView.vue    # 系统设置页面
├── App.vue             # 根组件
└── main.js             # 应用入口
```

### 主要功能模块

#### 1. 登录/注册模块
- 用户登录与认证
- 用户注册
- 记住登录状态
- 路由权限控制

#### 2. RSS源管理模块
- RSS源列表查询、分页、筛选
- 添加、编辑、删除RSS源
- 手动触发RSS源抓取
- 分类关联

#### 3. RSS文章管理模块
- 文章列表查询、分页、筛选
- 文章内容查看
- 文章标记与管理
- 批量操作

#### 4. 分类管理模块
- 分类列表查询
- 添加、编辑、删除分类
- 分类与RSS源关联

#### 5. 系统设置模块
- 系统配置参数管理
- 用户信息设置
- 密码修改

## 页面路由

| 路径 | 名称 | 组件 | 描述 |
|------|------|------|------|
| /login | login | LoginView | 登录/注册页面 |
| / | home | HomeView | 首页/仪表盘 |
| /rss-sources | rssSources | RssSourcesView | RSS源管理 |
| /rss-articles | rssArticles | RssArticlesView | RSS文章管理 |
| /categories | categories | CategoriesView | 分类管理 |
| /settings | settings | SettingsView | 系统设置 |

## 后端API接口规范

所有API请求基础路径: `/api`

### 1. 认证接口

#### 登录
- **URL**: `/auth/login`
- **方法**: `POST`
- **参数**: 
  ```json
  {
    "username": "用户名",
    "password": "密码",
    "remember": true|false
  }
  ```
- **返回**:
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "token": "JWT令牌",
      "user": {
        "id": "用户ID",
        "username": "用户名",
        "email": "邮箱"
      }
    }
  }
  ```

#### 注册
- **URL**: `/auth/register`
- **方法**: `POST`
- **参数**:
  ```json
  {
    "username": "用户名",
    "email": "邮箱",
    "password": "密码"
  }
  ```
- **返回**:
  ```json
  {
    "code": 200,
    "message": "注册成功",
    "data": null
  }
  ```

#### 登出
- **URL**: `/auth/logout`
- **方法**: `POST`
- **参数**: 无
- **返回**:
  ```json
  {
    "code": 200,
    "message": "登出成功",
    "data": null
  }
  ```

#### 检查登录状态
- **URL**: `/auth/check`
- **方法**: `GET`
- **参数**: 无
- **返回**:
  ```json
  {
    "code": 200,
    "message": "已登录",
    "data": {
      "user": {
        "id": "用户ID",
        "username": "用户名",
        "email": "邮箱"
      }
    }
  }
  ```

### 2. RSS源管理接口

#### 获取RSS源列表
- **URL**: `/rss/sources`
- **方法**: `GET`
- **参数**:
  - `page`: 当前页码
  - `pageSize`: 每页数量
  - `keyword`: 搜索关键词(可选)
  - `category`: 分类ID(可选)
  - `status`: 状态(可选)
- **返回**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "total": 100,
      "list": [
        {
          "id": "源ID",
          "name": "源名称",
          "url": "RSS URL",
          "category": {"id": "分类ID", "name": "分类名称"},
          "description": "描述",
          "lastFetchTime": "最后抓取时间",
          "status": "状态",
          "articleCount": 100
        }
      ]
    }
  }
  ```

#### 添加RSS源
- **URL**: `/rss/sources`
- **方法**: `POST`
- **参数**:
  ```json
  {
    "name": "源名称",
    "url": "RSS URL",
    "categoryId": "分类ID",
    "description": "描述",
    "fetchInterval": 30
  }
  ```
- **返回**:
  ```json
  {
    "code": 200,
    "message": "添加成功",
    "data": {
      "id": "新增源ID"
    }
  }
  ```

#### 更新RSS源
- **URL**: `/rss/sources/:id`
- **方法**: `PUT`
- **参数**:
  ```json
  {
    "name": "源名称",
    "url": "RSS URL",
    "categoryId": "分类ID",
    "description": "描述",
    "fetchInterval": 30,
    "status": "状态"
  }
  ```
- **返回**:
  ```json
  {
    "code": 200,
    "message": "更新成功",
    "data": null
  }
  ```

#### 删除RSS源
- **URL**: `/rss/sources/:id`
- **方法**: `DELETE`
- **参数**: 无
- **返回**:
  ```json
  {
    "code": 200,
    "message": "删除成功",
    "data": null
  }
  ```

#### 立即抓取RSS源
- **URL**: `/rss/sources/:id/fetch`
- **方法**: `POST`
- **参数**: 无
- **返回**:
  ```json
  {
    "code": 200,
    "message": "抓取任务已提交",
    "data": {
      "taskId": "任务ID"
    }
  }
  ```

### 3. 文章管理接口

#### 获取文章列表
- **URL**: `/rss/articles`
- **方法**: `GET`
- **参数**:
  - `page`: 当前页码
  - `pageSize`: 每页数量
  - `keyword`: 搜索关键词(可选)
  - `source`: RSS源ID(可选)
  - `category`: 分类ID(可选)
  - `startDate`: 开始日期(可选)
  - `endDate`: 结束日期(可选)
- **返回**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "total": 1000,
      "list": [
        {
          "id": "文章ID",
          "title": "文章标题",
          "link": "原文链接",
          "pubDate": "发布日期",
          "source": {"id": "源ID", "name": "源名称"},
          "summary": "摘要",
          "status": "状态",
          "isRead": true|false
        }
      ]
    }
  }
  ```

#### 获取文章详情
- **URL**: `/rss/articles/:id`
- **方法**: `GET`
- **参数**: 无
- **返回**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "id": "文章ID",
      "title": "文章标题",
      "link": "原文链接",
      "pubDate": "发布日期",
      "source": {"id": "源ID", "name": "源名称"},
      "content": "文章内容",
      "author": "作者",
      "categories": ["分类1", "分类2"],
      "status": "状态",
      "isRead": true|false
    }
  }
  ```

#### 更新文章信息
- **URL**: `/rss/articles/:id`
- **方法**: `PUT`
- **参数**:
  ```json
  {
    "status": "状态",
    "isRead": true|false,
    "isStarred": true|false
  }
  ```
- **返回**:
  ```json
  {
    "code": 200,
    "message": "更新成功",
    "data": null
  }
  ```

#### 删除文章
- **URL**: `/rss/articles/:id`
- **方法**: `DELETE`
- **参数**: 无
- **返回**:
  ```json
  {
    "code": 200,
    "message": "删除成功",
    "data": null
  }
  ```

#### 批量删除文章
- **URL**: `/rss/articles/batch`
- **方法**: `DELETE`
- **参数**:
  ```json
  {
    "ids": ["文章ID1", "文章ID2"]
  }
  ```
- **返回**:
  ```json
  {
    "code": 200,
    "message": "批量删除成功",
    "data": null
  }
  ```

#### 获取最新文章
- **URL**: `/rss/articles/latest`
- **方法**: `GET`
- **参数**:
  - `limit`: 获取数量(可选，默认5)
- **返回**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": [
      {
        "id": "文章ID",
        "title": "文章标题",
        "link": "原文链接",
        "pubDate": "发布日期",
        "source": {"id": "源ID", "name": "源名称"}
      }
    ]
  }
  ```

### 4. 分类管理接口

#### 获取分类列表
- **URL**: `/categories`
- **方法**: `GET`
- **参数**: 无
- **返回**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": [
      {
        "id": "分类ID",
        "name": "分类名称",
        "count": 10,
        "description": "分类描述"
      }
    ]
  }
  ```

#### 添加分类
- **URL**: `/categories`
- **方法**: `POST`
- **参数**:
  ```json
  {
    "name": "分类名称",
    "description": "分类描述"
  }
  ```
- **返回**:
  ```json
  {
    "code": 200,
    "message": "添加成功",
    "data": {
      "id": "新增分类ID"
    }
  }
  ```

#### 更新分类
- **URL**: `/categories/:id`
- **方法**: `PUT`
- **参数**:
  ```json
  {
    "name": "分类名称",
    "description": "分类描述"
  }
  ```
- **返回**:
  ```json
  {
    "code": 200,
    "message": "更新成功",
    "data": null
  }
  ```

#### 删除分类
- **URL**: `/categories/:id`
- **方法**: `DELETE`
- **参数**: 无
- **返回**:
  ```json
  {
    "code": 200,
    "message": "删除成功",
    "data": null
  }
  ```

### 5. 系统设置接口

#### 获取系统设置
- **URL**: `/settings`
- **方法**: `GET`
- **参数**: 无
- **返回**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "systemName": "系统名称",
      "defaultFetchFrequency": 30,
      "maxArticleAge": 30,
      "cleanupInterval": 24,
      "theme": "light"
    }
  }
  ```

#### 更新系统设置
- **URL**: `/settings`
- **方法**: `PUT`
- **参数**:
  ```json
  {
    "systemName": "系统名称",
    "defaultFetchFrequency": 30,
    "maxArticleAge": 30,
    "cleanupInterval": 24,
    "theme": "light"
  }
  ```
- **返回**:
  ```json
  {
    "code": 200,
    "message": "更新成功",
    "data": null
  }
  ```

#### 获取用户信息
- **URL**: `/user/info`
- **方法**: `GET`
- **参数**: 无
- **返回**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "id": "用户ID",
      "username": "用户名",
      "email": "邮箱",
      "avatar": "头像URL"
    }
  }
  ```

#### 更新用户信息
- **URL**: `/user/info`
- **方法**: `PUT`
- **参数**:
  ```json
  {
    "email": "邮箱",
    "avatar": "头像URL",
    "nickname": "昵称"
  }
  ```
- **返回**:
  ```json
  {
    "code": 200,
    "message": "更新成功",
    "data": null
  }
  ```

#### 修改密码
- **URL**: `/user/password`
- **方法**: `PUT`
- **参数**:
  ```json
  {
    "oldPassword": "旧密码",
    "newPassword": "新密码"
  }
  ```
- **返回**:
  ```json
  {
    "code": 200,
    "message": "修改成功",
    "data": null
  }
  ```

### 6. 仪表盘接口

#### 获取仪表盘统计数据
- **URL**: `/dashboard/statistics`
- **方法**: `GET`
- **参数**: 无
- **返回**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "totalSources": 100,
      "totalArticles": 5000,
      "todayNewArticles": 50,
      "categoriesCount": 10,
      "fetchStats": {
        "success": 80,
        "failed": 20
      }
    }
  }
  ```

## 开发与部署说明

### 项目环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0

### 项目安装
```bash
npm install
```

### 开发环境启动
```bash
npm run dev
```

### 生产环境构建
```bash
npm run build
```

### 自定义配置
见 [Vite配置参考](https://vitejs.dev/config/).

## 技术栈

- [Vue 3](https://v3.vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Vue Router](https://router.vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [Axios](https://axios-http.com/)

