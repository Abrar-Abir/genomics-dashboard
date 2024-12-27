from psycopg2 import extras
import json
import csv
import os
from datetime import date, datetime
from log import execution_logger, app_logger
from library import connect_to_postgres, fetch, get_database_info, enforce_logging, list_nested_paths


@enforce_logging(main=False)
def log_error(expr: bool, error: str, args: list[str, int, list[str], tuple[str], date]):
    # database operation as well
    if expr == False:
        if error.endswith('error'):
            app_logger.error(f'"{error}"\t' +
                             ' '.join([str(arg) for arg in args]))
            if error.startswith('path'):
                raise AssertionError
        elif error.endswith('warning'):
            app_logger.warning(
                f'"{error}"\t' + ' '.join([str(arg) for arg in args]))
    return 0


@enforce_logging(main=True)
def path_join(base_dir: str, suffixes: list[str], isdir: bool) -> str:
    for suffix in suffixes:
        log_error(os.path.exists(base_dir), 'path_not_found_error', [base_dir])
        log_error(os.path.isdir(base_dir),
                  'path_not_directory_error', [base_dir])
        base_dir = os.path.join(base_dir, suffix)
    if isdir == True:
        log_error(os.path.isdir(base_dir),
                  'path_not_directory_error', [base_dir])
    else:
        log_error(os.path.isfile(base_dir), 'path_not_file_error', [base_dir])
    return base_dir


@enforce_logging()
def get_schema(schema_file_path: str) -> dict[dict[list[str] | dict[bool]]]:
    # only the schema dict with raw_info entites and not_null info
    schema_dict = dict()
    with open(schema_file_path, 'r') as schema_json:
        schema = json.load(schema_json)
        table_schema = schema["table"]
        for table_name in table_schema:
            table_dict = table_schema[table_name]
            primary_keys = table_dict["primary_key"]
            entity_dict = dict()
            for entity_key in table_dict["entity"]:
                if (entity_key in RAW_INFO_ENTITIES) and (not (entity_key in primary_keys)):
                    entity_dict[entity_key] = table_dict["entity"][entity_key]["not_null"]
            if table_dict["foriegn_key"] != None:
                for key in table_dict["foriegn_key"]:
                    entity_dict[key] = True
            schema_dict[table_name] = {
                "primary_keys": primary_keys, "entity_dict": entity_dict}
    return schema_dict


#  GLOBAL
COL_NUMBERS = 35
# date_parser = parser.parserinfo(dayfirst=False)
with open("./active_config.json", 'r') as paths_json:
    paths = json.load(paths_json)
    fcqc_directory = paths["fcqc"]
    rawinfo_directory = paths["rawinfo"]
    runs_directory = paths["runs"]
    projects_directory = paths["projects"]
    preprocess_file_path = paths["preprocess_file"]
    schema_file_path = paths["schema_file"]
    runs_file_path = paths["runs_file"]

RAW_INFO_ENTITIES = []
with open(preprocess_file_path, "r") as preprocess:
    PREPROCESS_DICT = json.load(preprocess)
    for col_name in PREPROCESS_DICT:
        for entity in PREPROCESS_DICT[col_name]:
            RAW_INFO_ENTITIES.append(entity)
with open(runs_file_path, 'r') as runs:
    RUNS = json.load(runs)
SCHEMA = get_schema(schema_file_path)
database, host, user, password, port = get_database_info(
    "./active_config.json")
conn, cursor = connect_to_postgres(database, host, user, password, port)
conn.autocommit = False


