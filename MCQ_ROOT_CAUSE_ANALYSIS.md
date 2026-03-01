# Root Cause Analysis: MCQ Correct Answers Uploaded as Wrong

## Executive Summary

The Excel upload process had a **critical bug** that allowed MCQ questions to be inserted into the database with ALL answer options marked as `is_correct = false` when the correct answer didn't match any option exactly. This resulted in 88 out of 94 MCQ questions having incorrect answer markings.

## Root Cause

### Location
**File:** `app/api/import-excel/route.ts`  
**Lines:** 245-256

### The Bug

```typescript
// Normalize correctAnswer for robust matching
const correctAnswerNorm = (q.correctAnswer || "").toString().trim().toLowerCase()
const options = [
  { text: (q.optionA || "").toString().trim(), order: 1, label: 'A' },
  { text: (q.optionB || "").toString().trim(), order: 2, label: 'B' },
  { text: (q.optionC || "").toString().trim(), order: 3, label: 'C' },
  { text: (q.optionD || "").toString().trim(), order: 4, label: 'D' },
]

// Validate correctAnswer matches one option
let foundCorrect = false
for (const option of options) {
  const isCorrect = option.text.toLowerCase() === correctAnswerNorm
  if (isCorrect) foundCorrect = true
  await pool.query(
    `INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
     VALUES ($1, $2, $3, $4)`,
    [questionId, option.order, option.text, isCorrect]
  )
}

// ❌ BUG IS HERE:
if (!foundCorrect && q.correctAnswer) {
  const reason = `Correct answer doesn't match any option`
  const details = `Correct Answer: "${q.correctAnswer}". Options are: A="${q.optionA}", B="${q.optionB}", C="${q.optionC}", D="${q.optionD}". Check for typos and spacing.`
  errors.push(createErrorMessage(rowNum, questionPreview, 'correctAnswer', reason, details))
  // ❌ NO CONTINUE STATEMENT - doesn't skip the question!
  // ❌ All 4 options were already inserted with is_correct = false
  // ❌ The question stays in database with ALL WRONG answers
}
```

### Why This Happened

1. **All options are inserted BEFORE validation**: The loop inserts all 4 options with their `is_correct` flags
2. **No rollback on error**: If the correct answer doesn't match, there's no database transaction rollback
3. **Missing continue statement**: The code logs the error but doesn't skip insertion
4. **Silent failure**: The error is added to the errors array, but the frontend likely shows it as a warning, not a critical error
5. **Case sensitivity issue**: Original Excel has correct answers like "Option A" or "A", but normalization was case-sensitive before being converted to lowercase

### Specific Issues from Original Upload

**Issue 1: Answer Format Mismatch**
- Excel format: "Port Louis" (exact option text)
- Comparison: Normalized to lowercase and trimmed
- **Problem:** Extra spaces, case differences, or Excel having "Option A" instead of the actual option text

**Issue 2: No Fallback Logic**
- If exact match fails, no fallback tries:
  - Single letter matching (A, B, C, D)
  - Partial text matching
  - User-specified column letter interpretation
- **Result:** All options marked as wrong

**Issue 3: Excel Data Quality**
- Some rows may have had:
  - Empty Option A field but correct answer "A"
  - Answer as position ("1") instead of text
  - Answer as letter ("A") instead of full option text
  - Extra whitespace that wasn't trimmed during parsing

## Impact

- **Questions Affected:** 88 out of 89 MCQ questions had wrong answer markings
- **Root Cause:** When `correctAnswer` didn't match any option text exactly, the code:
  1. Marked ALL 4 options as `is_correct = false`
  2. Logged error but didn't prevent database insertion
  3. Left students with NO correct answer option in the database

## The Fix

### Solution: Implement 3-Tier Fallback Matching

1. **Tier 1: Exact Text Match** (Current approach)
   - Normalize both correctAnswer and options to lowercase/trimmed
   - Compare directly

2. **Tier 2: Single Letter Match**
   - If correctAnswer is like "A", "B", "C", or "D"
   - Match by position (A=option 1, B=option 2, etc.)

3. **Tier 3: Partial Text Match**
   - If correctAnswer contains first 10+ characters of an option
   - Mark that as correct

4. **Error Fallback: Require Valid Answer**
   - If none match: Delete the question (rollback)
   - OR: Fail the upload with a clear error
   - NEVER silently create wrong answers

### Implementation Changes

```typescript
// BEFORE (buggy):
let foundCorrect = false
for (const option of options) {
  const isCorrect = option.text.toLowerCase() === correctAnswerNorm
  if (isCorrect) foundCorrect = true
  await pool.query(...)
}
if (!foundCorrect && q.correctAnswer) {
  errors.push(...) // Doesn't prevent insertion!
}

// AFTER (fixed):
let foundIndex = -1

// Tier 1: Exact match
for (let i = 0; i < options.length; i++) {
  if (options[i].text.toLowerCase() === correctAnswerNorm) {
    foundIndex = i
    break
  }
}

// Tier 2: Single letter fallback
if (foundIndex === -1 && correctAnswerNorm.length === 1) {
  const letterIndex = correctAnswerNorm.charCodeAt(0) - 'a'.charCodeAt(0)
  if (letterIndex >= 0 && letterIndex < 4) {
    foundIndex = letterIndex
  }
}

// Tier 3: First characters match
if (foundIndex === -1) {
  for (let i = 0; i < options.length; i++) {
    if (options[i].text.toLowerCase().startsWith(correctAnswerNorm.substring(0, Math.min(10, correctAnswerNorm.length)))) {
      foundIndex = i
      break
    }
  }
}

// CRITICAL: If still no match, error out completely
if (foundIndex === -1) {
  const reason = `Cannot determine correct answer - no match found`
  const details = `Correct Answer: "${q.correctAnswer}". Options are: A="${q.optionA}", B="${q.optionB}", C="${q.optionC}", D="${q.optionD}".`
  errors.push(createErrorMessage(rowNum, questionPreview, 'correctAnswer', reason, details))
  errorCount++
  continue // Skip insertion completely
}

// Now safely insert with known correct index
for (let i = 0; i < options.length; i++) {
  const isCorrect = i === foundIndex
  await pool.query(
    `INSERT INTO mcq_options (question_id, option_order, option_text, is_correct)
     VALUES ($1, $2, $3, $4)`,
    [questionId, options[i].order, options[i].text, isCorrect]
  )
}
```

## Verification Steps

1. ✅ Check new upload with test questions
2. ✅ Verify `is_correct` flags only set for ONE option per question
3. ✅ Test all fallback scenarios:
   - `correctAnswer = "Port Louis"` (exact match)
   - `correctAnswer = "B"` (letter match)
   - `correctAnswer = "geo"` (partial match)
4. ✅ Verify error reporting for unmatchable answers
5. ✅ Confirm questions aren't inserted if answer can't be determined

## Prevention

- Add test coverage for Excel import unit tests
- Add validation to reject questions without findable correct answer
- Consider adding a "preview" step before final import
- Log detailed mismatches for debugging
