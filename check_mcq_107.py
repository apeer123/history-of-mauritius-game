import psycopg2

try:
    conn = psycopg2.connect(
        host="dpg-d63imsvpm1nc73bmh530-a.singapore-postgres.render.com",
        database="mauriitus_game",
        user="mauriitus_game_user",
        password="7mNtoGVnBZiQqiNdxc990ZWsY0Dbw1xt",
        port=5432,
        sslmode="require"
    )
    cursor = conn.cursor()
    
    # Check question 107 - the Denis de Nyon MCQ
    print("🔍 CHECKING QUESTION 107 (Denis de Nyon MCQ)...")
    cursor.execute("""
        SELECT id, question_text, question_type_id
        FROM questions
        WHERE id = 107
    """)
    
    result = cursor.fetchone()
    if result:
        print(f"ID: {result[0]}")
        print(f"Text: {result[1]}")
        print(f"Type ID: {result[2]}")
        
        # Get MCQ options
        cursor.execute("""
            SELECT option_order, option_text, is_correct
            FROM mcq_options
            WHERE question_id = 107
            ORDER BY option_order
        """)
        
        print("\n📋 MCQ OPTIONS:")
        options = cursor.fetchall()
        for opt in options:
            order, text, is_correct = opt
            status = "✓ CORRECT" if is_correct else "✗"
            print(f"  {chr(65+order)}: {text:60} {status}")
        
        # Check if there's a correct answer marked
        correct_count = sum(1 for opt in options if opt[2])
        print(f"\n⚠️ CORRECT ANSWERS MARKED: {correct_count}")
        if correct_count == 0:
            print("❌ NO CORRECT ANSWER MARKED FOR THIS MCQ!")
            print("   Students will always get this wrong!")
    
    # Now let's search for the fill-in-the-blank about Denis de Nyon
    print("\n\n🔍 SEARCHING FOR FILL-TYPE QUESTION ABOUT DENIS DE NYON...")
    cursor.execute("""
        SELECT q.id, q.question_text, q.question_type_id, qt.name
        FROM questions q
        JOIN question_types qt ON q.question_type_id = qt.id
        WHERE q.question_text ILIKE '%Denis de Nyon%' OR q.question_text ILIKE '%1722%'
        ORDER BY q.id
    """)
    
    all_matches = cursor.fetchall()
    print(f"Found {len(all_matches)} questions matching 'Denis de Nyon' or '1722':\n")
    
    for q_id, q_text, q_type_id, q_type_name in all_matches:
        print(f"ID: {q_id} | Type: {q_type_name}")
        print(f"Text: {q_text[:80]}")
        print()
    
    # Check if there's a fill-type question 
    print("\n🔍 CHECKING ALL FILL-TYPE QUESTIONS...")
    cursor.execute("""
        SELECT q.id, q.question_text
        FROM questions q
        JOIN question_types qt ON q.question_type_id = qt.id
        WHERE qt.name = 'fill'
        LIMIT 10
    """)
    
    fill_questions = cursor.fetchall()
    print(f"First 10 fill-type questions:")
    for q_id, q_text in fill_questions:
        print(f"  ID {q_id}: {q_text[:70]}")
    
    cursor.close()
    conn.close()

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
