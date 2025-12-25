import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для поиска пользователей по никнейму'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        query_params = event.get('queryStringParameters', {}) or {}
        search_query = query_params.get('q', '').strip()
        
        if not search_query or len(search_query) < 2:
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'users': []}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(
            """
            SELECT id, username, avatar_url, status, 
                   CASE 
                       WHEN last_seen > NOW() - INTERVAL '5 minutes' THEN true 
                       ELSE false 
                   END as online
            FROM users 
            WHERE username ILIKE %s 
            ORDER BY 
                CASE 
                    WHEN last_seen > NOW() - INTERVAL '5 minutes' THEN 1 
                    ELSE 2 
                END,
                username
            LIMIT 20
            """,
            (f'%{search_query}%',)
        )
        
        users = cur.fetchall()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({
                'users': [
                    {
                        'id': user['id'],
                        'username': user['username'],
                        'avatar_url': user['avatar_url'],
                        'status': user['status'],
                        'online': user['online']
                    }
                    for user in users
                ]
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        cur.close()
        conn.close()
