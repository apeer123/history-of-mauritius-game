#!/usr/bin/env python3
"""
Fix ID 74: Correct the text variation from "temperatures" to "temperature"
"""

import psycopg2
from urllib.parse import urlparse
import os

# Get database URL
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

# Parse connection string
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
    print("✅ Connected to database")
except Exception as e:
    print(f"❌ Connection failed: {e}")
    exit(1)

# Find question ID 74
cursor.execute("""
    SELECT id, question_text FROM questions WHERE id = 74
""")
question = cursor.fetchone()

if not question:
    print("❌ Question ID 74 not found")
    cursor.close()
    conn.close()
    exit(1)

print(f"\n📋 Question ID 74:")
print(f"   Text: {question[1]}")

# Find all options for this question
cursor.execute("""
    SELECT id, option_order, option_text, is_correct 
    FROM mcq_options 
    WHERE question_id = 74
    ORDER BY option_order
""")

options = cursor.fetchall()
print(f"\n📋 Options for ID 74:")
for opt_id, order, text, is_correct in options:
    label = chr(65 + order)  # A, B, C, D
    correct_mark = "✓" if is_correct else " "
    print(f"   [{correct_mark}] {label}: {text}")

# Find which option has "temperatures" (plural)
cursor.execute("""
    SELECT id, option_text FROM mcq_options 
    WHERE question_id = 74 AND option_text LIKE '%temperatures%'
""")

result = cursor.fetchone()
if result:
    opt_id, old_text = result
    new_text = old_text.replace('temperatures', 'temperature')
    
    print(f"\n🔧 Found variation to fix:")
    print(f"   Old: {old_text}")
    print(f"   New: {new_text}")
    
    # Update
    cursor.execute("""
        UPDATE mcq_options 
        SET option_text = %s 
        WHERE id = %s
    """, (new_text, opt_id))
    
    conn.commit()
    print(f"\n✅ Fixed! Updated option text from 'temperatures' to 'temperature'")
    
    # Verify
    cursor.execute("""
        SELECT id, option_order, option_text, is_correct 
        FROM mcq_options 
        WHERE question_id = 74
        ORDER BY option_order
    """)
    
    print(f"\n✅ Verified - Updated options for ID 74:")
    for opt_id, order, text, is_correct in cursor.fetchall():
        label = chr(65 + order)
        correct_mark = "✓" if is_correct else " "
        print(f"   [{correct_mark}] {label}: {text}")
else:
    print(f"\n⚠️  No option with 'temperatures' found in ID 74")

cursor.close()
conn.close()
print("\n✅ Database fix complete!")
