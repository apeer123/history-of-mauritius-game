import psycopg2

try:
    # Connect to Render database using env credentials
    conn = psycopg2.connect(
        host="dpg-d63imsvpm1nc73bmh530-a.singapore-postgres.render.com",
        database="mauriitus_game",
        user="mauriitus_game_user",
        password="7mNtoGVnBZiQqiNdxc990ZWsY0Dbw1xt",
        port=5432,
        sslmode="require"
    )
    cursor = conn.cursor()
    
    # Find Denis de Nyon question
    print("🔍 LOOKING FOR DENIS DE NYON QUESTION...")
    cursor.execute("""
        SELECT q.id, q.question_text, q.question_type_id, qt.name
        FROM questions q
        JOIN question_types qt ON q.question_type_id = qt.id
        WHERE q.question_text ILIKE '%Denis de Nyon%'
    """)
    
    result = cursor.fetchone()
    if result:
        q_id, q_text, q_type, q_type_name = result
        print(f"\n✅ FOUND!")
        print(f"ID: {q_id}")
        print(f"Type: {q_type_name} (ID: {q_type})")
        print(f"Text: {q_text}")
        
        # Check what tables exist for answers
        print("\n📋 CHECKING AVAILABLE ANSWER TABLES...")
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        
        tables = [row[0] for row in cursor.fetchall()]
        fill_related = [t for t in tables if 'fill' in t.lower() or 'answer' in t.lower()]
        print(f"Fill/Answer related tables: {fill_related}")
        
        # Try to find answers in fill_answers table
        print(f"\n🔍 SEARCHING FOR ANSWER IN FILL_ANSWERS TABLE...")
        cursor.execute("""
            SELECT * FROM fill_answers WHERE question_id = %s
        """, (q_id,))
        
        fill_answers = cursor.fetchall()
        if fill_answers:
            cursor.execute("SELECT * FROM fill_answers LIMIT 0")
            cols = [desc[0] for desc in cursor.description]
            print(f"Columns: {cols}")
            for row in fill_answers:
                print(f"Row: {dict(zip(cols, row))}")
        else:
            print("❌ No answers found in fill_answers table")
        
        # Check all answer-related tables for this question
        print(f"\n🔍 SEARCHING OTHER ANSWER TABLES FOR QUESTION ID {q_id}...")
        for table_name in fill_related:
            if table_name == 'fill_answers':
                continue
            try:
                cursor.execute(f"""
                    SELECT * FROM {table_name} 
                    WHERE question_id = %s LIMIT 5
                """, (q_id,))
                
                rows = cursor.fetchall()
                if rows:
                    cursor.execute(f"SELECT * FROM {table_name} LIMIT 0")
                    cols = [desc[0] for desc in cursor.description]
                    print(f"\n📍 Found in {table_name}:")
                    print(f"Columns: {cols}")
                    for row in rows:
                        print(f"  {dict(zip(cols, row))}")
            except Exception as e:
                print(f"  Error checking {table_name}: {e}")
    else:
        print("❌ Question not found!")
        print("\nSearching for any fill-type questions...")
        cursor.execute("""
            SELECT q.id, q.question_text, qt.name
            FROM questions q
            JOIN question_types qt ON q.question_type_id = qt.id
            WHERE qt.name = 'fill'
            LIMIT 5
        """)
        
        for row in cursor.fetchall():
            print(f"  ID {row[0]}: {row[2]} - {row[1][:60]}")
    
    cursor.close()
    conn.close()

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
