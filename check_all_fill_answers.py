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
    
    # Find all fill-in-the-blank questions and their answers
    cursor.execute("""
        SELECT q.id, q.question_text, fa.answer_text
        FROM questions q
        LEFT JOIN fill_answers fa ON q.id = fa.question_id
        WHERE q.question_type_id = 3
        ORDER BY q.id
    """)
    
    print("ALL FILL-IN-THE-BLANK QUESTIONS AND ANSWERS:")
    print("="*70)
    
    missing_count = 0
    for row in cursor.fetchall():
        q_id, q_text, answer = row
        status = "NO ANSWER!" if answer is None else f"OK ({answer})"
        if answer is None:
            missing_count += 1
            print(f"\nID {q_id}: {status}")
            print(f"  Question: {q_text[:70]}")
        else:
            print(f"ID {q_id}: {status:20} - {q_text[:50]}")
    
    print(f"\n{'='*70}")
    print(f"SUMMARY:")
    print(f"Total fill-in-the-blank questions: {cursor.rowcount}")
    print(f"Questions WITH answers: {cursor.rowcount - missing_count}")
    print(f"Questions WITHOUT answers: {missing_count}")
    
    if missing_count > 0:
        print(f"\n*** WARNING: {missing_count} fill-in-the-blank question(s) have no answers!");
        print("These questions will always be marked wrong!")
    
    cursor.close()
    conn.close()

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
