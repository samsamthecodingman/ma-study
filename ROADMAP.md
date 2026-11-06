# Feature wait list

Ideas for ma-study and the Study Hub. What's built so far is under Status. Everything here is an **optional add-on** that users switch on in Settings, unless it's marked **core**.

Size: **S** is about a session, **M** is a few sessions, **L** needs its own plan.

## Status

| Feature | Status |
|---|---|
| **Tabbed Settings** | Done (1.5.0): Study, Dates, Appearance and Features tabs. |
| **Progress breakdowns** | Partly done: the content checklist per unit, video time left at your watch speed, Catch up vs Whole sem, and due dates from the teaching weeks in the notes. Still to do: assignments, quizzes and classes. |
| **Mistake log** | In progress. |

## Progress and planning

| Feature | What it does | Size | Notes |
|---|---|---|---|
| **Progress breakdowns** | A tick list of progress bars and breakdowns: content to learn, assignments, quizzes, classes. Filter by this week, since the mid-sem break, or all semester. | M | Needs a content checklist per unit (lectures, studios, readings) built from the notes. Lecture-video time left could come from Moodle durations. Keep it calm: no streaks and no "you're behind" language. |
| **Study planner** *(added)* | Turns exam dates, your free time and your weak spots into a day-by-day plan, and optionally adds it to Google Calendar. | M | Re-plans when you miss a day. Ties into the progress breakdowns. |
| **Unit overview generation** | One page per unit: assessments and weights, key dates, exam format, permitted materials, and what's examinable. | S | Most of this already comes out of `ma-study-notes` (the `00-unit-and-exam` notes). Mostly a view. |

## Content generation

| Feature | What it does | Size | Notes |
|---|---|---|---|
| **Formula sheet / notes pack** | Builds a formula sheet per unit, and for open-book or unlimited-notes exams a printable notes pack indexed by topic, with worked examples. | M | Export to PDF. Every formula links back to its slide. |
| **Flash cards** | Generates term → definition and formula → meaning cards from the notes, scheduled on the same spaced-repetition boxes as quizzes. | S–M | Reuses the existing review scheduling and concept tags. |
| **Staged question difficulty** | Questions change as a concept matures. Freshly learnt material gets plain-language questions on the idea itself; late-stage review uses exam wording, structure and marks. | M | The stage comes from mastery and review box per concept. The quiz generator prompt needs a "stage" input. |
| **Hand-calculation questions** *(added)* | Multi-part numeric questions (shapes, parameter counts, a backprop step) that check each step, not just the final answer. | M | Partial credit per step, with feedback that points to the step that went wrong. |
| **Practice-material import** *(added)* | Pulls staff practice questions and past papers (Ed, Moodle, Drive) into the hub as tagged questions or exams. | M | Respect copyright and unit rules: keep it private to the student. |

## Explanations and tutoring

| Feature | What it does | Size | Notes |
|---|---|---|---|
| **Tutor mode** | Walks you through long-answer questions or tasks one step at a time without giving the answer. | M | Built on Ask Claude. Same rules as Sam's `/tutor` skill: smallest hint first, stop once you can do the next step. |
| **Diagrams, videos and links** | Explanation diagrams or short animations for a concept, or a search for relevant YouTube videos when the lecture video is confusing. | M–L | Start with diagrams and the YouTube search; generated video is the stretch goal. |
| **Learning profile** | The hub takes feedback on explanations (too dense, prefer examples, prefer visuals). If you opt in, it learns your style and tailors future explanations. | M | Stored in your own db, and viewable and resettable in Settings. Opt-in only. |
| **Mistake log** *(added)* | Collects every wrong or guessed answer into one page grouped by concept, with your answer next to the correct one. | S | Most of the data already exists in `attempts`. Good last-day revision. |

## Customisation and platform

| Feature | What it does | Size | Notes |
|---|---|---|---|
| **Tabbed Settings** | Splits Settings into tabs (Study, Exams, Appearance, Features) instead of one long page. | S | Suggest **core**: needed once add-ons have their own toggles. |
| **Colour palette generator** | Make or customise your own palette. Generated palettes still follow the hub's design rules (contrast, the unit hue system, light and dark), so they never look like generic AI design. | M | Reuse the preset maths in `head.html` and the design skills used to build the hub. Validate contrast before saving. |
| **Platform-agnostic** | Works for students at other universities: pluggable sources (Canvas, Blackboard, plain PDFs and slides) instead of only Moodle, Ed and Monash Drive. | L | Suggest **core**: it's an architecture change. Split `ma-study-notes` into a source-adapter layer plus a common notes format. Monash stays the default adapter. |
| **Build your own feature** | A template and guided steps so users can add their own features without being experts. Planning and building follow Sam's design philosophy (simple presentation, continuous feedback) and the hub's design system. Features plug in through a stable add-on interface, so users keep receiving main-branch updates. | L | Needs a stable add-on API first: a registry of hooks (home cards, quiz feedback, settings tab, db collections). Best after Tabbed Settings. |
| **Shared unit trees via Notion** | Share a unit's content tree (concepts, notes, question banks) with other Monash students through Notion. **MA exclusive.** | M–L | Decide what's shareable (your own notes and generated questions, not staff material). Needs an opt-in and a review step before anything is shared. |

## Suggested order

1. Tabbed Settings, since everything after it adds toggles.
2. Mistake log and flash cards: small and immediately useful for exams.
3. Staged difficulty and hand-calculation questions.
4. Tutor mode and the learning profile.
5. Progress breakdowns and the study planner.
6. Add-on API, then Build your own feature.
7. Platform-agnostic adapters.
