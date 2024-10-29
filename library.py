import psycopg2
import json
import os


def get_database_info(json_file: str = "database/active_config.json") -> tuple[str, str, str, str, str]:
  with open(json_file, 'r') as database_json:
    info = json.load(database_json)
  database = info["database"]
  host = info["host"]
  user = info["user"]
  password = info["password"]
  port = info["port"]
  return database, host, user, password, port


def connect_to_postgres(database="sidra", host="localhost", user="postgres", password="mypassword", port="5432") -> tuple[psycopg2.extensions.connection, psycopg2.extensions.cursor]:
  conn = psycopg2.connect(database=database, host=host,
                          user=user, password=password, port=port)
  conn.set_session(autocommit=True)
  cursor = conn.cursor()
  return conn, cursor


def fetch(cursor: psycopg2.extensions.cursor, command: str, params: str) -> [None | tuple | list]:
  cursor.execute(command)
  if params == "one":
    result = cursor.fetchone()
    if result != None:
      num_of_entiites = len(command.split(','))
    #   assert len(
        # result) == num_of_entiites, f"fetchone() result {result} expected to have length {num_of_entiites} but got length {len(result)}"
  if params == "all":
    result = cursor.fetchall()
  return result
