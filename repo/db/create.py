import json
from log import execution_logger
from lib import connect_db, enforce_logging


@enforce_logging()
def get_commands():
	with open("schema.json", "r") as file:
		schema = json.load(file)
	commands = []

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
                f"""{column_name} {column_type} """)
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

		command = f"CREATE TABLE {table_name} (\n\t{', '.join(columns)}\n);"
		execution_logger.debug(f"sql command {command}")
		commands.append(command)

	return commands


@enforce_logging()
def create_db():

    commands = get_commands()
    conn, cursor = connect_db()
    for commmand in commands:
        cursor.execute(command)
        execution_logger.debug(f"command executed {commmand}")
    cursor.close()
    conn.close()


create_db()