@enforce_logging()
def process_raw_info(raw_info_file_path: str, flowcell: str):
    with open(raw_info_file_path, "r") as raw_info_file:
        #  column validation
        raw_info_reader = csv.DictReader(raw_info_file, delimiter='\t')
        columns = []
        raw_info_entities = []
        for column in raw_info_reader.fieldnames:
            log_error(column == column.strip(), 'extra_whitespace_warning',
                      [raw_info_file_path, f"'{column}'"])
            column_name = column.strip().lower()
            if column_name not in PREPROCESS_DICT:
                log_error(False, 'new_column_warning',
                          [raw_info_file_path, column])
            else:
                if column_name in columns:
                    log_error(False, "duplicate_column_error", [
                              raw_info_file_path, column_name])
                else:
                    columns.append(column_name)
                    for entity in PREPROCESS_DICT[column_name].keys():
                        if entity in raw_info_entities:
                            log_error(False, "duplicate_column_error", [
                                      raw_info_file_path, column_name])
                        else:
                            raw_info_entities.append(entity)
        log_error(len(columns) == COL_NUMBERS, "missing_column_error", [raw_info_file_path, len(
            columns), [entity for entity in RAW_INFO_ENTITIES if entity not in raw_info_entities]])
        # flowcell filtering
        raw_info_list = list(raw_info_reader)
        for line_no in range(len(raw_info_list)):
            raw_info_list[line_no] = {key.strip().lower(): value.strip()
                                      for key, value in raw_info_list[line_no].items()}
            raw_info_list[line_no]["line_no"] = line_no
        raw_info = [row for row in raw_info_list if row["fc"] == flowcell]
    # preprocessing
    for column in columns:
        preprocess_col = PREPROCESS_DICT[column]
        for entity in preprocess_col:
            fn = eval(preprocess_col[entity])
            for line in raw_info:
                line[entity] = fn(line[column])
        for line in raw_info:
            if column not in preprocess_col:
                del line[column]
    return raw_info


def float_compare(value_1, value_2):
    if '.' in value_1 and value_1.replace('.', '').isdigit():
        value_1 = str(float(value_1)).rstrip('0').rstrip('.')
    if '.' in value_2 and value_2.replace('.', '').isdigit():
        value_2 = str(float(value_2)).rstrip('0').rstrip('.')
    return value_1 == value_2


@enforce_logging()
def get_entity_dict(raw_info: list[dict], primary_keys: list[str], entity_keys: list[str]) -> dict[dict]:
    # in-file integrity checking
    result = dict()
    for row in raw_info:
        primary_values = tuple(row[key] for key in primary_keys)
        if primary_values in result:
            for entity_key in entity_keys:
                if entity_key in row:
                    if not entity_key.startswith('lane'):
                        if entity_key in ('pf_reads', 'loading_conc', 'qpcr', 'labchip_conc'):
                            log_error(float_compare(result[primary_values][entity_key], row[entity_key]), 'inconsistency_error', [
                                      primary_keys, primary_values, entity_key, result[primary_values][entity_key], result[primary_values]['line_no'], row[entity_key], row['line_no']])
                            log_error((not float_compare(result[primary_values][entity_key], row[entity_key])) or (result[primary_values][entity_key] == row[entity_key]), 'precision_warning', [
                                      primary_keys, primary_values, entity_key, result[primary_values][entity_key], result[primary_values]['line_no'], row[entity_key], row['line_no']])
                            # log_error(, f"INCONSISTENCY : for primary key {primary_keys} = {primary_values} and entity key {entity_key}, there should be one entity value but found more than 1 : entity value = {result[primary_values][entity_key]} in line(s) {result[primary_values]['line_no']} but entity value = {row[entity_key]} in line {row['line_no']}")
                        else:
                            log_error(result[primary_values][entity_key] == row[entity_key], 'inconsistency_error', [primary_keys, primary_values,
                                      entity_key, result[primary_values][entity_key], result[primary_values]['line_no'], row[entity_key], row['line_no']])
                    else:
                        if entity_key == 'lane':
                            if row[entity_key] not in result[primary_values][entity_key]:
                                result[primary_values][entity_key] = result[primary_values][entity_key] + \
                                    ' ' + row[entity_key]
                        else:
                            result[primary_values][entity_key] = result[primary_values][entity_key] or row[entity_key]
        else:
            result[primary_values] = dict()
            for entity_key in entity_keys:
                if entity_key in row:
                    result[primary_values][entity_key] = row[entity_key]
            result[primary_values]["line_no"] = row.get("line_no", 0)
    return result


