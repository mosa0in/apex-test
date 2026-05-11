# APEX Diagnostic — AI Reference Document
> Last updated: 2026-05-11  
> Project Path: `c:\Users\MSI\Downloads\apex-diagnostic`  
> GitHub: https://github.com/mosa0in/apex-test  
> Live: https://dist-pi-sandy-98.vercel.app  
> Vercel Project: `m0sa0/dist`

---

## 1. Project Overview

APEX Diagnostic is an **Arabic-language adaptive math diagnostic tool** built for academic research.  
It collects high-fidelity interaction data from students as they answer math questions, with an integrated AI Coach system that provides scaffolded support.

**Stack**: Vite + React 19 + TypeScript + Tailwind CSS 4 + Lucide Icons  
**No backend** — static site, AI via Gemini API (optional `.env` key)  

---

## 2. Deployment

### Vercel (Primary)
```powershell
npx vercel --prod --yes     # Deploy from project root
```
- Vercel project name: `dist` (under account `m0sa0`)
- Auto-builds via `npm run build` → outputs to `dist/`
- Domain: `dist-pi-sandy-98.vercel.app`

### GitHub
```powershell
git push origin main        # Auto-updates repo
```
- Repo: `mosa0in/apex-test`
- `gh` CLI installed via winget, authenticated via device flow

### Local Dev
```powershell
npm run dev                 # http://localhost:3000
```

---

## 3. Architecture

### File Structure
```
src/
├── App.tsx                  # Main router/orchestrator (AppState FSM)
├── main.tsx                 # Entry point
├── index.css                # Full design system + all component styles
├── context/
│   └── SessionContext.tsx    # Global state (useReducer) + data pipeline
├── components/
│   ├── MainQuestion.tsx     # Question UI + confidence + STT + rephrase
│   ├── CoachPanel.tsx       # Side panel chatbot with 6 interactive strategies
│   ├── Layout.tsx           # Shell with sidebar stats
│   ├── Modals.tsx           # Hint/Break/Regen modals + SessionEndSummary
│   ├── SessionStart.tsx     # Student ID entry + start
│   ├── icons.tsx            # Re-exports from lucide-react
│   ├── Strategies.tsx       # Legacy strategies page (mostly replaced by CoachPanel)
│   ├── SolutionView.tsx     # Step-by-step solution (legacy)
│   ├── BrainstormingView.tsx# Brainstorming (legacy)
│   └── PuzzleView.tsx       # Puzzle reorder (legacy)
├── data/
│   └── questions.ts         # 10 hardcoded math questions with all metadata
├── services/
│   └── ai.ts                # Gemini API wrapper (getCoachExplanation, aiRephraseQuestion)
└── utils/
    └── exportExcel.ts       # CSV/JSON export for research data
```

### State Machine (AppState)
```
start → question ⟷ (checkpoint every 5) → summary
                 ⟷ puzzle/strategies/simpler_example/find_error/conceptual/brainstorming/solution
```

---

## 4. Key Features & Implementation Details

### 4.1 Coach Panel (CoachPanel.tsx)
- **Type**: Slide-in sidebar (left), chatbot UI
- **All interactions happen INSIDE the chat** — no external modals
- **4 main help types**: مش عارف أبدأ (start), جزئية مش فاهمها (concept), السؤال صعب (difficulty), طرق تعلم مختلفة (methods)
- **6 interactive strategies** rendered as rich React widgets inside chat bubbles:

| Strategy | Widget | Interaction |
|----------|--------|-------------|
| `brainstorming` | `BrainstormingWidget` | Visual flow with arrows between steps |
| `error` | `ErrorFindWidget` | Click steps to identify the error |
| `simpler` | `SimplerWidget` | Visual comparison + "reveal" button |
| `conceptual` | `ConceptWidget` | Info cards with concept + tip |
| `puzzle` | `PuzzleWidget` | Drag & reorder steps + check button |
| `solution` | `SolutionWidget` | Expandable timeline (click to reveal) |

- **CSS classes**: `strat-*` prefix (e.g., `strat-puzzle-piece`, `strat-error-step`)
- **AI responses**: Shown as chat bubbles with `✨ AI Response` badge
- **Props**: `isOpen, onClose, currentQuestion, onMarkCoachUsed`

### 4.2 Confidence Before Result (MainQuestion.tsx)
- **Critical research decision**: Confidence is asked BEFORE revealing correct/wrong
- **Flow**: Submit → Confidence card ("قبل ما نكشف النتيجة...") → Select 1-5 → Result revealed
- **State**: `isSubmitted` (answer locked) → `resultRevealed` (after confidence)
- **submitResponse()** is called inside `handleConfidenceSelect`, NOT in `handleSubmit`
- Answer options show correct/wrong styling only when `resultRevealed === true`

### 4.3 Rephrase Limit (3 per question)
- **Constant**: `MAX_REPHRASE_PER_QUESTION = 3` in `SessionContext.tsx`
- **State**: `state.currentRephraseCount` (resets on NEXT_QUESTION)
- **UI**: Button shows remaining count badge `3/3` → `0/3`
- **Emergency Coach**: When exhausted, coach button turns RED with pulse animation (`coach-emergency-btn`)

