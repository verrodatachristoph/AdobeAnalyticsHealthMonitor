# Documentation

This directory is the source of truth for product, technical, and user-facing documentation. It powers the in-app help section, the FAQ, and any future chatbot/assistant grounded on the product.

## Structure

```
docs/
├── product/        # What the product is and who it's for
│   ├── overview.md
│   ├── personas.md
│   └── use-cases.md
├── features/       # What it does, feature by feature
│   ├── overview-view.md
│   ├── health-checks.md
│   ├── anomaly-detection.md
│   ├── incident-management.md
│   ├── client-management.md
│   ├── data-acquisition.md
│   ├── sufficiency.md
│   ├── customization.md
│   ├── settings-custom-kpis.md
│   ├── property-detail.md
│   ├── executive-summary.md
│   ├── anomalies-log.md
│   └── overview.md
├── design/         # Visual & interaction design framework
│   └── design-framework.md
├── technical/      # How it's built (for engineers + future maintainers)
│   ├── architecture.md
│   ├── data-model.md
│   ├── adobe-integration.md
│   ├── auth-and-tenancy.md
│   └── deployment.md
├── faq/            # Plain-language Q&A; chatbot-ready chunks
│   ├── for-clients.md
│   ├── for-agency.md
│   └── adobe-analytics.md
└── guides/         # Walkthroughs
    ├── client-onboarding.md
    ├── agency-admin.md
    └── responding-to-incidents.md
```

## Authoring rules

These rules exist so the same files can power both human reading and an LLM-grounded chatbot.

1. **One topic per file.** Don't mix "what it does" and "how it's built" in the same doc.
2. **Self-contained sections.** Use clear `##` headings; each section should be understandable without the rest of the doc (chatbot retrieval will pull individual chunks).
3. **Plain language for `faq/` and `guides/`.** No jargon a client wouldn't recognize. Translate Adobe-specific terms inline.
4. **Concrete language for `technical/`.** Schema, route names, function names belong here.
5. **Front-load the answer.** First sentence should answer the question; everything after is supporting detail.
6. **Update with code.** A doc that drifts from the code is worse than no doc. When changing behavior, update the relevant doc in the same PR.

## What lives where

- A client asks "what does healthy actually mean?" → `faq/for-clients.md`
- A new agency hire asks "how do I add a check?" → `guides/agency-admin.md`
- An engineer asks "how does anomaly severity get computed?" → `features/anomaly-detection.md` + `technical/architecture.md`
- A future chatbot question "is my data delayed today?" → app data, not docs (don't try to put live state in docs)

## Status

Initial scaffold — most files are stubs to be filled in as features land. The `faq/` directory is the highest-priority content area because it doubles as the chatbot foundation.
