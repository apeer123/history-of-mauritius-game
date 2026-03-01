import psycopg2
import json
import sys

# Set UTF-8 encoding
sys.stdout.reconfigure(encoding='utf-8')

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
    
    # Simulate what the API returns for question 142
    print("SIMULATING API RESPONSE FOR QUESTION 142...")
    
    cursor.execute("""
        SELECT 
            q.id, q.question_text, q.instruction, q.timer_seconds, q.image_url,
            s.name as subject, l.level_number as level, qt.name as question_type
        FROM questions q
        JOIN subjects s ON q.subject_id = s.id
        JOIN levels l ON q.level_id = l.id
        JOIN question_types qt ON q.question_type_id = qt.id
        WHERE q.id = 142
    """)
    
    q = cursor.fetchone()
    if q:
        q_id, q_text, instruction, timer, image_url, subject, level, q_type = q
        
        print(f"Question ID: {q_id}")
        print(f"Type: {q_type}")
        
        # Fetch fill_answers like the API does
        cursor.execute("""
            SELECT answer_text FROM fill_answers WHERE question_id = %s
        """, (q_id,))
        
        answer_result = cursor.fetchone()
        answer_text = answer_result[0] if answer_result else ""
        
        print(f"Retrieved answer from DB: '{answer_text}'")
        
        # Build response like the API would
        api_response = {
            "id": q_id,
            "title": q_text,
            "question": q_text,
            "instruction": instruction,
            "type": q_type,
            "timer": timer,
            "image": image_url,
            "subject": subject,
            "level": level,
            "answer": answer_text  # This is what the API returns
        }
        
        print("\nAPI RESPONSE:")
        print(json.dumps(api_response, indent=2))
        
        # Check if frontend validation would work
        user_input = "1722"
        print(f"\nFRONTEND VALIDATION TEST:")
        print(f"User enters: '{user_input}'")
        print(f"API says answer is: '{answer_text}'")
        
        # This is how the frontend validates (from fill-in-blanks-game.tsx)
        is_correct = user_input.lower().strip() == answer_text.lower()
        print(f"Is correct (lower/trim): {is_correct}")
        
        if not is_correct:
            print(f"\nVALIDATION FAILED!")
            print(f"User input: '{user_input}' (len={len(user_input)})")
            print(f"Expected:   '{answer_text}' (len={len(answer_text)})")
        else:
            print(f"\nVALIDATION PASSED!")
        
    else:
        print("Question not found!")
    
    cursor.close()
    conn.close()

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
