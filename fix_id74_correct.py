#!/usr/bin/env python3
"""
CORRECTED: Fix ID 74 - Mark the RIGHT option as correct
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

result = urlparse(DATABASE_URL)
conn_params = {
    'host': result.hostname,
    'port': result.port or 5432,
    'database': result.path.lstrip('/').split('?')[0],
    'user': result.username,
    'password': result.password,
    'sslmode': 'require'
}

conn = psycopg2.connect(**conn_params)
cursor = conn.cursor()

print("🔧 CORRECTING ID 74 FIX\n")

# Show current state
print("Current ID 74 options:")
cursor.execute("SELECT option_order, option_text, is_correct FROM mcq_options WHERE question_id=74 ORDER BY option_order")
for order, text, is_correct in cursor.fetchall():
    label = chr(65 + order)
    mark = "✓" if is_correct else " "
    print(f"  [{mark}] {label} (order={order}): {text}")

print("\nProblem: Option B is marked correct, but it's the wrong answer!")
print("Solution: Mark option C as correct instead\n")

# FIX: Clear all, then mark option C (order=2) as correct
cursor.execute("UPDATE mcq_options SET is_correct=false WHERE question_id=74")  
cursor.execute("UPDATE mcq_options SET is_correct=true WHERE question_id=74 AND option_order=2")
conn.commit()

print("✅ Corrected! Now option C is marked as correct\n")

# Verify
print("Verification - ID 74 after correction:")
cursor.execute("SELECT option_order, option_text, is_correct FROM mcq_options WHERE question_id=74 ORDER BY option_order")
for order, text, is_correct in cursor.fetchall():
    label = chr(65 + order)
    mark = "✓" if is_correct else " "
    print(f"  [{mark}] {label} (order={order}): {text}")

cursor.close()
conn.close()

print("\n✅ ID 74 is now correctly fixed!")
