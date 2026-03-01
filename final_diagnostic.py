#!/usr/bin/env python3
"""
Final diagnostic of MCQ correct answer status
"""
import psycopg2
from urllib.parse import urlparse
import os

database_url = os.getenv('DATABASE_URL', '')
if not database_url:
    try:
        with open('.env.local', 'r') as f:
            for line in f:
                if line.startswith('DATABASE_URL='):
                    database_url = line.split('=', 1)[1].strip().strip('"')
                    break
    except:
        pass

result = urlparse(database_url)
conn = psycopg2.connect(
    host=result.hostname,
    user=result.username,
    password=result.password,
    port=result.port or 5432,
    database=result.path.lstrip('/').split('?')[0]
)
cursor = conn.cursor()

# Count MCQ questions with properly set correct answers
cursor.execute("""
    SELECT COUNT(DISTINCT q.id) as count_with_correct
    FROM questions q
    LEFT JOIN question_types qt ON q.question_type_id = qt.id
    LEFT JOIN mcq_options mo ON q.id = mo.question_id AND mo.is_correct = TRUE
    WHERE qt.name = 'mcq' AND mo.id IS NOT NULL
""")
with_correct = cursor.fetchone()[0]

# Total MCQ questions
cursor.execute("""
    SELECT COUNT(*) FROM questions q
    LEFT JOIN question_types qt ON q.question_type_id = qt.id
    WHERE qt.name = 'mcq'
""")
total = cursor.fetchone()[0]

# Questions with multiple correct answers (data quality issue)
cursor.execute("""
    SELECT q.id, COUNT(*) as correct_count
    FROM questions q
    LEFT JOIN mcq_options mo ON q.id = mo.question_id AND mo.is_correct = TRUE
    WHERE q.id IN (
        SELECT q2.id FROM questions q2
        LEFT JOIN question_types qt ON q2.question_type_id = qt.id
        WHERE qt.name = 'mcq'
    )
    GROUP BY q.id
    HAVING COUNT(*) > 1
    ORDER BY correct_count DESC
    LIMIT 10
""")
multi_correct = cursor.fetchall()

# Questions with NO correct answers
cursor.execute("""
    SELECT q.id, q.question_text, s.name, l.level_number
    FROM questions q
    LEFT JOIN question_types qt ON q.question_type_id = qt.id
    LEFT JOIN subjects s ON q.subject_id = s.id
    LEFT JOIN levels l ON q.level_id = l.id
    WHERE qt.name = 'mcq' 
    AND q.id NOT IN (
        SELECT DISTINCT q2.id FROM questions q2
        LEFT JOIN mcq_options mo ON q2.id = mo.question_id AND mo.is_correct = TRUE
    )
    ORDER BY s.name, l.level_number
    LIMIT 10
""")
no_correct = cursor.fetchall()

print(f"MCQ Status Summary:")
print(f"  Total MCQ questions: {total}")
print(f"  With at least one correct answer: {with_correct}")
print(f"  Percentage with correct answer: {100*with_correct/total:.1f}%")
print()

if multi_correct:
    print(f"Questions with MULTIPLE correct answers (~{len(multi_correct)} found):")
    for q_id, count in multi_correct:
        print(f"  - ID {q_id}: {count} correct answers")
    print()

if no_correct:
    print(f"Questions with NO correct answer set (~{len(no_correct)} found):")
    for q_id, question, subject, level in no_correct:
        print(f"  - ID {q_id}: {subject} L{level} - {str(question)[:60]}")
else:
    print("No questions without a correct answer found!")

cursor.close()
conn.close()
