# 数学核心素养AI - 部署指南

## 问题诊断

您遇到的**等待超长无回复**问题是因为：
1. Netlify Functions后端未配置
2. API请求无法到达DeepSeek API

## 解决方案（三选一）

### 方案一：配置Netlify Functions（推荐）

#### 步骤1: 创建Functions目录结构
在您的项目根目录创建以下结构：
```
your-project/
├── netlify/
│   └── functions/
│       └── chat.js
├── index.html
└── netlify.toml
```

#### 步骤2: 复制chat.js文件
将提供的 `netlify-function-chat.js` 重命名为 `chat.js`，放入 `/netlify/functions/` 目录

#### 步骤3: 创建netlify.toml配置文件
```toml
[build]
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"
```

#### 步骤4: 在Netlify设置环境变量
1. 登录 Netlify Dashboard
2. 进入您的站点设置
3. 找到 "Environment variables"
4. 添加变量：
   - Key: `DEEPSEEK_API_KEY`
   - Value: 您的DeepSeek API密钥

#### 步骤5: 重新部署
```bash
git add .
git commit -m "Add Netlify Functions support"
git push
```

---

### 方案二：使用直接API调用（快速测试）

#### 修改index.html中的配置：

找到这段代码（约第259行）：
```javascript
const API_URL = '/.netlify/functions/chat';
// 如果要直接使用DeepSeek API，取消下面这行的注释并填入您的API密钥
// const DIRECT_API_KEY = 'your-deepseek-api-key-here';
// const DIRECT_API_URL = 'https://api.deepseek.com/v1/chat/completions';
```

改为：
```javascript
const API_URL = '/.netlify/functions/chat';
// 直接使用DeepSeek API（仅用于测试，生产环境请使用Netlify Functions）
const DIRECT_API_KEY = 'sk-your-actual-api-key-here'; // 替换为您的真实API密钥
const DIRECT_API_URL = 'https://api.deepseek.com/v1/chat/completions';
```

⚠️ **注意**：这种方式会暴露您的API密钥在前端代码中，**不安全**！仅用于本地测试。

---

### 方案三：使用本地开发服务器测试

#### 安装Netlify CLI
```bash
npm install -g netlify-cli
```

#### 本地运行
```bash
cd your-project
netlify dev
```

这会在本地启动一个开发服务器，模拟Netlify环境。

---

## 验证部署

部署后，打开浏览器控制台（F12），应该看到：
```
==================================================
数学核心素养AI - 已加载
MathJax: ✓
Plotly: ✓
Desmos: ✓
tikzpicture环境: 已配置为忽略
==================================================
```

发送消息时，如果成功应该在30秒内收到回复。

---

## 常见错误及解决

### 错误1: "请求超时"
- 原因：Netlify Functions未部署或DEEPSEEK_API_KEY未配置
- 解决：检查函数是否正确部署，环境变量是否设置

### 错误2: "CORS跨域限制"
- 原因：直接调用DeepSeek API时浏览器阻止
- 解决：必须使用Netlify Functions作为代理

### 错误3: "API请求失败 (401)"
- 原因：API密钥无效或过期
- 解决：检查DeepSeek API密钥是否正确

### 错误4: "API请求失败 (429)"
- 原因：API配额用尽
- 解决：等待配额重置或升级套餐

---

## 获取DeepSeek API密钥

1. 访问 https://platform.deepseek.com/
2. 注册/登录账号
3. 进入API密钥管理页面
4. 创建新的API密钥
5. 复制密钥并保存（密钥只显示一次）

---

## 技术支持

如果仍有问题：
1. 查看浏览器控制台的详细错误信息
2. 查看Netlify部署日志
3. 确认API密钥有效且有余额
4. 检查网络连接是否正常

---

## tikzpicture问题已解决 ✓

本次更新已完全解决"Unknown environment 'tikzpicture'"错误：
- ✓ MathJax配置中添加tikzpicture空环境定义
- ✓ 自动过滤tikzpicture代码块
- ✓ 系统提示词引导AI使用Desmos而非TikZ
- ✓ 添加Plotly.js作为图形渲染备选方案

---

更新日期：2026-01-14
