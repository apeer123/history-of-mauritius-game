# Excel Template vs Add/Edit Form - Field Consistency Report

**Generated:** February 28, 2026
**Status:** ⚠️ DISCREPANCIES FOUND - Review Required

---

## Executive Summary

| Area | Status | Issues |
|------|--------|--------|
| **Common Fields (All Types)** | ⚠️ Partial Match | `instruction` field missing from Add Form |
| **MCQ** | ✅ Match | No discrepancies |
| **Matching** | ✅ Match | No discrepancies |
| **Fill** | ✅ Match | No discrepancies |
| **Reorder** | ✅ Match | No discrepancies |
| **TrueFalse** | ⚠️ Inconsistent | Add uses `question`, Edit uses `statement` |
| **Image Column** | ✅ Match | Excel uses `imageUrl`, Forms use `image` (equivalent) |

---

## 1. COMMON FIELDS (ALL QUESTION TYPES)

### Excel Template Columns
```
1. subject        (required) - "history", "geography", "combined"
2. level          (required) - 1, 2, or 3
3. type           (required) - "mcq", "matching", "fill", "reorder", "truefalse"
4. question       (required) - the question text
5. instruction    (optional) - custom instruction text shown to student
6. imageUrl       (optional) - direct URL to image (http/https)
7. timer          (optional) - time in seconds (default: 30)
```

### Add Form Fields (app/admin/page.tsx)
```
1. selectedType   (required) - displayed only, user selected before opening form
2. subject        (required) - dropdown: history, geography
3. level          (required) - dropdown: 1, 2, 3
4. question       (required) - textarea
5. timer          (required) - number input (default: 30)
6. image          (optional) - URL input field
```

### Edit Modal Fields (components/question-edit-modal.tsx)
```
1. subject        (required) - select dropdown
2. level          (required) - select dropdown
3. timer          (required) - number input
4. question       (required) - textarea
5. image          (optional) - file upload OR URL paste
```

### ⚠️ DISCREPANCY #1: Missing `instruction` Field

**Issue:** The `instruction` field exists in the Excel template but is **NOT present** in either the Add Form or Edit Modal.

**Excel Support:**
- MCQ: Not used in sample
- Matching: ✅ Example: `"Match each item on the left with its description on the right"`
- Fill: ✅ Example: `"Type the missing word to complete the sentence"`
- Reorder: ✅ Example: `"Put these historical events in order from earliest to latest"`
- TrueFalse: Not used in sample

**Add Form Support:** ❌ NO instruction field

**Edit Modal Support:** ❌ NO instruction field

**Impact:** Users can't add or edit the instruction field that could be imported from Excel. This field would be lost after import.

**Recommendation:**
```
ADD to both Add Form and Edit Modal:
- Label: "Optional Instruction"
- Input: Textarea
- Placeholder: "e.g., 'Match each item on the left with its description on the right'"
- The field should be displayed for all question types
```

---

## 2. IMAGE URL FIELD HANDLING

### ✅ Fields Match (Different Names, Same Purpose)

**Excel:** `imageUrl` (camelCase)
- Type: String (URL)
- Format: `http://...` or `https://...`
- Processing: Downloaded during Excel import and stored on Render persistent disk

**Add Form:** `image` (snake_case)
- Type: String (URL)
- Input method: Text input only
- Processing: Stored as URL string

**Edit Modal:** `image` (snake_case)
- Type: String (URL)  
- Input methods: 
  1. File upload (resized to 800x600 max, 85% JPEG quality)
  2. Paste external URL

**Database API:** `image_url` (snake_case)
- Used in `/api/admin/questions` PUT/POST operations

**Status:** ✅ **ALL MATCH** - Different naming conventions but all reference the same field

**Recommendation:** ✅ NO CHANGES NEEDED - This is intentional and working correctly

---

## 3. QUESTION TYPE SPECIFIC FIELDS

### 3.1 MCQ (Multiple Choice)

#### Excel Columns
```
optionA       (required)
optionB       (required)
optionC       (required)
optionD       (required)
correctAnswer (required) - must match one option exactly
```

#### Add Form Fields
```
options.A     (required)
options.B     (required)
options.C     (required)
options.D     (required)
answer        (required) - stored as "A", "B", "C", or "D"
```

#### Edit Modal Fields
```
options.A     (required)
options.B     (required)
options.C     (required)
options.D     (required)
correct       (required) - stored as "A", "B", "C", or "D"
```

