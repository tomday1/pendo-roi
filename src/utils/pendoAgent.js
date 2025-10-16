// src/utils/pendoAgent.js
// Queue-safe tracker for Pendo Conversations API (beta)

const DEFAULT_AGENT_ID =
  process.env.REACT_APP_PENDO_AGENT_ID || 'xS0CKvcdlzgIb_JkjQG-GVQBGYk';

let queue = [];

function hasPendo() {
  return (
    typeof window !== 'undefined' &&
    window.pendo &&
    typeof window.pendo.trackAgent === 'function'
  );
}

function _agentId() {
  return (typeof window !== 'undefined' && window.__ROI_AGENT_ID) || DEFAULT_AGENT_ID;
}

export function setAgentId(id) {
  if (typeof window !== 'undefined') window.__ROI_AGENT_ID = id || DEFAULT_AGENT_ID;
}

export function getConversationId() {
  if (typeof window === 'undefined') return 'server';
  const k = 'roi.conversationId';
  let id = sessionStorage.getItem(k);
  if (!id) {
    id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(k, id);
  }
  return id;
}

export function genMsgId(prefix = 'm') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function flushPendoQueue() {
  if (!hasPendo()) return;
  queue.forEach(([e, p]) => window.pendo.trackAgent(e, p));
  queue = [];
}

if (typeof window !== 'undefined') {
  const t = setInterval(() => {
    if (!queue.length) return;
    flushPendoQueue();
  }, 800);
  window.addEventListener?.('beforeunload', () => clearInterval(t));
}

function track(event, payload) {
  const enriched = {
    agentId: _agentId(),
    conversationId: getConversationId(),
    suggestedPrompt: false,
    toolsUsed: [],
    fileUploaded: false,
    ...payload,
  };
  if (hasPendo()) window.pendo.trackAgent(event, enriched);
  else queue.push([event, enriched]);
}

export function trackPrompt({ content, scope = 'kb', messageId }) {
  track('prompt', {
    messageId: messageId || genMsgId('u'),
    content,
    modelUsed: '—',
    toolsUsed: [scope === 'kb' ? 'knowledge_base' : 'hybrid'],
  });
}

export function trackResponse({ content, pathUsed = 'kb', messageId, modelUsed }) {
  const model =
    modelUsed ||
    (pathUsed === 'kb'
      ? 'internal-kb'
      : pathUsed === 'fallback'
      ? 'gemini-2.5-flash'
      : 'unknown');

  track('agent_response', {
    messageId: messageId || genMsgId('a'),
    content,
    modelUsed: model,
    toolsUsed: [
      pathUsed === 'kb'
        ? 'knowledge_base'
        : pathUsed === 'fallback'
        ? 'web_ai'
        : 'unknown',
    ],
  });
}

export function trackReaction({ messageId, sentiment }) {
  if (!messageId) return;
  track('user_reaction', {
    messageId,
    content: sentiment, // 'positive' | 'negative' | 'mixed'
    modelUsed: '—',
  });
}
