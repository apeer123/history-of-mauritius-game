import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

try:
    # Connect to database
    conn = psycopg2.connect(
        host=os.getenv('POSTGRES_HOST'),
        database=os.getenv('POSTGRES_DB'),
        user=os.getenv('POSTGRES_USER'),
        password=os.getenv('POSTGRES_PASSWORD'),
        port=os.getenv('POSTGRES_PORT', 5432)
    )
    cursor = conn.cursor()
    
    # Check fill-in-blanks question structure
    cursor.execute("""
        SELECT q.id, q.question_text, q.question_type_id
        FROM questions q
        WHERE q.question_type_id = 2
        LIMIT 3
    """)
    
    print("🔍 FILL-IN-BLANKS QUESTION STRUCTURE:")
    for row in cursor.fetchall():
        print(f"Question ID: {row[0]}, Type: {row[2]}, Text: {row[1][:50]}...")
    
    # Check if fill_blanks_answers table exists
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%fill%'
    """)
    
    print("\n📋 TABLES RELATED TO FILL-IN-BLANKS:")
    tables = cursor.fetchall()
    for table in tables:
        print(f"- {table[0]}")
    
    # Get the specific question about Denis de Nyon
    cursor.execute("""
        SELECT q.id, q.question_text, q.question_type_id
        FROM questions q
        WHERE q.question_text LIKE '%Denis de Nyon%'
    """)
    
    result = cursor.fetchone()
    if result:
        print(f"\n🎯 FOUND QUESTION:")
        print(f"ID: {result[0]}")
        print(f"Text: {result[1]}")
        print(f"Type ID: {result[2]}")
        
        # Check for answers in fill_blanks_answers table
        cursor.execute("""
            SELECT * FROM fill_blanks_answers 
            WHERE question_id = %s
        """, (result[0],))
        
        print(f"\n📝 STORED ANSWERS FOR THIS QUESTION:")
        answer_cols = [desc[0] for desc in cursor.description]
        print(f"Columns: {answer_cols}")
        
        for row in cursor.fetchall():
            print(f"Answer: {dict(zip(answer_cols, row))}")
    else:
        print("❌ Question not found")
    
    cursor.close()
    conn.close()

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