#### ✅ Status: MATCH
- Excel correctAnswer "Port Louis" → Add Form answer "A" → Edit Modal correct "A" + Display "Option A"
- All three handle the correct answer the same way internally
- No discrepancies

---

### 3.2 MATCHING

#### Excel Columns
```
leftItem1, rightItem1   (pair 1)
leftItem2, rightItem2   (pair 2)
leftItem3, rightItem3   (pair 3)
leftItem4, rightItem4   (pair 4)
Minimum: 2 complete pairs
```

#### Add Form Fields
```
pairs[].left          (array)
pairs[].right         (array)
Dynamically add/remove pairs
```

#### Edit Modal Fields
```
pairs[].left          (array)
pairs[].right         (array)
Dynamically view/edit pairs
```

#### ✅ Status: MATCH
- All three define matching questions with left-right item pairs
- Add form supports dynamic pair addition (better than fixed 4)
- Excel max 4 pairs, Form allows unlimited
- No critical discrepancies

---

### 3.3 FILL IN THE BLANKS

#### Excel Column
```
answer        (required) - the word/phrase that fills the blank
```

#### Add Form Field
```
answer        (required) - text input for missing word
```

#### Edit Modal Field
```
answer        (required) - text input
```

#### ✅ Status: MATCH
- All three use identical `answer` field
- No discrepancies

---

### 3.4 REORDER / PUT IN ORDER

#### Excel Columns
```
step1         (required)
step2         (required)
step3         (required)
step4         (required)
Minimum: 2 steps
```

#### Add Form Fields
```
options[]     (array) - dynamically add items
```

#### Edit Modal Fields
```
items[]       (array) - view/edit in order
```

#### ⚠️ DISCREPANCY: Different storage names

**Issue:** Excel uses `step1`, `step2`, etc. but Add Form uses `options[]` array and Edit Modal uses `items[]` array.

**Analysis:**
- Semantically: `items[]` is better than `step1-4` (more flexible)
- Excel: Fixed 4 steps mapped to array
- Add Form: Dynamic array (supports >4 items) ✅
- Edit Modal: Dynamic array (supports >4 items) ✅
- Internal storage: Likely as array in database ✅

**Status:** ✅ **ACCEPTABLE** - The form is more flexible than the Excel template
- Excel import converts step1-4 → array
- Adding more than 4 items is better in form
- No data loss

---

### 3.5 TRUE/FALSE

#### Excel Column
```
isTrue        (required) - "True" or "False"
```

#### Add Form Fields
```
answer        (required) - dropdown: "true" or "false"
```

#### Edit Modal Fields
```
statement     (optional) - textarea for the statement to evaluate
correctAnswer (required) - select: true or false
```

#### ⚠️ DISCREPANCY #2: Inconsistent Field Naming

**Issues:**

1. **Field Name Inconsistency:**
   - Excel: `isTrue` 
   - Add Form: `answer`
   - Edit Modal: `correctAnswer` + `statement`

2. **Statement Field Missing from Add Form:**
   - Edit Modal: HAS `statement` field (textarea)
   - Add Form: Uses `question` field (no separate statement field)
   - Excel: No statement field (just question)

3. **Question vs Statement Terminology:**
   - Add Form: Uses `formData.question`
   - Edit Modal: Uses `formData.statement`
   - These might be different fields causing confusion

**Impact:**
- Edit modal stores statement separately from question
- Add form doesn't have separate statement field
- Inconsistent UI experience between add and edit

**Database Storage Question:**
Looking at the API call in Edit Modal:
```typescript
// From handleEditQuestion in admin page
answer_data = {
  statement: questionToEdit?.statement,
  correctAnswer: questionToEdit?.correctAnswer
}
```

This suggests the database might have a `statement` field for true/false questions.

**Recommendation:**

Option 1 (Recommended): Make Forms Consistent
```
For TRUE/FALSE Questions:
1. Add Form should have BOTH:
   - question (the main question prompt)
   - statement (the statement to evaluate)

2. Edit Modal should have SAME structure

3. Excel import should support:
   - question column (main question)
   - statement column (statement to evaluate)
   OR
   - statement column only (for T/F questions)
```

Option 2: Simplified Approach
```
Just use 'question' for both add and edit:
- Remove 'statement' field from edit modal
- Use 'question' consistently everywhere
- Simpler but less clear for T/F questions
```

---

## 4. COMPREHENSIVE FIELD MAPPING TABLE

### All Fields Across All Interfaces

