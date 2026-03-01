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
    
    # Check all fill_answers entries for question 142
    print("Checking all fill_answers entries for question 142...")
    cursor.execute("""
        SELECT id, question_id, answer_text, created_at
        FROM fill_answers
        WHERE question_id = 142
    """)
    
    results = cursor.fetchall()
    if results:
        print(f"Found {len(results)} entries:")
        for row in results:
            print(f"  ID: {row[0]}, Q: {row[1]}, Answer: '{row[2]}', Created: {row[3]}")
    else:
        print("NO ENTRIES FOUND FOR QUESTION 142!")
        print("\n*** THIS IS THE PROBLEM: The fill_answers table has no entry for question 142! ***")
        print("\nAll fill_answers data:")
        cursor.execute("SELECT id, question_id, answer_text FROM fill_answers LIMIT 20")
        for row in cursor.fetchall():
            print(f"  Q{row[1]}: {row[2]}")
    
    cursor.close()
    conn.close()

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
