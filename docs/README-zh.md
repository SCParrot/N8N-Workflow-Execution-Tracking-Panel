# N8N 工作流执行跟踪面板

## 🌐 语言版本

- [English](../README.md)（英文版本）
- [中文](README-zh.md)（当前）

一个基于 Next.js + ECharts + Tailwind CSS 构建的工作流执行跟踪面板，用于可视化 N8N 工作流执行状态。

## 🚀 功能特性

- ✅ **工作流选择**：从 N8N 实例获取真实工作流列表，支持切换不同工作流
- ✅ **执行统计**：显示最近 1 小时、6 小时、12 小时、1 天的执行成功/失败次数
- ✅ **执行趋势**：24 小时执行趋势折线图，30 分钟间隔
- ✅ **执行分布**：饼图展示不同时间范围内的执行结果分布
- ✅ **多模式支持**：支持模拟数据模式、测试模式、生产模式
- ✅ **实时数据**：从 N8N API 获取真实执行数据
- ✅ **Docker 部署**：支持一键 Docker 部署
- ✅ **响应式设计**：适配不同屏幕尺寸

## � 截图展示

### 桌面视图

![桌面视图](../images/desktop-screenshot.png)

### 移动视图

![移动视图](../images/mobile-screenshot.png)

## �️ 技术栈

- **前端框架**：Next.js 14（App Router）
- **可视化库**：ECharts
- **样式方案**：Tailwind CSS
- **配置方式**：YAML
- **构建工具**：Next.js Build
- **部署方式**：Docker + PM2

## 📦 快速开始

### 1. 本地开发

#### 1.1 安装依赖

```bash
npm install
```

#### 1.2 配置文件

复制并修改配置文件：

```bash
# 确保配置目录存在
mkdir -p config
```

编辑 `config/config.yaml` 文件：

```yaml
mode: mock  # 选项：mock, test, production

mock:
  enabled: true

test:
  enabled: true
  baseURL: https://your-n8n-instance.com  # 替换为你的 N8N 实例 URL
  token: your-n8n-api-token  # 替换为你的 N8N API 令牌
  workflow:
    id: your-workflow-id

production:
  enabled: true
  baseURL: https://your-n8n-instance.com
  token: your-production-token
  workflow:
    id: your-workflow-id
```

#### 1.3 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

### 2. Docker 部署

#### 2.1 使用 Docker Compose（推荐）

```bash
# 构建并启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

#### 2.2 单独使用 Docker

```bash
# 构建镜像
docker build -t n8n-tracker .

# 运行容器
docker run -d \
  --name n8n-tracker \
  -p 3000:3000 \
  -v ./config:/app/config \
  --restart unless-stopped \
  n8n-tracker
```

#### 2.3 Docker 配置

- **端口映射**：`3000:3000`
- **卷映射**：`./config:/app/config`（持久化配置）
- **重启策略**：`unless-stopped`
- **健康检查**：每 30 秒检查一次应用状态

## ⚙️ 配置说明

### 配置文件

配置文件位于 `config/config.yaml`，支持三种模式：

1. **mock 模式**：使用模拟数据，无需 N8N 实例
2. **test 模式**：测试环境，连接测试 N8N 实例
3. **production 模式**：生产环境，连接生产 N8N 实例

### 环境变量

可以通过环境变量覆盖配置：

| 环境变量 | 描述 | 默认值 |
|---------|------|--------|
| `NODE_ENV` | 运行环境 | `development` |

## 🏗️ 项目结构

```
├── app/                      # Next.js App Router
│   ├── api/                  # API 路由
│   │   └── workflow/         # 工作流相关 API
│   ├── components/           # React 组件
│   ├── data/                 # 测试数据生成
│   ├── globals.css           # 全局样式
│   ├── layout.tsx            # 布局组件
│   └── page.tsx              # 主页面
├── config/                   # 配置文件
│   ├── config.yaml           # 主配置文件
│   └── types.ts              # 配置类型定义
├── tests/                    # 测试文件
├── docs/                     # 文档
│   └── README-zh.md          # 中文 README
├── .dockerignore             # Docker 忽略文件
├── docker-compose.yml        # Docker Compose 配置
├── Dockerfile                # Dockerfile
├── next.config.js            # Next.js 配置
├── package.json              # 依赖配置
├── tailwind.config.js        # Tailwind 配置
└── tsconfig.json             # TypeScript 配置
```

## 📊 API 文档

### 1. 获取工作流列表

```
GET /api/workflow/list
```

**响应**：
```json
{
  "mode": "test",
  "workflows": [
    {
      "id": "workflow-1",
      "name": "数据同步工作流",
      "active": true,
      "createdAt": "2025-12-13T12:25:34.928Z"
    }
  ]
}
```

### 2. 获取执行数据

```
GET /api/workflow/executions?workflowId={workflowId}
```

**参数**：
- `workflowId`：可选，工作流 ID，用于过滤特定工作流的执行数据

**响应**：
```json
{
  "mode": "test",
  "stats": {
    "lastHour": {
      "name": "最近 1 小时",
      "successCount": 10,
      "failureCount": 2
    }
  },
  "chartData": [
    {
      "time": "00:00",
      "success": 2,
      "failure": 0
    }
  ],
  "executions": [/* 执行记录 */]
}
```

## 📈 数据可视化

### 1. 执行结果分布饼图

- 展示不同时间范围内的执行成功/失败分布
- 图例显示具体的成功/失败次数
- 无动画效果，直接切换显示

### 2. 执行趋势折线图

- 24 小时执行状态，30 分钟间隔
- 绿色线条：成功次数
- 红色线条：失败次数
- 独立显示，不堆叠

## 🎯 部署方式

### 1. 本地开发

```bash
npm run dev
```

### 2. 生产构建

```bash
npm run build
npm start
```

### 3. Docker 部署

```bash
docker-compose up -d
```

### 4. PM2 部署

```bash
# 安装 PM2 全局
npm install -g pm2

# 构建应用
npm run build

# 使用 PM2 启动应用
pm2 start npm -- start

# 使用 PM2 重启应用
pm2 restart n8n-tracker

# 查看日志
pm2 logs n8n-tracker

# 停止应用
pm2 stop n8n-tracker
```

#### PM2 管理命令

```bash
# 检查 PM2 状态
pm2 status

# 重启应用
pm2 restart n8n-tracker

# 查看日志
pm2 logs n8n-tracker

# 停止应用
pm2 stop n8n-tracker

# 从 PM2 删除应用
pm2 delete n8n-tracker
```

#### PM2 生态配置

创建 `ecosystem.config.js` 文件：

```javascript
module.exports = {
  apps: [
    {
      name: 'n8n-tracker',
      script: 'npm',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

然后使用以下命令启动：

```bash
npm run build
pm2 start
```

## 🤝 贡献指南

1. Fork 仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

MIT License - 详情请查看 [LICENSE](LICENSE) 文件

## 📞 联系方式

如有问题或建议，请提交 [Issue](https://github.com/your-repo/n8n-tracker/issues)。

## 🙏 致谢

- [N8N](https://n8n.io/) - 强大的自动化工作流平台
- [Next.js](https://nextjs.org/) - 现代 React 框架
- [ECharts](https://echarts.apache.org/) - 优秀的数据可视化库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架

---

**享受使用 N8N 工作流执行跟踪面板！** 🎉