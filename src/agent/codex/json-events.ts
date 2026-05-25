import type { AgentEvent } from '../types';

interface CodexThreadStartedEvent {
  type: 'thread.started';
  thread_id?: string;
}

interface CodexTurnCompletedEvent {
  type: 'turn.completed';
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
}

interface CodexItemEvent {
  type: 'item.started' | 'item.completed';
  item?: {
    id?: string;
    type?: string;
    command?: string;
    aggregated_output?: string;
    exit_code?: number | null;
    status?: string;
    text?: string;
  };
}

type CodexRawEvent = CodexThreadStartedEvent | CodexTurnCompletedEvent | CodexItemEvent | { type?: string };

export function* translateEvent(raw: unknown): Generator<AgentEvent> {
  if (!raw || typeof raw !== 'object') return;
  const evt = raw as CodexRawEvent;

  if (evt.type === 'thread.started') {
    const sessionId = (evt as CodexThreadStartedEvent).thread_id;
    yield { type: 'system', sessionId };
    return;
  }

  if ((evt.type === 'item.started' || evt.type === 'item.completed') && 'item' in evt) {
    const item = (evt as CodexItemEvent).item;
    if (!item) return;

    if (item.type === 'command_execution') {
      const id = item.id ?? stableToolId(item.command ?? 'command');
      if (evt.type === 'item.started') {
        yield {
          type: 'tool_use',
          id,
          name: 'Bash',
          input: { command: cleanCommand(item.command ?? '') },
        };
      } else {
        const output = item.aggregated_output ?? '';
        yield {
          type: 'tool_result',
          id,
          output,
          isError: typeof item.exit_code === 'number' ? item.exit_code !== 0 : item.status === 'failed',
        };
      }
      return;
    }

    if (evt.type === 'item.completed' && item.type === 'agent_message' && typeof item.text === 'string') {
      yield { type: 'text', delta: item.text };
      return;
    }

    return;
  }

  if (evt.type === 'turn.completed') {
    const usage = (evt as CodexTurnCompletedEvent).usage;
    if (usage) {
      yield {
        type: 'usage',
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
      };
    }
    yield { type: 'done' };
  }
}

function cleanCommand(command: string): string {
  return command.replace(/^\/bin\/(?:z|ba)?sh\s+-lc\s+/, '').trim() || command;
}

function stableToolId(seed: string): string {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `codex-tool-${(h >>> 0).toString(16)}`;
}
