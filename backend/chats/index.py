import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для управления чатами и сообщениями'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    user_id = headers.get('x-user-id') or headers.get('X-User-Id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'User ID required'}),
            'isBase64Encoded': False
        }
    
    try:
        if method == 'GET':
            return get_user_chats(user_id)
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'create_or_get':
                return create_or_get_chat(user_id, body)
            elif action == 'send_message':
                return send_message(user_id, body)
            elif action == 'get_messages':
                return get_messages(body)
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Invalid action'}),
                    'isBase64Encoded': False
                }
        else:
            return {
                'statusCode': 405,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_user_chats(user_id: str):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute("""
            SELECT 
                c.id as chat_id,
                u.id as user_id,
                u.username,
                u.avatar_url,
                u.status,
                CASE WHEN u.last_seen > NOW() - INTERVAL '5 minutes' THEN true ELSE false END as online,
                (SELECT message_text FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
                (SELECT COUNT(*) FROM messages WHERE chat_id = c.id AND sender_id != %s AND is_read = false) as unread_count
            FROM chats c
            JOIN chat_participants cp ON c.id = cp.chat_id
            JOIN users u ON cp.user_id = u.id
            WHERE c.id IN (
                SELECT chat_id FROM chat_participants WHERE user_id = %s
            ) AND u.id != %s
            ORDER BY last_message_time DESC NULLS LAST
        """, (user_id, user_id, user_id))
        
        chats = cur.fetchall()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'chats': chats}, default=str),
            'isBase64Encoded': False
        }
    finally:
        cur.close()
        conn.close()

def create_or_get_chat(user_id: str, body: dict):
    other_user_id = body.get('other_user_id')
    
    if not other_user_id:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'other_user_id required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute("""
            SELECT c.id as chat_id
            FROM chats c
            JOIN chat_participants cp1 ON c.id = cp1.chat_id
            JOIN chat_participants cp2 ON c.id = cp2.chat_id
            WHERE cp1.user_id = %s AND cp2.user_id = %s
            LIMIT 1
        """, (user_id, other_user_id))
        
        existing_chat = cur.fetchone()
        
        if existing_chat:
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'chat_id': existing_chat['chat_id']}),
                'isBase64Encoded': False
            }
        
        cur.execute("INSERT INTO chats DEFAULT VALUES RETURNING id")
        chat_id = cur.fetchone()['id']
        
        cur.execute(
            "INSERT INTO chat_participants (chat_id, user_id) VALUES (%s, %s), (%s, %s)",
            (chat_id, user_id, chat_id, other_user_id)
        )
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'chat_id': chat_id}),
            'isBase64Encoded': False
        }
    finally:
        cur.close()
        conn.close()

def send_message(user_id: str, body: dict):
    chat_id = body.get('chat_id')
    message_text = body.get('message_text', '').strip()
    
    if not chat_id or not message_text:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'chat_id and message_text required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute(
            "INSERT INTO messages (chat_id, sender_id, message_text) VALUES (%s, %s, %s) RETURNING id, created_at",
            (chat_id, user_id, message_text)
        )
        message = cur.fetchone()
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({
                'message_id': message['id'],
                'created_at': str(message['created_at'])
            }),
            'isBase64Encoded': False
        }
    finally:
        cur.close()
        conn.close()

def get_messages(body: dict):
    chat_id = body.get('chat_id')
    
    if not chat_id:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'chat_id required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute("""
            SELECT 
                m.id,
                m.sender_id,
                m.message_text,
                m.created_at,
                u.username,
                u.avatar_url
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.chat_id = %s
            ORDER BY m.created_at ASC
        """, (chat_id,))
        
        messages = cur.fetchall()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'messages': messages}, default=str),
            'isBase64Encoded': False
        }
    finally:
        cur.close()
        conn.close()
