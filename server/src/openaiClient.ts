import { config, openAiConfigured } from './config.js';
import { consumeOpenAiBudget } from './rateLimit.js';

export type ExplainKind = 'opportunity' | 'guide';

export interface VerifiedFactsPayload {
  kind: ExplainKind;
  /** Only verified fields — model must not add facts beyond this object. */
  facts: Record<string, unknown>;
  /** Deterministic reason codes already computed client-side. */
  reasonCodes: string[];
  /** Optional user-visible focus snippet (already permission-gated client-side). */
  focusSnippet?: string | null;
}

export interface ExplainResult {
  ok: boolean;
  explanation: string | null;
  errorCode?: 'not_configured' | 'rate_limited' | 'budget_exceeded' | 'upstream_error' | 'invalid_response';
}

const SYSTEM_PROMPT = `You are a careful assistant for the Reelyou Starpath feature.
You receive VERIFIED_FACTS as JSON. Write 1-2 short sentences explaining why an item may fit the user.
Rules:
- Use ONLY information present in VERIFIED_FACTS and REASON_CODES.
- Do NOT invent URLs, dates, deadlines, eligibility, people, organizations, or events.
- Do NOT diagnose or infer sensitive identity traits.
- If facts are insufficient, say the fit is exploratory and suggest reviewing the official source.
- Keep tone calm and non-certain.`;

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

export async function explainWithOpenAi(payload: VerifiedFactsPayload): Promise<ExplainResult> {
  if (!openAiConfigured()) {
    return { ok: false, explanation: null, errorCode: 'not_configured' };
  }
  if (!consumeOpenAiBudget()) {
    return { ok: false, explanation: null, errorCode: 'budget_exceeded' };
  }

  const userContent = JSON.stringify({
    VERIFIED_FACTS: payload.facts,
    REASON_CODES: payload.reasonCodes,
    FOCUS_SNIPPET: payload.focusSnippet ?? null,
  });

  let lastError: unknown;
  for (let attempt = 0; attempt <= config.openAi.maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), config.openAi.timeoutMs);
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.openAi.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.openAi.model,
          temperature: 0.2,
          max_tokens: config.openAi.maxOutputTokens,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userContent },
          ],
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.status === 429) {
        await sleep(400 * (attempt + 1));
        continue;
      }
      if (!res.ok) {
        lastError = new Error(`OpenAI HTTP ${res.status}`);
        if (res.status >= 500 && attempt < config.openAi.maxRetries) {
          await sleep(300 * (attempt + 1));
          continue;
        }
        return { ok: false, explanation: null, errorCode: 'upstream_error' };
      }

      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = json.choices?.[0]?.message?.content?.trim();
      if (!text) return { ok: false, explanation: null, errorCode: 'invalid_response' };
      return { ok: true, explanation: text.slice(0, 600) };
    } catch (err) {
      lastError = err;
      if (attempt < config.openAi.maxRetries) await sleep(300 * (attempt + 1));
    }
  }

  console.error('[openai] explain failed', lastError);
  return { ok: false, explanation: null, errorCode: 'upstream_error' };
}
