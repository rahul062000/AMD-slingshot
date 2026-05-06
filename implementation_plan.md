# NutriSense — Smart Food & Health App

A premium single-page web application that helps individuals make better food choices and build healthier eating habits through intelligent tracking, personalized insights, and contextual recommendations.

## Proposed Architecture

**Tech Stack**: Pure HTML + CSS + JavaScript (no frameworks) — single `index.html` with modular JS files.

**Data**: All user data persisted in `localStorage` for offline-first, privacy-focused operation. A built-in food database (~200 common foods with macros/micros) powers the search and nutrition engine.

---

## Core Features

### 1. Onboarding & Profile Setup
- Collect name, age, weight, height, activity level, dietary preferences (vegan, keto, gluten-free, etc.)
- Auto-calculate daily calorie & macro targets (TDEE formula)
- Set health goals: weight loss, muscle gain, maintenance, or custom

### 2. Smart Food Logger
- Searchable food database with autocomplete
- Quick-add recent/favorite foods
- Meal categorization (Breakfast, Lunch, Dinner, Snacks)
- Portion size selector with visual aids
- Real-time nutritional breakdown per meal and daily totals

### 3. Dashboard & Analytics
- **Today View**: Circular progress rings for calories, protein, carbs, fat
- **Weekly Trends**: Animated bar/line charts showing intake patterns
- **Nutrient Heatmap**: Visual grid showing which nutrients are consistently met/missed
- **Streak Counter**: Consecutive days of logging / meeting goals

### 4. Smart Recommendations Engine
- Context-aware meal suggestions based on:
  - Remaining daily macros/calories
  - Time of day
  - User's dietary preferences
  - Past eating patterns
- "What should I eat next?" feature with smart suggestions
- Healthier swap suggestions (e.g., "Try Greek yogurt instead of ice cream")

### 5. Meal Planner
- Drag-and-drop weekly meal planner
- Auto-generate meal plans based on calorie/macro targets
- Shopping list generator from meal plan

### 6. Insights & Habit Building
- Weekly health report card with letter grades (A-F)
- Personalized tips based on eating patterns
- Achievement badges and milestones
- Hydration tracker with reminders

### 7. Food Scanner (Manual Entry with Smart Matching)
- Type a food name → instant match with nutrition data
- Barcode-style quick entry via food ID codes

---

## Design Direction

| Aspect | Choice |
|--------|--------|
| **Theme** | Dark mode primary with glassmorphism cards |
| **Colors** | Emerald green (#10B981) + Deep teal (#0F766E) gradient accent, dark navy (#0F172A) background |
| **Typography** | Inter (headings) + DM Sans (body) from Google Fonts |
| **Animations** | Smooth page transitions, progress ring animations, micro-interactions on every click |
| **Layout** | Mobile-first responsive, bottom nav on mobile, sidebar on desktop |
| **Charts** | Custom SVG/Canvas charts (no library dependency) |

---

## Proposed File Structure

```
d:\AMD-slingshot\
├── index.html              # Main entry, all page shells
├── css/
│   ├── index.css           # Design tokens, reset, global styles
│   ├── components.css      # Reusable component styles
│   ├── dashboard.css       # Dashboard-specific styles
│   ├── logger.css          # Food logger styles
│   ├── planner.css         # Meal planner styles
│   └── animations.css      # Keyframes and transitions
├── js/
│   ├── app.js              # Router, initialization, state management
│   ├── data/
│   │   └── foods.js        # Food database (~200 items with full nutrition)
│   ├── modules/
│   │   ├── onboarding.js   # Profile setup wizard
│   │   ├── dashboard.js    # Dashboard rendering & charts
│   │   ├── logger.js       # Food search, logging, meal management
│   │   ├── planner.js      # Meal planning & auto-generation
│   │   ├── insights.js     # Analytics, recommendations, reports
│   │   ├── hydration.js    # Water tracking
│   │   └── profile.js      # Settings & profile management
│   └── utils/
│       ├── storage.js      # localStorage abstraction
│       ├── charts.js       # Custom chart rendering (SVG/Canvas)
│       ├── nutrition.js    # TDEE calculator, macro math
│       └── helpers.js      # Date utils, formatters, etc.
└── assets/
    └── icons/              # SVG icons (inline)
```

---

## Verification Plan

### Automated Tests
- Open the app in the browser and test each flow:
  1. Complete onboarding wizard
  2. Log foods for a day
  3. Check dashboard updates in real time
  4. Generate meal recommendations
  5. Create a meal plan
  6. Check weekly insights
  7. Test responsive layout at mobile/tablet/desktop widths

### Manual Verification
- Visual inspection of all animations and transitions
- Verify localStorage persistence across page reloads
- Test the food search with various queries
- Validate calorie/macro calculations against known values

---

## Open Questions

> [!IMPORTANT]
> **Scope for v1**: The plan above is comprehensive. Should I build all features for v1, or would you prefer a focused MVP with just the core features (Dashboard + Food Logger + Recommendations + Insights) and add Meal Planner + Hydration as follow-ups?

> [!NOTE]
> **Food Database**: I'll include ~200 common foods with full macro/micronutrient data. This covers most daily use cases. The search will use fuzzy matching for flexibility.
