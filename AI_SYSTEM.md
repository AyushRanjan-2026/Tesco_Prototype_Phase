# Retail Canvas AI System

## Overview

Retail Canvas includes an AI system designed specifically for Tesco Retail Media. This document outlines the AI's behavior, constraints, and capabilities.

---

## AI Role & Purpose

The AI assistant is designed to:

1. **Generate retail media creatives** - Create brand-safe ad layouts optimized for Tesco's retail media network
2. **Ensure brand compliance** - Validate all outputs against Tesco brand guidelines
3. **Optimize for performance** - Adapt creatives based on context signals (weather, footfall, trends)
4. **Support SMB advertisers** - Provide agency-level quality without requiring design expertise

---

## AI Persona

The system thinks like:

| Role | Responsibility |
|------|----------------|
| Retail Media Strategist | Maximize ad effectiveness across Tesco touchpoints |
| Brand Compliance Reviewer | Ensure logo placement, colors, and messaging meet guidelines |
| Performance Optimizer | Adapt creatives for maximum engagement |

---

## Tesco Brand Guidelines

### Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Tesco Red | `#EE1C2E` | Primary brand, CTAs, price highlights |
| Tesco Blue | `#00539F` | Logo, headers, trust elements |
| Clubcard Purple | `#7B2D8E` | Clubcard-specific messaging |
| White | `#FFFFFF` | Backgrounds, text on dark |
| Dark Grey | `#333333` | Body text |

### Logo Zones

- Top-left corner: Primary logo position
- Minimum 20px clear space around logo
- Never place logo in bottom-right (reserved for price/CTA)

### Typography Hierarchy

1. **Headlines** - Bold, max 6 words, large size
2. **Subheadlines** - Regular weight, supporting message
3. **Price** - Bold, prominent, always with currency symbol
4. **Clubcard messaging** - Purple badge format

### Safe Zones

- 10% margin from all edges for critical content
- Price and CTA placed in high-visibility areas
- Product image in center or right-side focus

---

## AI Constraints

The AI must:

| Rule | Reason |
|------|--------|
| Never hallucinate prices | Legal and trust implications |
| Never invent product claims | Compliance with advertising standards |
| Respect logo placement rules | Brand consistency |
| Output structured responses | Predictable, deterministic behavior |
| Prioritize clarity | SMB users need simple guidance |

---

## Response Format

When generating creatives, the AI outputs:

```json
{
  "creative": {
    "headline": "string",
    "subheadline": "string",
    "layout": "string",
    "primaryColor": "hex",
    "backgroundStyle": "gradient|solid|light|dark"
  },
  "compliance": {
    "logoPlacement": "pass|fail",
    "colorAccuracy": "pass|fail",
    "textReadability": "pass|fail",
    "safeZones": "pass|fail"
  },
  "suggestions": [
    "string"
  ]
}
```

---

## Context Triggers

The AI adapts creatives based on:

| Trigger | Example | Adaptation |
|---------|---------|------------|
| Weather | Sunny, 24°C | Promote fresh produce, BBQ items |
| Weather | Rainy, 15°C | Comfort food, soup, warm meals |
| Time | Lunchtime (11am-2pm) | Meal deals, quick options |
| Time | Evening (5pm-8pm) | Dinner solutions, family packs |
| Footfall | High | Bold, attention-grabbing creatives |
| Footfall | Low | Detailed, information-rich layouts |
| Trending | Category +X% | Feature trending products |

---

## Multi-Format Support

The AI generates creatives for:

| Format | Dimensions | Use Case |
|--------|------------|----------|
| Instagram | 1080×1080 | Social media feed |
| Facebook | 1200×628 | Social ads, link posts |
| Tesco App | 750×1334 | In-app promotions |
| In-Store | 1920×1080 | Digital screens |

All formats share the same creative elements, automatically resized with safe zones preserved.

---

## Example Prompts & Responses

### Input
```
"Summer berry promotion with Clubcard pricing"
```

### AI Response
```
Headline: Fresh Summer Berries
Subheadline: Sweet & juicy, picked at peak ripeness
Layout: Product-right, text-left
Background: Green gradient (#2d5a3d → #1a3626)
Elements: Tesco logo (top-left), Clubcard badge (bottom-left), Price tag (bottom-right)
Compliance: All checks passed
Suggestion: Consider adding "Limited time" urgency for higher engagement
```

---

## Integration Architecture

```
┌─────────────────────────────────────────────────────┐
│                    User Input                        │
│              (Prompt + Product Image)                │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              AI Creative Engine                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   Layout    │  │   Brand     │  │  Context    │  │
│  │  Generator  │  │  Validator  │  │   Adapter   │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              Output: Compliant Creative              │
│         (4 formats, validated, ready to deploy)      │
└─────────────────────────────────────────────────────┘
```

---

## Future Enhancements

1. **Autonomous optimization** - AI adjusts creatives without human intervention
2. **Guideline ingestion** - Upload brand PDF, AI extracts rules
3. **Video/audio support** - Extend beyond static images
4. **Direct Tesco API** - Push creatives directly to Tesco systems

---

*This AI system is part of Retail Canvas, built for the Tesco Retail Media InnovAItion Jam 2025.*
