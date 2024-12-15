import json
from log import execution_logger
from library import connect_to_postgres, get_database_info, enforce_logging


@enforce_logging()
def generate_create_table_sql(schema):
    create_table_sqls = []

    for table_name, table_details in schema["table"].items():
        entity = table_details["entity"]
        primary_key = table_details["primary_key"]
        foreign_key = table_details["foriegn_key"]
        checks = table_details["check"]

        columns = []
        for column_name, column_details in entity.items():
            column_type = column_details["type"]
            not_null = column_details["not_null"]
            columns.append(
                f"""{column_name} {column_type} {'NOT NULL' if not_null else 'DEFAULT "N/A"'}""")
        if foreign_key:
            for fk in foreign_key:
                column_type = schema["table"][fk.split(
                    '_')[0]]["entity"][fk]["type"]
                columns.append(f"{fk} {column_type} NOT NULL")

        if primary_key:
            columns.append(f"PRIMARY KEY ({', '.join(primary_key)})")

        if foreign_key:
            for fk in foreign_key:
                columns.append(
                    f"FOREIGN KEY ({fk}) REFERENCES {fk.split('_')[0]} ({fk})")

        if checks:
            for check in checks:
                columns.append(f"CHECK ({check})")

        create_table_sql = f"CREATE TABLE {table_name} (\n\t{', '.join(columns)}\n);"
        execution_logger.debug(f"sql command {create_table_sql}")
        create_table_sqls.append(create_table_sql)

    return create_table_sqls


@enforce_logging()
def create_db():
    with open("schema.json", "r") as file:
        schema = json.load(file)
    create_table_sqls = generate_create_table_sql(schema)
    database, host, user, password, port = get_database_info(
        "./active_config.json")
    conn, cursor = connect_to_postgres(database, host, user, password, port)
    conn.autocommit = True
    create_table_sqls = generate_create_table_sql(schema)
    for sql in create_table_sqls:
        cursor.execute(sql)
        execution_logger.debug(f"command executed {sql}")
    cursor.close()
    conn.close()


create_db()
