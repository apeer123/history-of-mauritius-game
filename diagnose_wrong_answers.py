#!/usr/bin/env python3
"""
Diagnose why correct answers are being flagged as wrong
Check the database for answer marking issues
"""

import psycopg2
from urllib.parse import urlparse
import os

DATABASE_URL = os.getenv('DATABASE_URL', '')
if not DATABASE_URL:
    try:
        with open('.env.local', 'r') as f:
            for line in f:
                if line.startswith('DATABASE_URL='):
                    DATABASE_URL = line.split('=', 1)[1].strip().strip('"')
                    break
    except:
        pass

if not DATABASE_URL:
    print("❌ DATABASE_URL not found")
    exit(1)

result = urlparse(DATABASE_URL)
conn_params = {
    'host': result.hostname,
    'port': result.port or 5432,
    'database': result.path.lstrip('/').split('?')[0],
    'user': result.username,
    'password': result.password,
    'sslmode': 'require'
}

try:
    conn = psycopg2.connect(**conn_params)
    cursor = conn.cursor()
except Exception as e:
    print(f"❌ Connection failed: {e}")
    exit(1)

print("🔍 DIAGNOSING WRONG ANSWER FLAGS\n")

# Check for questions with NO correct answers marked
print("="*70)
print("1. QUESTIONS WITH NO CORRECT ANSWER MARKED")
print("="*70)

cursor.execute("""
    SELECT q.id, q.question_text, q.question_type_id, qt.name
    FROM questions q
    JOIN question_types qt ON q.question_type_id = qt.id
    WHERE NOT EXISTS (
        SELECT 1 FROM mcq_options WHERE question_id = q.id AND is_correct = true
    )
    AND qt.name = 'mcq'
    LIMIT 10
""")

mcq_no_correct = cursor.fetchall()
if mcq_no_correct:
    print(f"\n❌ Found {len(mcq_no_correct)} MCQ questions with NO correct answer marked:\n")
    for qid, qtext, type_id, qtype in mcq_no_correct:
        print(f"ID {qid}: {qtext[:60]}...")
        # Show options
        cursor.execute("""
            SELECT option_order, option_text, is_correct FROM mcq_options 
            WHERE question_id = %s ORDER BY option_order
        """, (qid,))
        for order, text, is_correct in cursor.fetchall():
            label = chr(65 + order)
            mark = "✓" if is_correct else " "
            print(f"    [{mark}] {label}: {text}")
        print()
else:
    print("\n✅ All MCQ questions have at least one correct answer marked")

# Check for questions with MULTIPLE correct answers
print("\n" + "="*70)
print("2. QUESTIONS WITH MULTIPLE CORRECT ANSWERS (AMBIGUOUS)")
print("="*70)

cursor.execute("""
    SELECT q.id, q.question_text, COUNT(*) as correct_count
    FROM questions q
    JOIN mcq_options mo ON q.id = mo.question_id
    WHERE mo.is_correct = true AND q.question_type_id = (
        SELECT id FROM question_types WHERE name = 'mcq'
    )
    GROUP BY q.id, q.question_text
    HAVING COUNT(*) > 1
    LIMIT 10
""")

mcq_multi_correct = cursor.fetchall()
if mcq_multi_correct:
    print(f"\n⚠️  Found {len(mcq_multi_correct)} MCQ questions with MULTIPLE correct answers:\n")
    for qid, qtext, count in mcq_multi_correct:
        print(f"ID {qid}: {qtext[:60]}... ({count} correct answers)")
        cursor.execute("""
            SELECT option_order, option_text, is_correct FROM mcq_options 
            WHERE question_id = %s ORDER BY option_order
        """, (qid,))
        for order, text, is_correct in cursor.fetchall():
            label = chr(65 + order)
            mark = "✓" if is_correct else " "
            print(f"    [{mark}] {label}: {text}")
        print()
else:
    print("\n✅ No MCQ questions have multiple correct answers")

# Check for Fill-in-Blank questions with issues
print("\n" + "="*70)
print("3. FILL-IN-BLANK QUESTIONS STATUS")
print("="*70)

cursor.execute("""
    SELECT q.id, q.question_text, fa.answer
    FROM questions q
    JOIN fill_answers fa ON q.id = fa.question_id
    WHERE q.question_type_id = (SELECT id FROM question_types WHERE name = 'fill')
    LIMIT 5
""")

fill_questions = cursor.fetchall()
if fill_questions:
    print(f"\n📋 Sample Fill-in-Blank questions:\n")
    for qid, qtext, answer in fill_questions:
        print(f"ID {qid}:")
        print(f"   Question: {qtext[:70]}...")
        print(f"   Answer: {answer}")
        print()
else:
    print("\n⚠️  No fill-in-blank questions found")

# Summary statistics
print("\n" + "="*70)
print("4. SUMMARY STATISTICS")
print("="*70)

cursor.execute("""
    SELECT 
        COUNT(*) as total_mcq,
        SUM(CASE WHEN correct_count = 0 THEN 1 ELSE 0 END) as zero_correct,
        SUM(CASE WHEN correct_count = 1 THEN 1 ELSE 0 END) as one_correct,
        SUM(CASE WHEN correct_count > 1 THEN 1 ELSE 0 END) as multi_correct
    FROM (
        SELECT question_id, COUNT(*) as correct_count
        FROM mcq_options
        WHERE is_correct = true
        GROUP BY question_id
    ) counts
""")

stats = cursor.fetchone()
if stats:
    total, zero, one, multi = stats
    print(f"\n📊 MCQ Question Analysis:")
    print(f"   Total MCQ questions: {total}")
    print(f"   With 0 correct answers: {zero}")
    print(f"   With 1 correct answer: {one}")
    print(f"   With 2+ correct answers: {multi}")
    
    if zero and zero > 0:
        print(f"\n   ❌ ISSUE: {zero} questions have NO correct answer - these will always be marked WRONG")
    if multi and multi > 0:
        print(f"\n   ⚠️  WARNING: {multi} questions have multiple correct answers - ambiguous for students")

cursor.close()
conn.close()

print("\n" + "="*70)
