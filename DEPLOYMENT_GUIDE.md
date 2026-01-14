# 数学核心素养AI - 部署指南

## ⚠️ 502错误解决方案

您看到的**502错误: error decoding lambda response**是因为：
1. ❌ Netlify Functions的响应格式不正确
2. ❌ 尝试使用流式传输但Netlify不支持
3. ❌ package.json依赖未正确配置

### 快速修复步骤：

#### 第一步：创建正确的目录结构
```
your-project/
├── index.html
├── netlify.toml
├── package.json          ← 新增
└── netlify/
    └── functions/
        └── chat.js       ← 使用 chat-simple.js 的内容
```

#### 第二步：使用简化版函数
**将 `chat-simple.js` 的内容复制到 `/netlify/functions/chat.js`**

关键改进：
- ✅ 关闭流式传输 (`stream: false`)
- ✅ 正确的响应格式
- ✅ 完整的错误处理

#### 第三步：添加package.json
将提供的 `package.json` 文件放到项目根目录

#### 第四步：配置环境变量
在Netlify Dashboard中：
1. Site settings → Environment variables
2. 添加变量：
   - **Key**: `DEEPSEEK_API_KEY`
   - **Value**: `sk-你的API密钥`

#### 第五步：重新部署
```bash
git add .
git commit -m "Fix 502 error - use non-streaming mode"
git push
```

---

## 问题诊断

您遇到的**等待超长无回复**问题是因为：
1. Netlify Functions后端未配置
2. API请求无法到达DeepSeek API

## 完整部署方案

### 方案一：Netlify Functions（推荐 - 已修复）

#### 文件清单：
1. ✅ `index.html` - 前端页面（已支持非流式模式）
2. ✅ `chat-simple.js` → 重命名为 `chat.js`
3. ✅ `netlify.toml` - 配置文件
4. ✅ `package.json` - 依赖管理

#### 部署步骤：
```bash
# 1. 创建目录结构
mkdir -p netlify/functions

# 2. 复制文件
cp chat-simple.js netlify/functions/chat.js
cp package.json .
cp netlify.toml .
cp index.html .

# 3. 提交
git add .
git commit -m "Deploy with Netlify Functions"
git push

# 4. 在Netlify设置环境变量 DEEPSEEK_API_KEY
```

---

### 方案二：直接API调用（快速测试 - 不安全）

修改 `index.html` 第263-265行：
```javascript
const DIRECT_API_KEY = 'sk-你的真实API密钥';
const DIRECT_API_URL = 'https://api.deepseek.com/v1/chat/completions';
```

⚠️ **警告**：此方式暴露API密钥，仅用于测试！

---

## 验证部署

### 1. 检查Functions日志
在Netlify Dashboard → Functions → chat → Logs

应该看到：
```
📨 收到请求: { model: 'deepseek-chat', messageCount: 2 }
✅ 请求成功
```

### 2. 浏览器控制台
按F12，应该看到：
```
==================================================
数学核心素养AI - 已加载
MathJax: ✓
Plotly: ✓
Desmos: ✓
tikzpicture环境: 已配置为忽略
==================================================
使用Netlify Functions (非流式模式)
```

### 3. 测试对话
发送"你好"，5-10秒内应收到回复

---

## 常见错误及解决

### ❌ 错误1: 502 - error decoding lambda response
**原因**：Functions返回格式错误或使用了流式传输
**解决**：
1. 使用 `chat-simple.js`（非流式版本）
2. 确保 `stream: false`
3. 检查返回格式包含正确的headers

### ❌ 错误2: 请求超时
**原因**：Functions未部署或启动失败
**解决**：
1. 检查Functions日志
2. 确认package.json存在
3. 重新部署

### ❌ 错误3: API密钥未配置
**原因**：环境变量未设置
**解决**：
1. Netlify Dashboard → Environment variables
2. 添加 `DEEPSEEK_API_KEY`
3. 触发重新部署

### ❌ 错误4: 401 Unauthorized
**原因**：API密钥无效
**解决**：
1. 检查密钥是否正确复制
2. 确认密钥未过期
3. 检查密钥格式（应为 sk-xxx）

### ❌ 错误5: 429 Too Many Requests
**原因**：API配额用尽
**解决**：
1. 等待配额重置
2. 升级API套餐
3. 检查是否有异常请求

---

## 获取DeepSeek API密钥

1. 访问 https://platform.deepseek.com/
2. 注册/登录账号
3. 进入API密钥管理
4. 创建新密钥
5. 复制并保存（只显示一次）

---

## 文件说明

### index.html（已修复）
- ✅ tikzpicture错误已解决
- ✅ 支持非流式模式
- ✅ 30秒超时保护
- ✅ 详细错误提示

### chat-simple.js（推荐使用）
- ✅ 非流式传输（更稳定）
- ✅ 完整错误处理
- ✅ 详细日志输出
- ✅ 正确的响应格式

### netlify.toml
- 配置Functions目录
- 设置Node版本
- 配置构建环境

### package.json
- node-fetch依赖
- ES模块支持

---

## 技术支持

### 调试技巧：
1. **前端**：F12 → Console/Network
2. **后端**：Netlify Dashboard → Functions → Logs
3. **API**：检查DeepSeek控制台的使用记录

### 联系支持：
- Netlify支持：https://answers.netlify.com/
- DeepSeek文档：https://platform.deepseek.com/docs

---

## tikzpicture问题 ✅ 已解决

- ✓ MathJax配置tikzpicture空环境
- ✓ 自动过滤tikzpicture代码
- ✓ 引导AI使用Desmos
- ✓ Plotly.js备选方案

---

更新日期：2026-01-14
版本：v2.0 (修复502错误)