### 4.4 Checkpoint Dashboard (App.tsx)
- Triggers every 5 questions (`isCheckpoint` from SessionContext)
- `CheckpointDashboard` component renders:
  - Accuracy % and confidence average
  - Concept gap analysis (weak vs strong concepts)
  - Per-question mini bar chart
  - Coaching feedback as chat bubbles

### 4.5 Speech-to-Text (MainQuestion.tsx)
- **API**: Web Speech API (browser-native, no library)
- **Language**: `ar-SA` (Arabic)
- **Key**: `recognitionRef` + `baseTextRef` (saves text before recording starts)
- **Fix applied**: Rebuilt full transcript from ALL results on each event to prevent duplication
- **UI**: Mic button next to "اشرح كيف فكرت" header, red pulse when active
- **CSS classes**: `stt-mic-btn`, `stt-mic-active`, `stt-mic-ring`, `stt-status-bar`, `stt-dot`
- **Browser support**: Chrome/Edge only. Button auto-hides if unsupported.

### 4.6 Data Pipeline (SessionContext.tsx)
- **QuestionResponse** interface: sessionId, questionId, conceptId, conceptName, sectionType, questionType, selectedAnswer, selectedIndex, isCorrect, confidence, difficulty, reflection, timeSpent, usedHint, usedCoach, coachHelpType, usedRephrase, regenerationReason, restRequested, inputModality, timestamp
- **Timer**: `questionStartTimeRef` (useRef to avoid stale closures)
- **Export**: `exportExcel.ts` generates CSV + session_summary JSON
- **Session persistence**: localStorage with version check (`DATA_VERSION`)

---

## 5. CSS Architecture (index.css)

### Custom Keyframes
| Name | Purpose |
|------|---------|
| `page-enter` | Slide-up fade-in for content |
| `correct-pulse` | Green flash on correct answer |
| `shimmer` | Loading bar animation |
| `typing-dot` | Chat typing indicator |
| `glow-ring` | AI badge glow |
| `emergency-pulse` | Red glow for emergency coach button |
| `mic-ring-pulse` | Expanding ring on mic button |
| `stt-blink` | Blinking dot for recording status |
| `confetti-fall` | Confetti celebration |
| `coach-slide-in` | Panel slide from left |

### Key CSS Class Groups
- `glass-card`, `btn-primary` — Design system
- `coach-*` — Coach panel styles
- `strat-*` — Interactive strategy widgets
- `stt-*` — Speech-to-text UI
- `confidence-*` — Post-answer confidence card
- `answer-correct/wrong` — Option feedback
- `toast-*` — Notification toasts

---

## 6. Question Data Schema (questions.ts)

```typescript
interface Question {
  id: number;
  text: string;                    // Original question
  rephrasedText: string;           // Pre-written rephrase
  conceptId: string;               // e.g., 'CON_ALG_001'
  concept: string;                 // e.g., 'الجبر الأساسي'
  sectionType: 'prerequisite' | 'main';
  difficulty: number;              // 1-5
  options: { label: string; content: string }[];
  correctIndex: number;
  hint: { text, stepLabel, stepContent };
  solution: { steps: SolutionStep[], tip };
  simplerExample: { original, simpler, result, explanation };
  errorExample: { studentName, steps[], errorIndex, errorExplanation };
}
```
- **10 questions** total (mix of prerequisite + main)
- Each question has ALL strategy data pre-authored

---

## 7. AI Service (services/ai.ts)

- **Provider**: Google Gemini API (`gemini-2.0-flash`)
- **Key**: Via `.env` → `VITE_GEMINI_API_KEY`
- **Functions**:
  - `isAIAvailable()` — checks if API key exists
  - `getCoachExplanation(question, helpType)` — returns Arabic coaching text
  - `aiRephraseQuestion(question)` — returns simplified Arabic question text
- **Fallback**: If no API key, uses hardcoded `rephrasedText` and hint data

---

## 8. Git History (Chronological)

| Commit | Description |
|--------|-------------|
| `f3eb474` | Initial: Coach sidebar, confidence system, data pipeline |
| `6675515` | Moved ALL coach interactions inside chat panel (no modals) |
| `d580641` | Confidence asked BEFORE result reveal (bias elimination) |
| `22533b9` | Interactive strategy widgets (puzzle, error-find, solution timeline) |
| `ff74d75` | Speech-to-text for reflection textarea |
| `84a46ce` | Fixed STT duplicate text bug |

---

## 9. Known Issues & Future Work

- **Legacy views**: `Strategies.tsx`, `SolutionView.tsx`, `BrainstormingView.tsx`, `PuzzleView.tsx` are still in the codebase but mostly unused (replaced by CoachPanel widgets). Can be cleaned up.
- **AI Integration**: Coach currently uses static data when no API key. Full LLM integration requires Gemini key in `.env`.
- **Browser Support**: Speech-to-text only works on Chrome/Edge. Consider adding a fallback text note for Firefox/Safari users.
- **Cross-session analytics**: Currently single-session only. Future: compare across sessions.
- **Mobile**: Responsive but not fully optimized for very small screens.

---

## 10. Quick Commands

```powershell
# Dev
npm run dev

# Build
npm run build

# Deploy
git add -A; git commit -m "message"; git push origin main
npx vercel --prod --yes

# Type check
npm run lint
```
