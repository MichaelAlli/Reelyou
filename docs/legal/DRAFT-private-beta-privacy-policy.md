# DRAFT — Reelyou Private Beta Privacy Policy

**Status:** Draft for internal and counsel review only. **Not approved legal text.** Do not rely on this document for production or public launch.

**Counsel review:** Formal attorney review and final privacy policy will be completed **after** private beta product validation and before any broader public or commercial release.

**Draft date:** October 1, 2026  
**Scope:** Reelyou client applications and Reelyou API during the invited U.S. private beta (ages 18+)

**Operator:** Michael Alli, operating Reelyou (not represented as an LLC or registered company in this beta).

---

## 1. Overview

This Policy describes how Reelyou handles personal information during the private beta based on **current product behavior** in the Reelyou codebase and API.

**Contact:** reelyou.support@gmail.com for privacy questions, data requests, reporting, and account deletion.

---

## 2. Eligibility

This beta is for **invited United States residents who are at least 18 years old**. Reelyou does not collect government ID to verify age or residency in this beta.

---

## 3. Information we collect

### 3.1 Account information (server, when auth is enabled)

| Information | Purpose |
|-------------|---------|
| Full name | Identity and display |
| Email address | Sign-in; optional discoverability if you opt in |
| Password (stored hashed) | Authentication |
| Optional phone number | Profile; optional discoverability if you opt in |
| User identifier | Account and content association |
| Session token (on device) | Keeps you signed in |
| Terms and Privacy version accepted | Records which draft you agreed to at signup |

Discoverability by phone or email is **off by default** until you enable it in settings.

### 3.2 Content you create

Skywrite text and metadata, comments, media you upload when synced to the backend, follow/block relationships, and visibility choices.

### 3.3 Friend discovery (when you use it)

If you run contact matching:

1. The app reads contacts you permit on your device (contact matching is not available on web in the current app).  
2. The app sends **plain phone numbers and email addresses** from that permitted set to Reelyou’s API over HTTPS (up to 150 per request)—**not pre-hashed on the device**.  
3. The server **normalizes** each value, then compares it to **blind indexes** (one-way keyed hashes) of other users who opted into discoverability.  
4. Other users’ discoverable identifiers are stored on the server as those blind indexes; account email and phone are also stored in normalized form for account operation.  
5. Reelyou records whether you have used contact import; you can clear the import flag through the API. Reelyou does **not** keep your full contact list as a standing server-side address book based on current application logic.

Optional Google contact flows, when enabled, use Google APIs according to Google’s terms and your app configuration.

### 3.4 Information on your device

Much of the experience uses local storage on your phone or browser, including Skywrite libraries, Play Sky timing, onboarding and personalization choices, session tokens, and preferences.

**Moderation reports:** When the Reelyou backend is enabled and you are signed in, reports are sent to Reelyou’s servers for operator review. If the backend is unavailable, reports may be stored **only on your device** until a server submission succeeds.

### 3.5 Technical data

Hosting and API infrastructure may process IP addresses, request metadata, and error logs as part of operating the service.

**Analytics:** The Reelyou app codebase does **not** include a dedicated third-party analytics SDK (such as Firebase Analytics or Mixpanel) at the time of this draft.

---

## 4. How we use information

- Provide and secure accounts and sessions  
- Record Terms and Privacy acceptance at signup on the server  
- Host, display, and share content according to your settings  
- Operate social features, blocks, and contact matching as described above  
- Store moderation reports for operator review when the backend is enabled  
- Optional Starpath explanations via OpenAI when configured  
- Optional public resource discovery from third-party feeds  
- Personalize features on-device according to your settings  

**Selling data:** Reelyou does **not** sell personal information as part of the beta product.

**Reelyou model training:** Reelyou does **not** use your content to train Reelyou-owned machine learning models in the current beta implementation.

---

## 5. OpenAI processing (Starpath)

When enabled, Reelyou’s server sends a **JSON payload** to OpenAI’s **`/v1/chat/completions`** endpoint containing:

- Structured **verified facts** and **reason codes** from Starpath  
- An optional **focus snippet** (short text the client includes)  
- A fixed system instruction that limits the model to those facts  

Reelyou’s server returns the model’s short explanation to your app and **does not** store the request or response in Reelyou’s application database.

Under OpenAI’s **API** data policies (as published for business/API customers, distinct from consumer ChatGPT):

- API inputs and outputs are **not used to train OpenAI models by default** (unless the API account explicitly opts in to sharing).  
- OpenAI may retain API data for **abuse monitoring** (commonly up to **30 days** for Chat Completions unless Zero Data Retention or other account settings apply).

Reelyou has **not** verified every OpenAI organization setting for the production API key. See internal provider checklist before public launch.

---

## 6. Retention and deletion

| Topic | Beta behavior |
|-------|----------------|
| **Saved Skywrites** | Kept until you delete them or your account is purged from active systems. |
| **Play Sky** | **24-hour** visibility window on device; underlying saved Skywrite remains unless you delete it. |
| **Deleted posts (server)** | Hidden from others **immediately**; **30-day recovery** for the author via API; scheduled **purge** of post and media from active systems after recovery window. |
| **Account deletion** | **Settings → Delete account** or **reelyou.support@gmail.com**. Hidden from others **immediately**; **30-day** in-app cancellation window when backend enabled; **purge from active systems by 90 days** after request (scheduled server job). |
| **Moderation reports (server)** | Stored for operator review while the beta operates; retention policy for reports **requires counsel/ops decision**. |

**Backups and provider logs:** Reelyou uses hosting, database, and object-storage providers. **Retention in backups and provider logs has not been verified** in this draft and is **not** promised to match active-system deletion timelines.

---

## 7. How we share information

**With other users.** According to your visibility and social settings (deleted and hidden accounts or posts are not shown to others as if active).

**With service providers.** Hosting, database, object storage, OpenAI, Google (if you use contact features), and similar vendors that help run the beta under their terms.

**For legal reasons.** When required by law or to protect safety and rights—**formal procedures subject to legal review.**

We do **not** sell personal information as part of the beta product.

---

## 8. Your choices

- Discovery and My Sky privacy settings (separate from Terms acceptance)  
- Block or limit other users  
- Delete or recover Skywrites you control (server recovery when API enabled)  
- Personalization toggles in Settings  
- Request access, correction, or deletion by emailing **reelyou.support@gmail.com**  

---

## 9. Security

Reelyou uses practices appropriate for beta, including password hashing, HTTPS for production API access, and authenticated access controls for media. No method is 100% secure. Report concerns to **reelyou.support@gmail.com**.

---

## 10. Children

The beta is not for anyone under **18**. We do not knowingly collect information from minors in this program.

---

## 11. U.S. beta scope

This private beta is directed at **U.S. residents**. Data may be processed in the United States. Broader international transfer mechanisms are **not addressed** in this draft.

---

## 12. Changes

We may update this Policy during beta and will notify you of **material changes** when practicable, consistent with the Terms.

---

## 13. Contact

**Michael Alli, operating Reelyou**

**reelyou.support@gmail.com** — privacy, support, reporting, and deletion requests.
