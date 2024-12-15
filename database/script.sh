#!/bin/bash

# Clear the terminal screen
clear

psql -U postgres -c 'DROP DATABASE sidra WITH (FORCE);'
psql -U postgres -c 'CREATE DATABASE sidra;'
python3 db_setup.py
python3 create_db.py
python3 insert_db.py