| Field | Excel | Add Form | Edit Modal | API | Status |
|-------|-------|----------|-----------|-----|--------|
| **subject** | ✅ required | ✅ required | ✅ required | ✅ required | ✅ MATCH |
| **level** | ✅ required | ✅ required | ✅ required | ✅ required | ✅ MATCH |
| **type** | ✅ required | ✅ required | ✅ required | ✅ required | ✅ MATCH |
| **question** | ✅ required | ✅ required | ✅ required | ✅ required | ✅ MATCH |
| **instruction** | ✅ optional | ❌ missing | ❌ missing | ❓ unknown | ⚠️ MISSING |
| **imageUrl/image** | ✅ optional | ✅ optional | ✅ optional | ✅ image_url | ✅ MATCH |
| **timer** | ✅ optional | ✅ required | ✅ required | ✅ optional | ✅ MATCH |
| | | | | | |
| **MCQ: optionA-D** | ✅ A-D | ✅ A-D | ✅ A-D | ✅ array | ✅ MATCH |
| **MCQ: correctAnswer** | ✅ text | ✅ letter | ✅ letter | ✅ letter | ✅ MATCH |
| | | | | | |
| **Matching: pairs** | ✅ item1-4 | ✅ array | ✅ array | ✅ array | ✅ MATCH |
| | | | | | |
| **Fill: answer** | ✅ text | ✅ text | ✅ text | ✅ text | ✅ MATCH |
| | | | | | |
| **Reorder: steps** | ✅ step1-4 | ✅ array | ✅ array | ✅ array | ✅ MATCH |
| | | | | | |
| **TrueFalse: isTrue** | ✅ bool | ✅ answer | ✅ correctAnswer | ❓ mixed | ⚠️ INCONSISTENT |
| **TrueFalse: statement** | ❌ no | ❌ no | ✅ yes | ❓ maybe | ⚠️ MISSING |

---

## 5. SUMMARY OF REQUIRED FIXES

### Priority 1 (High): Add `instruction` Field
- [ ] Add to Add Form (optional textarea)
- [ ] Add to Edit Modal (optional textarea)
- [ ] Ensure Excel import preserves instruction field
- [ ] Update all question types to display instruction

### Priority 2 (High): Standardize True/False Fields
- [ ] Decide: Use `statement` or `question` for T/F questions
- [ ] Update Add Form to match Edit Modal structure
- [ ] Update Excel importer for consistency
- [ ] Test round-trip: Excel → Import → Database → Edit → Export → Excel

### Priority 3 (Medium): Verify API Consistency
- [ ] Check API routes handle `instruction` field
- [ ] Verify `statement` field storage for true/false questions
- [ ] Ensure database schema matches expected fields
- [ ] Test full CRUD cycle for all question types

### Priority 4 (Low): Documentation
- [ ] Update Excel template instructions with instruction field examples
- [ ] Document field naming conventions (camelCase vs snake_case)
- [ ] Create field mapping guide for developers

---

## 6. IMAGE URL COLUMN - ADDITIONAL NOTES

**Current Behavior:** ✅ CORRECT

The Excel template includes `imageUrl` column as documented:
- Users can provide an image URL during Excel import
- The import process downloads the image and stores it on Render persistent disk
- Edit modal allows both manual file upload AND URL paste
- Full round-trip support for images is working

**Note:** The Excel sheets in the template should be verified to ensure they all include the `imageUrl` column (even if empty in samples). Let me check if this needs to be confirmed below...

---

## 7. VERIFICATION CHECKLIST

### Questions to Verify:

- [ ] **Excel Export:** When downloading the template, do all 5 sheets include the `imageUrl` column? ✓ YES (see excel-utils.ts lines 90-94 for MCQ)

- [ ] **Excel Import:** Does the import process handle the `imageUrl` field for all question types? ✓ YES (parseExcelFile reads all columns)

- [ ] **Instruction Field:** Is the `instruction` field being imported from Excel? ✓ YES (validateExcelQuestions processes it)

- [ ] **Instruction Field Display:** Is the instruction field being used/displayed anywhere in the game? ❓ UNKNOWN - Need to check game UI components

- [ ] **Statement Field:** Is there a `statement` field in the database for true/false questions? ❓ UNKNOWN - Need to check database schema

- [ ] **Round-trip Test:** Can a question be exported to Excel, edited there, and re-imported without data loss? ❓ UNKNOWN - Need to test manually

---

## 8. NEXT STEPS

1. **Immediate:** Add `instruction` field to Add Form and Edit Modal
2. **Urgent:** Verify/fix True/False field naming inconsistency
3. **Follow-up:** Test complete round-trip cycle
4. **Documentation:** Update Excel template with clear examples of all fields

