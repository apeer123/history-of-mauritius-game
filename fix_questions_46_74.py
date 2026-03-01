#!/usr/bin/env python3
"""
Fix ID 46 and ID 74 by marking the correct options
Based on geographic/scientific knowledge:
- ID 46: "Piton de la Petite Rivière Noire" is Mauritius's highest mountain (828m)
- ID 74: "Higher altitude causes lower temperature" is the scientific answer
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

print("🔧 FIXING ID 46 AND ID 74\n")

# Fix ID 74 - Mark option B (order=1) as correct
# "Higher altitude causes lower temperatures" 
print("Fixing ID 74...")
cursor.execute("UPDATE mcq_options SET is_correct=false WHERE question_id=74")
cursor.execute("UPDATE mcq_options SET is_correct=true WHERE question_id=74 AND option_order=1")
conn.commit()
print("✅ ID 74: Marked option B (Higher altitude causes lower temperatures) as correct")

# Fix ID 46 - Mark option B (order=1) as correct
# "Piton de la Petite Rivière Noire" is Mauritius's highest mountain
print("\nFixing ID 46...")
cursor.execute("UPDATE mcq_options SET is_correct=false WHERE question_id=46")
cursor.execute("UPDATE mcq_options SET is_correct=true WHERE question_id=46 AND option_order=1")
conn.commit()
print("✅ ID 46: Marked option B (Piton de la Petite Rivière Noire) as correct")

# Verify
print("\n" + "="*50)
print("VERIFICATION")
print("="*50)

print("\nID 46 - After fix:")
cursor.execute("SELECT option_order, option_text, is_correct FROM mcq_options WHERE question_id=46 ORDER BY option_order")
for order, text, is_correct in cursor.fetchall():
    label = chr(65 + order)
    mark = "✓" if is_correct else " "
    print(f"  [{mark}] {label}: {text}")

print("\nID 74 - After fix:")
cursor.execute("SELECT option_order, option_text, is_correct FROM mcq_options WHERE question_id=74 ORDER BY option_order")
for order, text, is_correct in cursor.fetchall():
    label = chr(65 + order)
    mark = "✓" if is_correct else " "
    print(f"  [{mark}] {label}: {text}")

cursor.close()
conn.close()

print("\n✅ Fixed! Students should now be able to answer these questions correctly.")
