import psycopg2
import os


dir = "/home/zer0/container/genomics-lab-dashboard/database/input-data-for-externs/input-data-for-externs/staging-dirs/"


conn = psycopg2.connect(database="sidra",
                        host="localhost",
                        user="postgres",
                        password="mypassword",
                        port="5432")
# conn.autocommit = True
conn.set_session(autocommit=True)
cursor = conn.cursor()

def sql(command):
    try:
        cursor.execute(command)
    except Exception as e:
        print("Failed to Execute\n")
        print(command)
        print("For the Exception\n")
        print(e)
    return 0


sql("SELECT sample_id, error FROM samples WHERE error != '_'")
results = cursor.fetchall()
for row in results:
  path = dir + row[1]
  if os.path.isfile(path) and os.pathgetsize(path) == 0:
    sql("UPDATE samples SET error = '_' WHERE sample_id = '%s'"%(row[0],))
    