@enforce_logging()
def integrity_check_table(raw_info: list[dict], table: str) -> list[dict]:
    primary_keys, entity_dict = SCHEMA[table]["primary_keys"], SCHEMA[table]["entity_dict"]
    entity_keys = [key for key in entity_dict]
    # in-file integrity check
    result = get_entity_dict(raw_info, primary_keys, entity_keys)
    table_rows = []
    for primary_value in result:
        row = result[primary_value]
        for (key, value) in zip(primary_keys, primary_value):
            row[key] = value
        del row["line_no"]
        table_rows.append(row)
        # database-integrity check
    new_rows = []
    for row in table_rows:
        primary_values = [row[key] for key in primary_keys]
        entity_values = [row[key] for key in entity_keys if key in row]
        query = f"""SELECT {','.join(entity_keys + primary_keys)} FROM {table} WHERE ({','.join(primary_keys)}) = ({','.join( [f"'{value}'" for value in primary_values])});"""
        data = fetch(cursor, query, "one")
        if data == None:
            execution_logger.debug(
                f"No entry found for {primary_keys} = {primary_values}")
            new_rows.append(row)
        else:
            for i in range(len(entity_keys)):
                log_error((entity_dict[entity_keys[i]] == False) or (
                    data[i] != None), 'empty_field_error', [primary_keys, entity_keys[i]])
                log_error((entity_dict[entity_keys[i]] == True) or (
                    data[i] != None), 'empty_field_warning', [primary_keys, entity_keys[i]])
                log_error(data[i] == entity_values[i], 'data_integrity_error', [
                          primary_keys, [entity_keys[i]], data[i], entity_values[i]])
                # assert_log( data[i] == entity_values[i], f"MISMATCH : entry with primary {primary_keys} already exists with entity {entity_keys[i]} = {data[i]} but the new entry attempted to be inserted in table {table} has entity {entity_keys[i]} = {entity_values[i]}", app_logger)
        execution_logger.debug(
            f"format checking passed for primary key {primary_keys} and entity_keys {entity_keys} in table {table}")
    return new_rows


@enforce_logging()
def integrity_check(fc_runs_dir: str, flowcell: str):
    # preprocess
    sequencer, run_id, position, raw_info_filename, loading_date = validate_runs(
        fc_runs_dir, flowcell)
    raw_info_dirs = [dir for dir in os.listdir(rawinfo_directory) if dir.startswith(
        raw_info_filename) and flowcell in os.listdir(os.path.join(rawinfo_directory, dir))]
    # if len(raw_info_dirs) != 1:
    #   log_error(False, "suspicious_rawinfo_dir_error", [dir for dir in os.listdir(
    #     rawinfo_directory) if dir.startswith(raw_info_filename)])
    #   return None, None, None, None, None, None, None, None

    raw_info_file_path = os.path.join(os.path.join(
        rawinfo_directory, raw_info_dirs[0]), 'raw.info')
    raw_info = process_raw_info(raw_info_file_path, flowcell)

    # extracting table rows from raw_info
    project_rows = integrity_check_table(raw_info, 'project')
    i5_rows = integrity_check_table(raw_info, "i5")
    i7_rows = integrity_check_table(raw_info, "i7")
    submission_rows = integrity_check_table(raw_info, "submission")
    flowcell_rows = integrity_check_table(raw_info, "flowcell")
    pool_rows = integrity_check_table(raw_info, "pool")
    sample_rows = integrity_check_table(raw_info, "sample")
    sequencer_rows = integrity_check_table(
        [{"sequencer_id": sequencer}], "sequencer")

    # postprocessing flowcell data
    if len(flowcell_rows) == 0:
        log_error(False, 'no_flowcell_rows_in_raw_info_error',
                  [flowcell, raw_info_file_path])
        return None, None, None, None, None, None, None, None
    if len(flowcell_rows) > 1:
        log_error(False, "flowcell_filter_error",
                  [flowcell, raw_info_file_path])
        return None, None, None, None, None, None, None, None

    flowcell_rows[0]["sequencer_id"] = sequencer
    flowcell_rows[0]["run_id"] = run_id
    flowcell_rows[0]["position"] = position
    flowcell_rows[0]["loading_date"] = loading_date
    flowcell_rows[0]["process_date"] = datetime.today().date()

    # postprocessing sample data
    sample_rows, flowcell_rows = get_multiqc_data(sample_rows, flowcell_rows)

    return project_rows, i5_rows, i7_rows, sequencer_rows, flowcell_rows, pool_rows, submission_rows, sample_rows


