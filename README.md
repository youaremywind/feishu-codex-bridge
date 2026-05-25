# feishu-codex-bridge

A lightweight bridge between Feishu / Lark messenger and the local Codex CLI. Bind a Feishu app, then talk to Codex from chat to inspect files, read images, edit code, and run commands in a selected working directory.

## Features

- Forward Feishu / Lark messages to the local `codex` CLI
- Per-chat / per-topic sessions with resumable context
- Workspace switching via `/cd` and `/ws`
- Images are passed to Codex via `--image`; other files are injected as local paths
- Streaming card, markdown card, and plain text reply modes
- `/config` can switch the backend agent: Codex by default, Claude Code kept as compatibility mode
- `/stop`, `/timeout`, `/doctor`, daemon mode, and access control

## Requirements

- Node.js >= 20
- `codex` CLI installed and logged in
- `lark-cli` available; startup preflight checks binding
- A Feishu / Lark PersonalAgent app; the first-run QR wizard can create one

## Run locally

```bash
pnpm install
pnpm build
node ./bin/feishu-codex-bridge.mjs run
```

After global install:

```bash
feishu-codex-bridge run
```

Config is stored at:

```text
~/.feishu-codex-bridge/config.json
```

## Commands

Process-level:

```bash
feishu-codex-bridge run [-c <config>]     Run foreground bot
feishu-codex-bridge ps                    List local bridge processes
feishu-codex-bridge kill <id|#>           Kill one bridge process
```

Service-level:

```bash
feishu-codex-bridge start                 Install and start daemon
feishu-codex-bridge stop                  Stop daemon and disable autostart
feishu-codex-bridge restart               Restart daemon
feishu-codex-bridge status                Show daemon status
feishu-codex-bridge unregister            Remove service definition
```

## In-chat commands

| Command | Purpose |
|---|---|
| `/new` `/reset` | Clear current chat session |
| `/resume [N]` | List and restore recent sessions for the current cwd |
| `/cd <path>` | Change cwd and reset session |
| `/ws list/save/use/remove` | Manage named workspaces |
| `/status` | Show cwd / session / agent |
| `/config` | Configure agent, reply mode, tool display, concurrency, access control |
| `/stop` | Stop current run |
| `/timeout [N|off|default]` | Configure idle watchdog for current session |
| `/doctor [description]` | Feed recent logs to the agent for diagnosis |
| `/ps` `/exit <id|#>` | List / stop local bot processes |
| `/help` | Help card |

## Data directory

| Path | Content |
|---|---|
| `~/.feishu-codex-bridge/config.json` | App credentials and preferences |
| `~/.feishu-codex-bridge/sessions.json` | agent session id + cwd per chat / topic |
| `~/.feishu-codex-bridge/workspaces.json` | Named workspace map |
| `~/.feishu-codex-bridge/processes.json` | Live bridge process registry |
| `~/.feishu-codex-bridge/media/<chatId>/` | Downloaded media cache |
| `~/.feishu-codex-bridge/logs/YYYY-MM-DD.log` | Structured runtime logs |

## Agent backend

Default:

```json
{
  "preferences": {
    "agent": "codex"
  }
}
```

Temporary override:

```bash
FEISHU_CODEX_BRIDGE_AGENT=codex feishu-codex-bridge run
LARK_CHANNEL_AGENT=claude feishu-codex-bridge run
```

Run `/new` after switching agents because Codex and Claude session ids are not compatible.

## Security

Codex runs non-interactively and bypasses local approval prompts so Feishu messages can drive the local coding agent. Configure `/config` access control, especially admin and user allowlists, before inviting the bot into shared chats.

## License

MIT
