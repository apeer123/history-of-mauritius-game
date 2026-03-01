#!/usr/bin/env python3
"""
Diagnostic script to check current MCQ status in database
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

# Count MCQ questions
cursor.execute("""
    SELECT COUNT(*) as count
    FROM questions q
    LEFT JOIN question_types qt ON q.question_type_id = qt.id
    WHERE qt.name = 'mcq'
""")
total_mcq = cursor.fetchone()[0]

print(f"Total MCQ questions in database: {total_mcq}")

# Check how many have correct answers set
cursor.execute("""
    SELECT COUNT(DISTINCT q.id) as count
    FROM questions q
    LEFT JOIN question_types qt ON q.question_type_id = qt.id
    LEFT JOIN mcq_options mo ON q.id = mo.question_id
    WHERE qt.name = 'mcq' AND mo.is_correct = TRUE
""")
with_correct = cursor.fetchone()[0]
print(f"Questions with is_correct = TRUE for at least one option: {with_correct}")

# Sample some questions and their options
print("\n" + "="*100)
print("Sample MCQ Questions and their is_correct flags:")
print("="*100 + "\n")

cursor.execute("""
    SELECT q.id, q.question_text, mo.option_order, mo.option_text, mo.is_correct
    FROM questions q
    LEFT JOIN question_types qt ON q.question_type_id = qt.id
    LEFT JOIN mcq_options mo ON q.id = mo.question_id
    WHERE qt.name = 'mcq'
    ORDER BY q.id, mo.option_order
    LIMIT 40
""")

current_question = None
for q_id, question, opt_order, opt_text, is_correct in cursor.fetchall():
    if current_question != q_id:
        print(f"\nQuestion ID {q_id}: {str(question)[:70] if question else 'UNKNOWN'}")
        current_question = q_id
    
    labels = ['A', 'B', 'C', 'D']
    label = labels[opt_order] if opt_order < 4 else str(opt_order)
    status = "✓" if is_correct else " "
    print(f"  [{status}] {label}: {str(opt_text)[:60] if opt_text else 'EMPTY'}")

cursor.close()  
conn.close()