@enforce_logging()
def get_multiqc_data(sample_rows, flowcell_rows):
    flowcell = flowcell_rows[0]["flowcell_id"]
    multiqc_json_path = path_join(
        fcqc_directory, [flowcell, flowcell + '_data', 'multiqc_data.json'], False)
    with open(multiqc_json_path, "r") as json_file:
        multiqc_data = json.load(json_file)
        if "report_saved_raw_data" in multiqc_data:
            if "multiqc_bcl2fastq_bysample" in multiqc_data["report_saved_raw_data"]:
                multiqc = multiqc_data["report_saved_raw_data"]["multiqc_bcl2fastq_bysample"]
                tool = 'bcl2fastq'
            elif "multiqc_bclconvert_bysample" in multiqc_data["report_saved_raw_data"]:
                multiqc = multiqc_data["report_saved_raw_data"]["multiqc_bclconvert_bysample"]
                tool = 'bclconvert'
            else:
                log_error(False, "multiqc_bysample_not_found_error",
                          [multiqc_json_path])
                return sample_rows, flowcell_rows
        else:
            log_error(False, "report_saved_raw_data_not_found_error",
                      [multiqc_json_path])
            return sample_rows, flowcell_rows

    for row_no in range(len(sample_rows)):
        sample_id = sample_rows[row_no]["sample_id"]
        if sample_id not in multiqc:
            app_logger.error(
                f"sample_id {sample_id} key was not found in {multiqc_json_path}")
            sample_rows[row_no]["mean_qscore"] = None
            sample_rows[row_no]["yieldQ30"] = None
        else:
            if tool == 'bclconvert':
                sample_rows[row_no]["mean_qscore"] = multiqc[sample_id]["mean_quality"]
                sample_rows[row_no]["yieldQ30"] = multiqc[sample_id]["yield"]
            elif tool == 'bcl2fastq':
                sample_rows[row_no]["mean_qscore"] = multiqc[sample_id]["mean_qscore"]
                sample_rows[row_no]["yieldQ30"] = multiqc[sample_id]["yieldQ30"]
            else:
                assert False, f"{multiqc_json_path}, {tool}"
    flowcell_rows[0]['tool'] = tool
    flowcell_rows[0]['multiqc_version'] = multiqc_data["config_version"]
    flowcell_rows[0]['demultiplex_date'] = datetime.strptime(
        multiqc_data['config_creation_date'].split(',')[0], '%Y-%m-%d').date()
    return sample_rows, flowcell_rows


