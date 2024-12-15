import psycopg2
import os
import datetime
import json

paths_json = open("./paths.json", 'r')
paths = json.load(paths_json)
paths_json.close()

dir = paths["Staging"]


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
    subdirectories = [entry.name for entry in os.scandir(dir) if entry.is_dir()]

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
                    sql("UPDATE samples SET error = '%s', stage_date = '%s' WHERE sample_id = '%s' AND stage_date != NULL;"%(subdirectory + '/jobs/' + file, date, sample))
                    # print(filepath)
                    # print(f" - Error in {subdirectory + '/jobs/' + file} ")
                else:
                    sql("UPDATE samples SET stage_date = '%s' WHERE sample_id = '%s' AND stage_date != NULL;"%(date, sample))
                    # print(f" - No Error in {subdirectory + '/jobs/' + file} ")
        else:
            print(datetime.datetime.now().slice(".")[0], f" : No files found in '{subdirectory}/jobs'.")

main()