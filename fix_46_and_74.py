#!/usr/bin/env python3
"""
Fix ID 46 and ID 74 by marking correct options in database
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

try:
    conn = psycopg2.connect(**conn_params)
    cursor = conn.cursor()
except Exception as e:
    print(f"❌ Connection failed: {e}")
    exit(1)

print("🔧 FIXING QUESTIONS WITH NO CORRECT ANSWER\n")

# Fix ID 74 - Temperature question
print("="*70)
print("FIXING ID 74: Temperature Question")
print("="*70)

cursor.execute("""
    SELECT id, option_order, option_text, is_correct FROM mcq_options 
    WHERE question_id = 74 ORDER BY option_order
""")

id74_options = cursor.fetchall()
print(f"\nBefore fix:")
for opt_id, order, text, is_correct in id74_options:
    label = chr(65 + order)
    mark = "✓" if is_correct else " "
    print(f"  [{mark}] {label}: {text}")

# Option B (order=1) is "Higher altitude causes lower temperatures" - this is the correct one
# Even though Excel says "temperature" (singular), the stored option has "temperatures" (plural)
# But this matches the question intent, so mark option B as correct

cursor.execute("""
    UPDATE mcq_options SET is_correct = true 
    WHERE question_id = 74 AND option_order = 1
""")

cursor.execute("""
    UPDATE mcq_options SET is_correct = false 
    WHERE question_id = 74 AND option_order != 1
""")

conn.commit()

cursor.execute("""
    SELECT id, option_order, option_text, is_correct FROM mcq_options 
    WHERE question_id = 74 ORDER BY option_order
""")

print(f"\n✅ After fix:")
for opt_id, order, text, is_correct in cursor.fetchall():
    label = chr(65 + order)
    mark = "✓" if is_correct else " "
    print(f"  [{mark}] {label}: {text}")

# Fix ID 46 - Mountain question
print(f"\n" + "="*70)
print("FIXING ID 46: Mountain Question")
print("="*70)

cursor.execute("""
    SELECT id, option_order, option_text, is_correct FROM mcq_options 
    WHERE question_id = 46 ORDER BY option_order
""")

id46_options = cursor.fetchall()
print(f"\nBefore fix:")
for opt_id, order, text, is_correct in id46_options:
    label = chr(65 + order)
    mark = "✓" if is_correct else " "
    print(f"  [{mark}] {label}: {text}")

# Look for "Piton de la Petite Rivière Noire" which should be the correct answer
# Let me check which option has it
correct_found = False
for opt_id, order, text, is_correct in id46_options:
    if "piton" in text.lower():
        print(f"\n✓ Found likely correct option at order {order}: {text}")
        # Mark this as correct
        cursor.execute("""
            UPDATE mcq_options SET is_correct = true 
            WHERE id = %s
        """, (opt_id,))
        correct_found = True
    else:
        # Mark others as false
        cursor.execute("""
            UPDATE mcq_options SET is_correct = false 
            WHERE id = %s
        """, (opt_id,))

if correct_found:
    conn.commit()
    cursor.execute("""
        SELECT id, option_order, option_text, is_correct FROM mcq_options 
        WHERE question_id = 46 ORDER BY option_order
    """)
    
    print(f"\n✅ After fix:")
    for opt_id, order, text, is_correct in cursor.fetchall():
        label = chr(65 + order)
        mark = "✓" if is_correct else " "
        print(f"  [{mark}] {label}: {text}")
else:
    print("\n⚠️  Could not identify correct option for ID 46 from available options")

cursor.close()
conn.close()

print("\n" + "="*70)
print("✅ Database fixes complete!")
print("="*70)
