# Provider facts — UNVERIFIED (internal, not user-facing)

Do not copy these into Terms or Privacy until confirmed. Use for engineering and counsel follow-up only.

| Provider / topic | What is unverified | Where to confirm |
|------------------|-------------------|------------------|
| Render (hosting) | HTTP/access log retention, backup retention, geographic processing | Render dashboard / support |
| Postgres (if used) | Automated backup schedule and retention | Hosting provider |
| Cloudflare R2 / object storage | Versioning, lifecycle rules, cross-region copies | R2 bucket settings |
| OpenAI API account | Zero Data Retention enabled or not; org-level data sharing opt-in; exact abuse-monitoring retention for this key | OpenAI platform data controls |
| JWT sessions | Exact expiry configured in production | Server env / deploy config |
| Email (support) | No in-app transactional email provider wired for legal notices | Product decision |

**Counsel decisions still open:** limitation of liability, indemnity, arbitration, governing law, formal DPA text with vendors, entity formation.
