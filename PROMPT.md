# prompt.md

> A reusable prompt template. Copy everything below the line, fill in the
> placeholders, and paste it into any AI assistant to generate a fresh
> `todo.json` for a new assignment.

---

## 1. Paste the assignment document here

```
<<< PASTE THE FULL ASSIGNMENT DOCUMENT / BRIEF HERE >>>
```

## 2. Answer these questions

**Total time available (number of days):**
```
<<< e.g. 7 — you may choose MORE than 7 days >>>
```

**Priority:**
```
<<< Choose ONE:
  A) Only do the assignment       (fastest path, minimum viable work)
  B) Learning first, then the assignment   (understand deeply, then build) >>>
```

**Task name:**
```
<<< e.g. Quiz Battle — Gamified Learning App >>>
```

---

## 3. What I want you to produce

Based on the assignment above, my available time, and my priority, build a
**manageable {number of days}-day plan** for **{task name}** and return it as a
`todo.json` file.

### Rules for the plan

1. **Never overwhelm.** Each day should have a realistic number of tasks
   (roughly **4–8 tasks per day**). If a day would need more, split it across
   two days.
2. **Respect my priority.**
   - *Only do the assignment* → straight to the work. Skip theory, skip
     optional research, skip nice-to-haves.
   - *Learning and then doing the assignment* → give each new concept its own
     learning task **before** the task that applies it. Add a short
     "understand" step before every "build" step.
3. **If my time is too short for the work**, say so. Then propose a
   **suggested minimum time** as an optional alternative, and explain in one
   line what would be cut.
4. **Every day must end with something testable** — a runnable feature, a
   commit, a written note, or a review step.
5. **Keep the last day for submission only.** Verification, documentation,
   video, and final submission. No new building on the final day.

### Output format — strict `todo.json` schema

```json
{
  "project": {
    "title": "<short project title>",
    "subtitle": "<task name>",
    "storageKey": "<unique.key.v1>"
  },
  "days": [
    {
      "id": "d1",
      "day": 1,
      "title": "<day title>",
      "open": true,
      "tasks": [
        { "id": "d1-01", "label": "<task description>" }
      ]
    }
  ]
}
```

### Hard requirements

- `days` must be a non-empty array.
- Every **day** has a unique `id` (string), a `day` (number), a `title`
  (string), an `open` (boolean), and a non-empty `tasks` array.
- Every **task** has a unique `id` (string, unique across the *entire file*)
  and a non-empty `label` (string).
- Only `open: true` for **Day 1** — all other days start collapsed.
- Return **only the JSON**. No explanation, no markdown fence, no comments.

---

## 4. Example request (filled in)

> **Assignment:** Quiz Battle — Gamified Learning App (7-day brief pasted above)
> **Time available:** 10 days
> **Priority:** Learning first, then the assignment
> **Task name:** Quiz Battle — Gamified Learning App
>
> Build a manageable 10-day plan for this task and return it as `todo.json`.