@enforce_logging(main=False)
def validate_runs(dir_name: str, flowcell: str) -> tuple[str, str, str, str, date]:
    # 230411_A01675_0253_BHFTVCDRX2
    tokens = dir_name.split("_")
    assert (len(tokens) == 4)
    assert tokens[-1][1:
                      ] == flowcell, f"Although dir_name {dir_name} ends with fc_id {flowcell}, dir_name.split('_')[-1][1:] != fc_id"
    raw_info_filename = tokens[0]
    loading_date = datetime.strptime('20' + raw_info_filename, '%Y%m%d').date()
    sequencer = tokens[1]
    run_id = tokens[2]
    position = tokens[3][0]
    # log_error(position in ['A', 'B'], 'position_parse_warning', [
    #   position, dir_name, flowcell])
    assert tokens[3][0] in [
        "A", "B"], f"could not extract position from dir_name {dir_name}; expected 'A' or 'B' but got {tokens[3][0]}"
    if tokens[3][0] == "A":
        position = True
    else:
        position = False
    return sequencer, run_id, position, raw_info_filename, loading_date


@enforce_logging()
def construct_insert_query(table_name, table_rows):
    if len(table_rows) == 0:
        return '', []
    columns = table_rows[0].keys()
    insert_query = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES %s"
    reformatted_data = [tuple([row[column] for column in columns])
                        for row in table_rows]
    return insert_query, reformatted_data


@enforce_logging()
def store(flowcell: str):
    print("parsing flowcell ", flowcell)
    paths = list_nested_paths(runs_directory, "", flowcell, isfile=False)
    if len(paths) == 0 and flowcell not in RUNS:
        log_error(False, "runs_folder_not_found_error", [flowcell])
    else:
        log_error(len(paths) <= 1, "multiple_runs_folder_found_warning",
                  [paths, flowcell])
        fc_runs_dir = paths[0].split(
            '/')[-1] if len(paths) != 0 else RUNS[flowcell]['runs_dir']
        project_rows, i5_rows, i7_rows, sequencer_rows, flowcell_rows, pool_rows, submission_rows, sample_rows = integrity_check(
            fc_runs_dir, flowcell)

    if app_logger.has_error():
        app_logger.error(f"error occured while parsing flowcell {flowcell}")
        app_logger.reset_error()
        return 1
    execution_logger.info(f"no error occured for flowcell {flowcell}")

    try:
        cursor.execute("BEGIN;")
        for table in SCHEMA:
            insert_query, insert_data = construct_insert_query(
                table, eval(f"{table}_rows"))
            if len(insert_query) != 0:
                execution_logger.info(
                    f"query {insert_query} to be executed with data {insert_data}")
                extras.execute_values(cursor, insert_query, insert_data)

        conn.commit()
        execution_logger.info("Transaction committed successfully!")
    except Exception as e:
        conn.rollback()
        execution_logger.error(f"Transaction rolled back due to error: {e}")
    return 0


def main():
    all_flowcells = []
    subdirectories = list_nested_paths(fcqc_directory, "", "", isfile=False)
    for dir in subdirectories:
        dir_name = dir.split("/")[-1]
        if len(dir_name) == 9:
            html_files = list_nested_paths(dir, "", '.html', isfile=True)
            if len(html_files) == 0:
                log_error(False, "no_html_found_error", [dir])
                continue
            if os.path.join(dir, f"{dir_name}.html") not in html_files:
                log_error(False, "html_not_found_error", [dir, html_files])
                continue
            if len(html_files) > 1:
                log_error(False, "multiple_html_found_warning",
                          [dir, html_files])
            all_flowcells.append(dir_name)
        elif len(dir_name.split('_')[0]) == 9:
            log_error(False, "suspicious_directory_warning", [dir])
    data = fetch(cursor, "SELECT flowcell_id FROM flowcell;", "all")
    demultiplexed_flowcells = set()
    for row in data:
        demultiplexed_flowcells.add(row[0])
    new_flowcells = [
        flowcell for flowcell in all_flowcells if flowcell not in demultiplexed_flowcells]
    print("demultiplexed", demultiplexed_flowcells)

    for flowcell in new_flowcells:
        store(flowcell)

    return 0


main()
cursor.close()
conn.close()


# "tool": {
# 					"type": "VARCHAR(16)",
# 					"not_null": true,
# 					"filter_option": true,
# 					"view": true,
# 					"alias": "Tool",
# 					"group": 2
# 				},
