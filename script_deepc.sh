# #!/bin/bash

# # Clear the terminal screen
# clear

# # Run the setup_config.py script to set the appropriate configuration
# python3 db_setup.py

# # Drop and create the database using psql
# psql -U deepc -d template1 -c 'DROP DATABASE IF EXISTS sidra;'
# psql -U deepc -d template1 -c 'CREATE DATABASE sidra;'

# # Run the createDB.py script
# python3 createDB.py

# # Run the insertDB.py script and log the output
# python3 insertDB.py > "log.txt" 2>&1

# # Run the api
# python3 ../flask/api.py



#!/bin/bash

# Clear the terminal screen
clear

psql -U deepc -d template1 -c 'DROP DATABASE sidra WITH (FORCE);'
psql -U deepc -d template1 -c 'CREATE DATABASE sidra;'

# Connect to the database and drop existing tables and constraints
psql -U deepc -d sidra <<EOF
DO \$\$ DECLARE
    r RECORD;
BEGIN
    -- Drop all tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;

    -- Drop all constraints
    FOR r IN (SELECT conname, conrelid::regclass AS table_name FROM pg_constraint WHERE connamespace = 'public'::regnamespace) LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.table_name) || ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
    END LOOP;
END \$\$;
EOF

# Restore the database from the dump file
psql -U deepc -d sidra < sidra.pgsql
# psql -U deepc sidra < sidra.pgsql
# python3 db_setup.py
# python3 create_db.py
# python3 insert_db.py

# Run the api
python3 ../flask/api.py