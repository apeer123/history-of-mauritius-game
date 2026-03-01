#!/usr/bin/env python3
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
    database=result.path.lstrip('/')
)
cursor = conn.cursor()

# Get mcq_options table
print("MCQ_OPTIONS table structure:")
print("="*80)
cursor.execute("""
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'mcq_options'
    ORDER BY ordinal_position
""")
for col, dtype in cursor.fetchall():
    print(f"  {col}: {dtype}")

print("\nMCQ_OPTIONS sample data (first 3):")
cursor.execute("SELECT * FROM mcq_options LIMIT 3")
for row in cursor.fetchall():
    print(f"  {row}")

cursor.close()
conn.close()


