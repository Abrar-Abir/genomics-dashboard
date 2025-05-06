from psycopg2 import extras
import json
import csv
import os
from datetime import date, datetime
from log import execution_logger, app_logger
from library import connect_to_postgres, fetch, get_database_info, enforce_logging, list_nested_paths


# @enforce_logging(main=False)
# def log_error(expr: bool, error: str, args: list[str, int, list[str], tuple[str], date]):
#     # database operation as well
#     if expr == False:
#         if error.endswith('error'):
#             app_logger.error(f'"{error}"\t' +
#                              ' '.join([str(arg) for arg in args]))
#             if error.startswith('path'):
#                 raise AssertionError
#         elif error.endswith('warning'):
#             app_logger.warning(
#                 f'"{error}"\t' + ' '.join([str(arg) for arg in args]))
#     return 0


# @enforce_logging(main=True)
# def path_join(base_dir: str, suffixes: list[str], isdir: bool) -> str:
#     for suffix in suffixes:
#         log_error(os.path.exists(base_dir), 'path_not_found_error', [base_dir])
#         log_error(os.path.isdir(base_dir),
#                   'path_not_directory_error', [base_dir])
#         base_dir = os.path.join(base_dir, suffix)
#     if isdir == True:
#         log_error(os.path.isdir(base_dir),
#                   'path_not_directory_error', [base_dir])
#     else:
#         log_error(os.path.isfile(base_dir), 'path_not_file_error', [base_dir])
#     return base_dir



with open("./active_config.json", 'r') as paths_json:
    paths = json.load(paths_json)
    staging_directory = paths["staging"]

database, host, user, password, port = get_database_info(
    "./active_config.json")
conn, cursor = connect_to_postgres(database, host, user, password, port)
conn.autocommit = False


# Function to list files in the 'jobs' subfolder
def list_files(directory):
    jobs_directory = os.path.join(directory, 'jobs')
    
    # Check if the 'jobs' subfolder exists
    if not os.path.exists(jobs_directory) or not os.path.isdir(jobs_directory):
        return []

    # List all the files in the 'jobs' subfolder
    job_files = os.listdir(jobs_directory)

    # Filter and keep only non-empty files
    files = []
    for file in job_files:
        file_path = os.path.join(jobs_directory, file)
        if os.path.isfile(file_path):
            files.append(file)

    return files

# Main function to traverse through the subdirectories
def main():

    # Get a list of all subdirectories in the base directory 
    subdirectories = [entry.name for entry in os.scandir(staging_directory) if entry.is_dir()]

    # Traverse through each subdirectory and list files in the 'jobs' subfolder
    for subdirectory in subdirectories:
        subdirectory_path = os.path.join(dir, subdirectory)
        # print(subdirectory_path)
        files = list_files(subdirectory_path)

        # Print the results for each subdirectory
        if files:
            print(f" {str(len(files))} Files found in '{subdirectory}/jobs':")
            for file in files:
              
                sample = file.split("-")[-1].split("_")[0]

                date = datetime.datetime.strptime(subdirectory.split("_")[-1], "%d-%m-%Y").date()
                
                filepath = subdirectory_path + "/jobs/" + file

                if os.path.getsize(filepath) > 0:
                    # sql("UPDATE samples SET error = '%s', stage_date = '%s' WHERE sample_id = '%s' AND stage_date != NULL;"%(subdirectory + '/jobs/' + file, date, sample))
                    # print(filepath)
                    print(f" - Error in {subdirectory + '/jobs/' + file}, {date}, {sample} ")
                else:
                    # sql("UPDATE samples SET stage_date = '%s' WHERE sample_id = '%s' AND stage_date != NULL;"%(date, sample))
                    print(f" - Empty in {subdirectory + '/jobs/' + file}, {date}, {sample}  ")
        else:
            print(datetime.datetime.now().slice(".")[0], f" : No files found in '{subdirectory}/jobs'.")

main()