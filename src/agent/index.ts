import { ClaudeAdapter } from './claude/adapter';
import { CodexAdapter } from './codex/adapter';
export type { AgentAdapter, AgentEvent, AgentRun, AgentRunOptions, AgentAttachment } from './types';

export type AgentId = 'codex' | 'claude';

export function createAgent(id: AgentId = 'codex') {
  return id === 'claude' ? new ClaudeAdapter() : new CodexAdapter();
}

export function parseAgentId(raw: unknown): AgentId {
  return raw === 'claude' ? 'claude' : 'codex';
}

export { ClaudeAdapter } from './claude/adapter';
export { CodexAdapter } from './codex/adapter';
