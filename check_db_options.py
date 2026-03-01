#!/usr/bin/env python3
import psycopg2
from urllib.parse import urlparse
import os

DATABASE_URL = os.getenv('DATABASE_URL', '')
if not DATABASE_URL:
    with open('.env.local', 'r') as f:
        for line in f:
            if 'DATABASE_URL=' in line:
                DATABASE_URL = line.split('=', 1)[1].strip().strip('"')
                break

result = urlparse(DATABASE_URL)
conn = psycopg2.connect(
    host=result.hostname, 
    port=result.port or 5432, 
    database=result.path.lstrip('/').split('?')[0], 
    user=result.username, 
    password=result.password, 
    sslmode='require'
)
cursor = conn.cursor()

print('ID 46 - Database Options:')
cursor.execute('SELECT option_order, option_text FROM mcq_options WHERE question_id = 46 ORDER BY option_order')
for order, text in cursor.fetchall():
    label = chr(65 + order)
    print(f'  {label}: {text}')

print('\nID 74 - Database Options:')
cursor.execute('SELECT option_order, option_text FROM mcq_options WHERE question_id = 74 ORDER BY option_order')
for order, text in cursor.fetchall():
    label = chr(65 + order)
    print(f'  {label}: {text}')

cursor.close()
conn.close()
