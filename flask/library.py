import psycopg2
import json
import os
from datetime import datetime
from flask import Response

def get_database_info(json_file: str = "active_config.json") -> tuple[str, str, str, str, str]:
    with open(json_file, 'r') as database_json:
        info = json.load(database_json)
    database = info["database"]
    host = info["host"]
    user = info["user"]
    password = info["password"]
    port = info["port"]
    return database, host, user, password, port


def connect_to_postgres(database="sidra", host="localhost", user="postgres", password="", port="5432"):
    conn = psycopg2.connect(database=database, host=host,
                            user=user, password=password, port=port)
    conn.set_session(autocommit=True)
    cursor = conn.cursor()
    return conn, cursor


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

