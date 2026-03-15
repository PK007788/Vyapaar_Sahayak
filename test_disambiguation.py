import json
from app.ai.command_engine import process_command
from app.database import get_connection

def test():
    # Insert multiple rahuls so disambiguation triggers
    conn = get_connection()
    c = conn.cursor()
    try:
        c.execute("INSERT INTO customers (user_id, name, phone) VALUES (1, 'Rahul Das test', '1111')")
        c.execute("INSERT INTO customers (user_id, name, phone) VALUES (1, 'Rahul Gupta test', '2222')")
        conn.commit()
    except Exception as e:
        print("db add skipped", e)
    conn.close()

    print('--- STEP 1: INITIAL COMMAND ---')
    res1 = process_command('Rahul ke naam 100 ka daal Aur 300 Ka chawal add kar do', 1)
    print(json.dumps(res1, indent=2))

    print('\n--- STEP 2: CLARIFICATION ---')
    res2 = process_command('Rahul Das test', 1)
    print(json.dumps(res2, indent=2))

test()
