import psycopg2
import json
import os
from datetime import datetime
from flask import Response

def connect_db():
	database = os.environ.get('DB_NAME', 'postgres')
	host = os.environ.get('DB_HOST', '172.32.74.37')
	user = os.environ.get('DB_USER', 'app_user_test')
	password = os.environ['DB_PASSWORD']
	port = os.environ.get('DB_PORT', '5432')
	conn = psycopg2.connect(database=database, host=host,
                            user=user, password=password, port=port)
	conn.set_session(autocommit=True)
	cursor = conn.cursor()
	return cursor


def fetch(cursor, command, params):
    cursor.execute(command)
    if params == "one":
        result = cursor.fetchone()
        if result != None:
            num_of_entiites = len(command.split(','))
    if params == "all":
        result = cursor.fetchall()
    return result


def isdigit(obj):
	text = str(obj).replace('.', '')
	for char in text:
		if char not in '0123456789':
			return False
	return True

def jsonify(data):
	return Response(json.dumps(data, default=str), content_type="application/json")

def parse_date(date):
	dates = date.split("-")
	start = datetime.strptime(dates[0], '%Y%m%d').date()
	end = datetime.strptime(dates[1], '%Y%m%d').date()
	return start, end

