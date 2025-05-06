import json

generic_configs = {
	"database": "sidra",
	"host": "localhost",
	"password": "mypassword",
	"port": "5432",
	"preprocess_file" : "preprocess.json",
	"schema_file" : "schema.json",
	"runs_file" : "runs.json",
	"FC_QC_url": "https://pme.sidra.org/qc/home?path=sapipe"
}
# Define the configurations for each developer
user_configs = {
    # Deep Chandra
    "deepc": {
        "user": "deepc",
        "staging": "/Users/deepc/genomics-lab-dashboard/database/input-data-for-externs/staging-dirs/",
        "fcqc": "/Users/deepc/genomics-lab-dashboard/database/input-data-for-externs/flowcell-qc-reports",
        "projects": "/Users/deepc/genomics-lab-dashboard/database/input-data-for-externs/project-dirs",
        "rawinfo": "/Users/deepc/genomics-lab-dashboard/database/input-data-for-externs/rawinfo-dirs",
        "runs": "/Users/deepc/genomics-lab-dashboard/database/input-data-for-externs/Runs"
    },
    # Abrar Abir
    "aabir": {
        "user": "postgres",
        "staging": "/gpfs/scratch/",
        "fcqc": "/gpfs/ngsdata/sap_workplace/www/MultiQC/Flowcell/",
        "projects": "/gpfs/projects/ngs_projects",
        "rawinfo": "/gpfs/dropbox/conversion/conversion-tasks/",
        "runs": "/ddn/illumina_raw/"
    }
}

# Ask the user for their name
developer = input("Enter the developer name (deepc/aabir): ").strip().lower()

if developer in user_configs:
	# Write the selected configuration to a file
	with open("active_config.json", "w") as config_file:
		json.dump(generic_configs | user_configs[developer], config_file, indent=4)
	print(f"Configuration for {developer} has been set.")
else:
	print("Invalid developer name. Please run the script again with a valid name, or setup your config in db_setup.py")
