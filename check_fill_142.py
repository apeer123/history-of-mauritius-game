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
    
    # Check question 142 - the Denis de Nyon fill-in-the-blank
    print("🔍 CHECKING QUESTION 142 (Denis de Nyon FILL)...")
    cursor.execute("""
        SELECT id, question_text, question_type_id
        FROM questions
        WHERE id = 142
    """)
    
    result = cursor.fetchone()
    if result:
        q_id, q_text, q_type = result
        print(f"ID: {q_id}")
        print(f"Type ID: {q_type}")
        print(f"Text: {q_text}")
        
        # Get the stored answer
        cursor.execute("""
            SELECT answer_text FROM fill_answers
            WHERE question_id = %s
        """, (q_id,))
        
        answer_result = cursor.fetchone()
        if answer_result:
            stored_answer = answer_result[0]
            print(f"\n✅ STORED ANSWER: '{stored_answer}'")
            print(f"   Answer length: {len(stored_answer)} characters")
            print(f"   Hex representation: {stored_answer.encode('utf-8').hex()}")
            
            # Check if it matches what user should enter
            print(f"\n🧪 TESTING VALIDATION:")
            test_answers = ["1722", "1722 ", " 1722", " 1722 "]
            for test_ans in test_answers:
                match = test_ans.lower().strip() == stored_answer.lower()
                status = "✅ MATCH" if match else "❌ NO MATCH"
                print(f"   '{test_ans}' -> {status}")
        else:
            print(f"\n❌ NO ANSWER STORED FOR QUESTION {q_id}!")
            print("   This is the problem - no correct answer is configured!")
    
    else:
        print("❌ Question 142 not found!")
    
    # Also check the instruction field
    print("\n\n🔍 CHECKING QUESTION DETAILS...")
    cursor.execute("""
        SELECT id, question_text, instruction, timer_seconds
        FROM questions
        WHERE id = 142
    """)
    
    result = cursor.fetchone()
    if result:
        print(f"ID: {result[0]}")
        print(f"Question: {result[1]}")
        print(f"Instruction: {result[2]}")
        print(f"Timer: {result[3]}")
    
    cursor.close()
    conn.close()

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
