import psycopg2
import json
import os
from log import execution_logger

def enforce_logging(main = False):
    def logging_enforcer(func):
        def wrapper(*args, **kwargs):
            try:
                result = func(*args, **kwargs)
                return result
            except Exception as e:
                execution_logger.error(f"Error in {func.__name__}: {e}")
                if main == False:
                    raise e
        return wrapper
    return logging_enforcer

@enforce_logging()
def get_database_info(json_file : str = "./active_config.json") -> tuple[str, str, str, str, str]:
    with open(json_file, 'r') as database_json:
        info = json.load(database_json)
    database = info["database"]
    host = info["host"]
    user = info["user"]
    password = info["password"]
    port = info["port"]
    return database, host, user, password, port

@enforce_logging()
def connect_to_postgres(database="sidra", host="localhost", user="postgres", password="mypassword", port="5432") -> tuple[psycopg2.extensions.connection, psycopg2.extensions.cursor]:
	conn = psycopg2.connect(database=database, host=host, user=user, password=password, port=port)
	conn.set_session(autocommit=True)
	cursor = conn.cursor()
	return conn, cursor

@enforce_logging()
def fetch(cursor : psycopg2.extensions.cursor, command : str, params : str) -> [None | tuple | list]: 
    cursor.execute(command)
    if params == "one":
        result = cursor.fetchone()
        if result != None:
            num_of_entiites = len(command.split(','))
            assert len(result) == num_of_entiites, f"fetchone() result {result} expected to have length {num_of_entiites} but got length {len(result)}"
    if params == "all":
        result = cursor.fetchall()
        # if result != None:
            # num_of_entiites = len(command.split(','))
            # for row in result:
            #     assert len(row) == num_of_entiites, f"fetchall() result row {row} expected to have length {num_of_entiites} but got length {len(row)}"
    return result

@enforce_logging()
def list_nested_paths(directory : str, subdirectory : str, extension : str, isfile : bool) -> list[str]:
	nested_directory = os.path.join(directory, subdirectory)
	paths = []
	with os.scandir(nested_directory) as nested_paths:
		for path in nested_paths:
			if (isfile == True and os.path.isfile(path)) or (isfile == False and os.path.isdir(path)):
				path_name = path.path
				# print(path_name)
				if path_name.endswith(extension):
					paths.append(path.path)
	return paths

def isdigit(text):
	for char in text:
		if char not in '0123456789':
			return False
	return True

def detect_date_format(date_str):
	if date_str == '':
		return None
	separators = ['/', '-']
	for sep in separators:
		if sep in date_str:
			parts = date_str.split(sep)
			if len(parts) != 3:
				if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit() and len(parts[0]) == len(parts[1]) == 8:
					return 'yyyymmdd' + sep + 'yyyymmdd'
				else:
					return 'unsupported'
			if len(parts[0]) == 4:
				# year first
				if int(parts[1]) > 12:
					return 'yyyy' + sep + 'dd' + sep + 'mm'
				if int(parts[2]) > 12:
					return 'yyyy' + sep + 'mm' + sep + 'dd'
				# ambiguous but fixed to be yyyymmdd
				return 'yyyy' + sep + 'mm' + sep + 'dd'
			if len(parts[2]) == 4:
				# year last
				if int(parts[0]) > 12:
					return 'dd' + sep + 'mm' + sep + 'yyyy'
				if int(parts[1]) > 12:
					return 'mm' + sep + 'dd' + sep + 'yyyy'
				# ambiguous
				return 'md' + sep + 'md' + sep + 'yyyy' 
			if int(parts[2]) in [22, 23, 24] and int(parts[0]) not in [22, 23, 24]:
				if int(parts[0]) > 12:
					return 'dd' + sep + 'mm' + sep + 'yy'
				if int(parts[1]) > 12:
					return 'mm' + sep + 'dd' + sep + 'yy'
				# edit
				return 'md' + sep + 'md' + sep + 'yy'
			if int(parts[2]) not in [22, 23, 24] and int(parts[0]) in [22, 23, 24]:
				if int(parts[1]) > 12:
					return 'yy' + sep + 'dd' + sep + 'mm'
				if int(parts[0]) > 12:
					return 'yy' + sep + 'mm' + sep + 'dd'
				return 'yy' + sep + 'md' + sep + 'md'
			if int(parts[0]) in [22, 23, 24] and int(parts[2]) in [22, 23, 24]:
				return 'dd' + sep + 'mm' + sep + 'yy'
    # If no separators found, assume yyyymmdd format or yymmdd format
	if date_str.isdigit():
		if len(date_str) == 8:
			return 'yyyymmdd'
		if len(date_str) == 6:
			return 'yymmdd'
	else:
		print(f"'{date_str}'")
		return 'unsupported'
