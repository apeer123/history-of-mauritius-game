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
    
    # Get the answer with detailed analysis
    cursor.execute("""
        SELECT answer_text, LENGTH(answer_text) as length, 
               OCTET_LENGTH(answer_text) as byte_length,
               encode(answer_text::bytea, 'hex') as hex_encoding
        FROM fill_answers
        WHERE question_id = 142
    """)
    
    result = cursor.fetchone()
    if result:
        answer, length, byte_length, hex_code = result
        print("FILL-IN-THE-BLANK ANSWER ANALYSIS (Question 142)")
        print("="*50)
        print(f"Answer stored: '{answer}'")
        print(f"Character length: {length}")
        print(f"Byte length: {byte_length}")
        print(f"Hex encoding: {hex_code}")
        print()
        
        # Check for common issues
        print("VALIDATION CHECKS:")
        print("-" * 50)
        print(f"Starts with whitespace: {answer[0].isspace() if answer else 'N/A'}")
        print(f"Ends with whitespace: {answer[-1].isspace() if answer else 'N/A'}")
        print(f"Contains only digits: {answer.isdigit()}")
        print(f"Expected (1722): {answer == '1722'}")
        
        # Test user input scenarios
        print("\nUSER INPUT SCENARIOS:")
        print("-" * 50)
        test_cases = [
            "1722",
            "1722 ",
            " 1722",
            " 1722 ",
            "1722\n",
            "1722\t",
        ]
        
        for test in test_cases:
            match = test.lower().strip() == answer.lower()
            status = "PASS" if match else "FAIL"
            repr_test = repr(test)
            print(f"  {repr_test:20} -> {status}")
            
        # Also verify frontend logic would work
        print("\nFRONTEND LOGIC TEST:")
        print("-" * 50)
        user_input = "1722"
        is_correct = user_input.lower().strip() == answer.lower()
        print(f"If user enters: '{user_input}'")
        print(f"Answer in DB:   '{answer}'")
        print(f"Validation:     {is_correct}")
    
    cursor.close()
    conn.close()

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
