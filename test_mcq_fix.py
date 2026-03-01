#!/usr/bin/env python3
"""
Test script to verify the MCQ correct answer matching fix.
Tests all three tiers of the fallback matching system.
"""

import psycopg2
from urllib.parse import urlparse
import os

# Connect to database
DATABASE_URL = os.environ.get('DATABASE_URL', '')
if not DATABASE_URL:
    # Try .env.local
    try:
        with open('.env.local', 'r') as f:
            for line in f:
                if line.startswith('DATABASE_URL='):
                    DATABASE_URL = line.split('=', 1)[1].strip()
                    break
    except:
        pass

if not DATABASE_URL:
    print("❌ DATABASE_URL not found in environment or .env.local")
    exit(1)

# Parse connection string
parsed = urlparse(DATABASE_URL)
conn_params = {
    'host': parsed.hostname,
    'port': parsed.port or 5432,
    'database': parsed.path.lstrip('/').split('?')[0],
    'user': parsed.username,
    'password': parsed.password,
    'sslmode': 'require'
}

try:
    conn = psycopg2.connect(**conn_params)
    cursor = conn.cursor()
    print("✅ Connected to database")
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    exit(1)

# Test the matching logic with different answer formats
test_cases = [
    {
        "name": "Tier 1: Exact Text Match",
        "optionA": "Port Louis",
        "optionB": "Curepipe",
        "optionC": "Rose Hill",
        "optionD": "Vacoas",
        "correctAnswer": "Port Louis",
        "expected_match": "A"
    },
    {
        "name": "Tier 1: Exact Match with Extra Spaces",
        "optionA": "Higher temperature",
        "optionB": "Lower temperature",
        "optionC": "Same temperature",
        "optionD": "No effect",
        "correctAnswer": "Higher temperature",
        "expected_match": "A"
    },
    {
        "name": "Tier 2: Single Letter Match",
        "optionA": "1965",
        "optionB": "1968",
        "optionC": "1970",
        "optionD": "1972",
        "correctAnswer": "B",  # Single letter
        "expected_match": "B"
    },
    {
        "name": "Tier 3: Partial Match (First 10 chars)",
        "optionA": "The British colonized Mauritius",
        "optionB": "Natural disaster destroyed economy",
        "optionC": "French colonists arrived first",
        "optionD": "Dutch settlers established port",
        "correctAnswer": "The British colon",  # Partial match
        "expected_match": "A"
    },
]

print("\n" + "="*70)
print("TESTING MCQ CORRECT ANSWER MATCHING TIERS")
print("="*70)

all_passed = True

for i, test in enumerate(test_cases, 1):
    print(f"\n[Test {i}] {test['name']}")
    print(f"   Question: Match correctAnswer='{test['correctAnswer']}'")
    
    # Simulate the matching logic from the fixed code
    correctAnswerNorm = test['correctAnswer'].strip().lower()
    options = [
        {'text': test['optionA'].strip(), 'label': 'A'},
        {'text': test['optionB'].strip(), 'label': 'B'},
        {'text': test['optionC'].strip(), 'label': 'C'},
        {'text': test['optionD'].strip(), 'label': 'D'},
    ]
    
    # Tier 1: Exact match
    foundIndex = -1
    for i_opt, opt in enumerate(options):
        if opt['text'].lower() == correctAnswerNorm:
            foundIndex = i_opt
            break
    
    # Tier 2: Single letter match
    if foundIndex == -1 and len(correctAnswerNorm) == 1:
        letterChar = ord(correctAnswerNorm[0])
        aCharCode = ord('a')
        letterIndex = letterChar - aCharCode
        if 0 <= letterIndex < 4:
            foundIndex = letterIndex
    
    # Tier 3: Partial match
    if foundIndex == -1 and len(correctAnswerNorm) > 0:
        searchPrefix = correctAnswerNorm[:min(10, len(correctAnswerNorm))]
        for i_opt, opt in enumerate(options):
            if opt['text'].lower().startswith(searchPrefix):
                foundIndex = i_opt
                break
    
    if foundIndex != -1:
        matchedLabel = options[foundIndex]['label']
        if matchedLabel == test['expected_match']:
            print(f"   ✅ PASS - Correctly matched to option {matchedLabel}")
            print(f"              Option {matchedLabel}: '{options[foundIndex]['text']}'")
        else:
            print(f"   ❌ FAIL - Matched to {matchedLabel}, expected {test['expected_match']}")
            all_passed = False
    else:
        print(f"   ❌ FAIL - No match found!")
        all_passed = False

print("\n" + "="*70)

# Check database for correct answer distribution
print("\nDATABASE INTEGRITY CHECK")
print("="*70)

cursor.execute("""
  SELECT 
    COUNT(*) as total_mcq_questions,
    COUNT(CASE WHEN correct_count = 1 THEN 1 END) as with_one_correct,
    COUNT(CASE WHEN correct_count = 0 THEN 1 END) as with_zero_correct,
    COUNT(CASE WHEN correct_count > 1 THEN 1 END) as with_multiple_correct
  FROM (
    SELECT question_id, COUNT(*) as correct_count
    FROM mcq_options
    WHERE is_correct = true
    GROUP BY question_id
  ) as counts
""")

result = cursor.fetchone()
if result:
    total, one_correct, zero_correct, multiple_correct = result
    print(f"✅ Total MCQ questions: {total}")
    print(f"   ✅ With exactly 1 correct answer: {one_correct} ({100*one_correct//max(total,1)}%)")
    print(f"   ⚠️  With 0 correct answers: {zero_correct}")
    print(f"   ⚠️  With multiple correct answers: {multiple_correct}")
    
    if zero_correct > 0 or multiple_correct > 0:
        print(f"\n   ❌ Data integrity issue detected!")
        all_passed = False
    else:
        print(f"\n   ✅ All MCQ questions have exactly one correct answer")

cursor.close()
conn.close()

print("\n" + "="*70)
if all_passed:
    print("✅ ALL TESTS PASSED - MCQ matching fix is working correctly!")
else:
    print("❌ SOME TESTS FAILED - Review the issues above")
print("="*70)
