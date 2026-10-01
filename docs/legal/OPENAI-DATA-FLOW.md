# OpenAI data flow (internal — private beta)

## Integration points (verified in repo)

| Location | API | Auth |
|----------|-----|------|
| `server/src/openaiClient.ts` | `POST https://api.openai.com/v1/chat/completions` | Server `OPENAI_API_KEY` |
| `server/src/index.ts` | `POST /v1/starpath/explain` | **Bearer session required** (beta tightening) |
| `src/backend/starpathBackendClient.ts` | Client calls explain with authenticated fetch | User JWT |

## What is sent

- **Starpath explain:** JSON payload `VerifiedFactsPayload` — `kind`, `facts` (structured object), `reasonCodes`, optional `focusSnippet`. System prompt restricts model to those facts only.
- **Not stored** in Reelyou DB after the call in current code (response returned to client; no explain audit table).

## What is not sent via OpenAI in current server code

- Full Skywrite bodies, contact lists, passwords, or profile rows (unless indirectly included in a client-constructed `focusSnippet` or `facts` — client responsibility to minimize PII).

## Configuration (env)

- `OPENAI_API_KEY`, `OPENAI_MODEL` (default `gpt-4o-mini`), token/budget limits in `server/src/config.ts`.
- **UNVERIFIED:** OpenAI organization/project-level data retention and training opt-out — must be confirmed in OpenAI dashboard for the production key.

## COUNSEL / BUSINESS SETUP LATER

Confirm OpenAI DPA, account-level data controls, and production contractual settings before public launch.
