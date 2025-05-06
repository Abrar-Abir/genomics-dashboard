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
    
# curl 'https://apitest.sidra.org/ram/login' \
#  -F 'username="aabir@smrc.sidra.org"' \
#  -F 'password=""'\
#  -F 'clientId="ngc-test-client"'
# {
# 	"token":"Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ7XCJ1c2VybmFtZVwiOlwiQUFiaXJcIixcInBlcm1pc3Npb25zXCI6W10sXCJjbGllbnRJZFwiOlwibmdjLXRlc3QtY2xpZW50XCIsXCJmaXJzdF9uYW1lXCI6XCJBYnJhciBUYXNuZWVtXCIsXCJsYXN0X25hbWVcIjpcIkFiaXJcIixcImVtYWlsXCI6XCJBQWJpckBzaWRyYS5vcmdcIixcImV4cGlyZXNfYXRcIjoxNzQ1NTcyMDU4MTQ4fSIsImlzcyI6ImxkYXAtYXV0aC1zZXJ2ZXIuaW50ZXJuYWwiLCJleHAiOjE3NDU1NzIwNTh9.A1c4nZINruxJ85BMA7qSf5q0T5O4PN4DDfyAymDsjoqPSy2NGNOaXdy5x8IVWn0cgwAJzer0@LAPTOP-BKQN3C80

# curl 'https://apitest.sidra.org/ram/validate' --header 'X-API-Version: v1' --header 'X-Protocol: 50' --header 'X-Project: 416' --header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ7XCJ1c2VybmFtZVwiOlwiQUFiaXJcIixcInBlcm1pc3Npb25zXCI6W10sXCJjbGllbnRJZFwiOlwibmdjLXRlc3QtY2xpZW50XCIsXCJmaXJzdF9uYW1lXCI6XCJBYnJhciBUYXNuZWVtXCIsXCJsYXN0X25hbWVcIjpcIkFiaXJcIixcImVtYWlsXCI6XCJBQWJpckBzaWRyYS5vcmdcIixcImV4cGlyZXNfYXRcIjoxNzQ2MDM3Mjk0OTY1fSIsImlzcyI6ImxkYXAtYXV0aC1zZXJ2ZXIuaW50ZXJuYWwiLCJleHAiOjE3NDYwMzcyOTR9.ZU107BJWi42FSS42jM1FHYvdfC7J07uDFKnp9u-Ccot8CNzlmpGqvORfmmNQMs4P2D_m_6F4pn_EoElxPGHIUA'

# {"username":"AAbir","permissions":[],"clientId":"ngc-test-client","first_name":"Abrar Tasneem","last_name":"Abir","email":"AAbir@sidra.org","expires_at":"2025-04-25T09:07:38.148+0000"}

# curl 'https://apitest.sidra.org/ram/users/sdrs' --header 'Content-Type: application/json' --header 'Authorization: Bearer XXXX' --data-raw '{"email":"dchaussabel@sidra.org"}'

