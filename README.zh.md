# feishu-codex-bridge

把飞书 / Lark 消息和本地 Codex CLI 打通的轻量 bot。扫码绑定飞书应用后，可以在飞书里让 Codex 在指定工作目录读文件、看图、改代码、执行命令。

## 功能

- 私聊直接发消息；群里 `@bot` 后转给本地 `codex` CLI
- 每个 chat / 话题维护独立 session，可继续上下文
- `/cd` 和 `/ws` 支持多工作区切换
- 图片会以 Codex `--image` 参数传入；文件路径会注入 prompt
- 流式 / 卡片 / 纯文本三种回复模式
- `/config` 可切换 agent：默认 Codex，也保留 Claude Code 兼容模式
- 支持 `/stop`、`/timeout`、`/doctor`、后台 daemon、访问控制

## 前置条件

- Node.js >= 20
- `codex` CLI 已安装并登录
- `lark-cli` 可用；首次启动会做绑定检查
- 一个飞书 / Lark PersonalAgent 应用；首次启动扫码向导会帮助创建

## 安装与启动

```bash
pnpm install
pnpm build
node ./bin/feishu-codex-bridge.mjs run
```

全局安装后：

```bash
feishu-codex-bridge run
```

首次启动会扫码创建 / 绑定应用，配置写入：

```text
~/.feishu-codex-bridge/config.json
```

## 命令

进程层：

```bash
feishu-codex-bridge run [-c <config>]     前台启动 bot
feishu-codex-bridge ps                    列出本机 bridge 进程
feishu-codex-bridge kill <id|#>           终止指定 bridge 进程
```

服务层：

```bash
feishu-codex-bridge start                 注册并启动后台 daemon
feishu-codex-bridge stop                  停止 daemon 并关闭开机自启
feishu-codex-bridge restart               重启 daemon
feishu-codex-bridge status                查看 daemon 状态
feishu-codex-bridge unregister            删除服务定义文件
```

## 飞书内命令

| 命令 | 作用 |
|---|---|
| `/new` `/reset` | 清空当前 chat 的会话 |
| `/resume [N]` | 列出并恢复当前 cwd 下的历史会话 |
| `/cd <path>` | 切换工作目录，并重置 session |
| `/ws list/save/use/remove` | 管理命名工作空间 |
| `/status` | 查看 cwd / session / agent |
| `/config` | 调整 agent、回复方式、工具显示、并发、访问控制 |
| `/stop` | 终止当前正在跑的任务 |
| `/timeout [N|off|default]` | 当前 session 探活配置 |
| `/doctor [描述]` | 用最近日志让 agent 自诊断 |
| `/ps` `/exit <id|#>` | 查看 / 关闭本机 bot 进程 |
| `/help` | 帮助 |

## 数据目录

| 路径 | 内容 |
|---|---|
| `~/.feishu-codex-bridge/config.json` | 应用凭据和偏好配置 |
| `~/.feishu-codex-bridge/sessions.json` | chat / 话题对应的 agent session id + cwd |
| `~/.feishu-codex-bridge/workspaces.json` | 工作空间映射 |
| `~/.feishu-codex-bridge/processes.json` | 正在运行的 bridge 进程注册表 |
| `~/.feishu-codex-bridge/media/<chatId>/` | 下载的图片 / 文件缓存 |
| `~/.feishu-codex-bridge/logs/YYYY-MM-DD.log` | 结构化运行日志 |

## Agent 配置

默认使用 Codex：

```json
{
  "preferences": {
    "agent": "codex"
  }
}
```

也可以临时覆盖：

```bash
FEISHU_CODEX_BRIDGE_AGENT=codex feishu-codex-bridge run
# 或兼容旧变量
LARK_CHANNEL_AGENT=claude feishu-codex-bridge run
```

切换 agent 后建议在飞书里执行 `/new`，因为 Codex 和 Claude 的 session id 不通用。

## 安全提醒

Codex 运行时默认使用非交互模式并绕过确认，以便飞书消息能远程驱动本地 coding agent。建议至少设置 `/config` 里的管理员和用户白名单，避免陌生人控制你的本机环境。

## 许可

MIT
