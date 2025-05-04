from library import connect_to_postgres, fetch, get_database_info, parse_date, jsonify
from flask import Flask, request, send_file
from flask_cors import CORS
from datetime import datetime, date, timedelta
import psycopg2
import json
import os
import io
import csv
import pygwalker as pyg
import pandas as pd
import numpy as np
from collections import defaultdict, Counter
import requests
from functools import wraps

app = Flask(__name__)
CORS(app)

with open("active_config.json", 'r') as f:
	info = json.load(f)
	
LOGIN_API, VALIDATION_API, CLIENT_ID = info["login"], info["validate"], info["client"]

dir = os.getcwd()
parent = os.path.dirname(dir)
table, host, user, password, port = get_database_info()
conn, cursor = connect_to_postgres(table, host, user, password, port)
conn.autocommit = True


with open(os.path.join(parent, "schema.json"), "r") as f:
	schema = json.load(f)
	tables = schema["table"]
	grid_cols = schema["grid"]

all_columns = []
for table in tables:
	all_columns += [(table, column, tables[table]["entity"][column]["alias"]) for column in tables[table]["entity"]]
columns_sorted = [col[0] + '.' + col[1]
				 for col in sorted(all_columns, key=lambda x: x[2])]
alias_clause = ', '.join([col[0] + '.' + col[1] + ' AS ' + '"' + col[2] + '"'
				 for col in sorted(all_columns, key=lambda x: x[2])])

dtype_clause = "CASE"
for col in grid_cols:
	if grid_cols[col].get("subtype", None):
		dtype_clause += f""" WHEN datatype IN ({str(grid_cols[col]["subtype"])[1:-1].replace('"', "'")}) THEN '{col}'"""
dtype_clause += " ELSE datatype END"


def _get_id(element):
	try:
		return columns_sorted.index(element)
	except:
		return -1

def validate_token():
	auth_header = request.headers.get('Authorization')
	if not auth_header or not auth_header.startswith('Bearer '):
		return None, 401, "Missing or invalid Authorization header"

	headers = {
        'X-API-Version': 'v1',
        'X-Protocol': '50',
        'X-Project': '416',
        'Authorization': auth_header
    }
	try:
		response = requests.get(VALIDATION_API, headers=headers, verify = "sidra.crt")
		response.raise_for_status()
		return response.json(), 200, None
	except requests.exceptions.RequestException as e:
		return None, 500, f"Token validation failed: {str(e)}"

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        validation_data, status_code, error_message = validate_token()

        if validation_data:
            return f(*args, **kwargs)
        else:
            return jsonify({'error': error_message}), status_code
    return decorated


@app.route('/login', methods=['POST'])
def login():
	data = request.get_json()
	try:
		response = requests.post(LOGIN_API, data={'username': data['username'], 'password': data['password'], 'clientId': CLIENT_ID}, verify = "sidra.crt")
		return jsonify(response.json()), 200
	except requests.exceptions.RequestException as e:
		return jsonify({'error': f'Login failed: {str(e)}'}), 500

######## table page #######################################

def _table_filter(request):
	table_filter = {}
	for key, value in request.items():
		if key not in ('page', 'limit', 'sort'):
			if key[0] == '-':
				column = columns_sorted[int(key[1:])]
				values = value.split(',')
				filter_str = str([value.replace('"', '') for value in values])
				table_filter['search'] = f" {column} IN ({str(filter_str[1:-1])})"
			else:
				if key[-1] == '>' or key[-1] == '<':
					column = columns_sorted[int(key[:-1])]
					if 'date' in column:
						table_filter[key] = f" {column} {key[-1]}= '{value}'"
					else:
						table_filter[key] = f" {column} {key[-1]}= {value}"
				else:
					table_filter['last'] = key
					column = columns_sorted[int(key)]
					filter_str = str([val.replace('"', '') for val in value])
					table_filter[key] = f" {column} IN ({filter_str[1:-1]})"
	return table_filter


def _order_clause(sort_list):
	if len(sort_list) == 0:
		return ""
	order_clause = 'ORDER BY '
	for id in sort_list:
		col = columns_sorted[abs(int(id))]
		order = 'DESC' if id > 0 else 'ASC'
		order_clause += f" {col} {order},"
	return order_clause[:-1]


def _where_clause(filter_dict, filter_key=None):
	if len(filter_dict) == 0:
		return ""
	where_clause = "WHERE"
	for key in filter_dict:
		if key != filter_key and key != 'last':
			where_clause += filter_dict[key] + " AND "
	return where_clause[:-5]


def _fetch_table(is_table, args):
	print(list(args.items()))
	params = {k: json.loads(v) if v.startswith('[') or v.startswith('{') else v
              for k, v in args.items()}
	cols_to_sort = [int(id) for id in params.get('sort', [])]
	order_clause = _order_clause(cols_to_sort)
	table_filter = _table_filter(params)
	where_clause = _where_clause(table_filter)
	print(where_clause)
	if is_table:
		count_query = f"""
            SELECT COUNT(*)
            FROM sample
            LEFT JOIN pool ON sample.pool_id = pool.pool_id
            LEFT JOIN flowcell ON sample.flowcell_id = flowcell.flowcell_id
            LEFT JOIN submission ON sample.submission_id = submission.submission_id
            LEFT JOIN project ON submission.project_id = project.project_id
            LEFT JOIN i5 ON sample.i5_id = i5.i5_id
            LEFT JOIN i7 ON sample.i7_id = i7.i7_id
            LEFT JOIN sequencer ON flowcell.sequencer_id = sequencer.sequencer_id
            {where_clause}
        """
		count = fetch(cursor, count_query, 'one')[0]
	else:
		count = None

	page = int(params.get('page', 1))
	limit = int(params.get('limit', 25))	
	data_query = f"""
            SELECT {alias_clause}
            FROM sample
            LEFT JOIN pool ON sample.pool_id = pool.pool_id
            LEFT JOIN flowcell ON sample.flowcell_id = flowcell.flowcell_id
            LEFT JOIN submission ON sample.submission_id = submission.submission_id
            LEFT JOIN project ON submission.project_id = project.project_id
            LEFT JOIN i5 ON sample.i5_id = i5.i5_id
            LEFT JOIN i7 ON sample.i7_id = i7.i7_id
            LEFT JOIN sequencer ON flowcell.sequencer_id = sequencer.sequencer_id
            {where_clause}
            {order_clause}
			{is_table* f"LIMIT {limit} OFFSET {(page - 1) * limit}"}
        """

	if is_table:
		results = fetch(cursor, data_query, 'all')
		return results, count

	fetch_result = fetch(cursor, f"SELECT JSON_AGG (result) FROM ({data_query}) result;", 'all')
	if fetch_result and fetch_result[0] and fetch_result[0][0]:
		results = fetch_result[0][0]
		return results, count
	return [], None


@app.route('/table')
@token_required
def table():
    results, count = _fetch_table(True, request.args)
    if results is None:
        return jsonify({"error": "Failed to retrieve table data"}), 500
    return jsonify({"table": results, "count": count})

@app.route('/export/table/<format>')
@token_required
def export_table(format):
    results, _ = _fetch_table(False, request.args)
    if results is None:
        return jsonify({"error": "Failed to retrieve export data"}), 500
    
    if format in ('json', 'raw'):
        data = {}
        for row in results:
            sample = row['LIMS ID']
            flowcell_id = row['Flowcell ID']
            if sample not in data:
                data[sample] = {}
            data[sample][flowcell_id] = {key: row[key] for key in row if key not in ('LIMS ID', 'Flowcell ID')}
            if 'Mean Q Score' in data[sample][flowcell_id]:
                lane_sums = sum([data[sample][flowcell_id].get(f'Lane {i}', 0) for i in range(1, 9)])
                data[sample][flowcell_id]['Mean Q Score'] = data[sample][flowcell_id]['Mean Q Score'] / (lane_sums * 2) if lane_sums else 0

        json_buffer = io.StringIO()
        json.dump(data, json_buffer, indent=4)
        json_buffer.seek(0)
        return send_file(io.BytesIO(json_buffer.getvalue().encode('utf-8')),
                         mimetype='application/json',
                         as_attachment=True,
                         download_name='data.json')

    elif format in ('csv', 'tsv'):
        fieldnames = list(results[0].keys())
        df = pd.DataFrame(results, columns=fieldnames)
        if 'Mean Q Score' in df:
            df['Mean Q Score'] = df['Mean Q Score'] / (sum([df[f'Lane {i}'] for i in range(1, 9)]) * 2)
        if 'Yield Q30 (Gb)' in df:
            df['Yield Q30 (Gb)'] = df['Yield Q30 (Gb)'] / 10**9

        if format == 'csv':
            csv_buffer = io.StringIO()
            df.to_csv(csv_buffer, index=False)
            csv_buffer.seek(0)
            return send_file(io.BytesIO(csv_buffer.getvalue().encode()),
                            mimetype='text/csv',
                            as_attachment=True,
                            download_name='data.csv')

        elif format == 'tsv':
            tsv_buffer = io.StringIO()
            df.to_csv(tsv_buffer, sep='\t', index=False)
            tsv_buffer.seek(0)
            return send_file(io.BytesIO(tsv_buffer.getvalue().encode()),
                            mimetype='text/tab-separated-values',
                            as_attachment=True,
                            download_name='data.tsv')

    return 'Invalid format', 400

def _analytics(column_name, table_filter, query, fetch_arg):
	if 'last' in table_filter and column_name == columns_sorted[int(table_filter['last'])]:
		where_clause = _where_clause(table_filter, table_filter['last'])
	else:
		where_clause = _where_clause(table_filter)
	query_str = query.format(column_name=column_name, where_clause=where_clause)
	results = fetch(cursor, query_str, fetch_arg)
	if fetch_arg == 'one':
		return (str(results[0]), str(results[1]))
	return [(str(row[0]).replace('"', '').replace("'", "").replace("[", "").replace("]", "").replace(", ", " "), row[1]) for row in results]

@ app.route('/analytics/table')
@token_required
def analytics_table():
	params = {k: json.loads(v) if v.startswith('[') or v.startswith('{') else v
          for k, v in request.args.items()}
	table_filter = _table_filter(params)
	analytics_data = defaultdict(dict)

	count_query = """
		SELECT {column_name}, COUNT(*) AS frequency
		FROM sample
		LEFT JOIN pool ON sample.pool_id = pool.pool_id
		LEFT JOIN flowcell ON sample.flowcell_id = flowcell.flowcell_id
		LEFT JOIN submission ON sample.submission_id = submission.submission_id
		LEFT JOIN project ON submission.project_id = project.project_id
		LEFT JOIN i5 ON sample.i5_id = i5.i5_id
		LEFT JOIN i7 ON sample.i7_id = i7.i7_id
		LEFT JOIN sequencer ON flowcell.sequencer_id = sequencer.sequencer_id
		{where_clause}
		GROUP BY {column_name}
		ORDER BY frequency DESC
	"""
	range_query = """
		SELECT MIN({column_name}), MAX({column_name})
		FROM sample
		LEFT JOIN pool ON sample.pool_id = pool.pool_id
		LEFT JOIN flowcell ON sample.flowcell_id = flowcell.flowcell_id
		LEFT JOIN submission ON sample.submission_id = submission.submission_id
		LEFT JOIN project ON submission.project_id = project.project_id
		LEFT JOIN i5 ON sample.i5_id = i5.i5_id
		LEFT JOIN i7 ON sample.i7_id = i7.i7_id
		LEFT JOIN sequencer ON flowcell.sequencer_id = sequencer.sequencer_id
		{where_clause}
	"""
	for table in tables:
		for column in tables[table]["entity"]:
			if tables[table]["entity"][column]["filter"]:
				column_id = _get_id(table + '.' + column)
				if "NUMERIC" in tables[table]["entity"][column]["type"] or "DATE" in tables[table]["entity"][column]["type"]:
					analytics_col = _analytics(
						f"{table}.{column}", table_filter, range_query, "all")[0]
				else:
					analytics_col = _analytics(
						f"{table}.{column}", table_filter, count_query, "all")
				analytics_data[table][column_id] = analytics_col
	return jsonify(analytics_data)

@ app.route('/search/<id>')
@token_required
def search(id):
	params = {k: json.loads(v) if v.startswith('[') or v.startswith('{') else v
          for k, v in request.args.items()}
	table_filter = _table_filter(params)
	where_clause = _where_clause(table_filter)
	query = f"""
		SELECT DISTINCT {columns_sorted[int(id)]}
		FROM sample
		LEFT JOIN pool ON sample.pool_id = pool.pool_id
		LEFT JOIN flowcell ON sample.flowcell_id = flowcell.flowcell_id
		LEFT JOIN submission ON sample.submission_id = submission.submission_id
		LEFT JOIN project ON submission.project_id = project.project_id
		LEFT JOIN i5 ON sample.i5_id = i5.i5_id
		LEFT JOIN i7 ON sample.i7_id = i7.i7_id
		LEFT JOIN sequencer ON flowcell.sequencer_id = sequencer.sequencer_id
		{where_clause}
	"""
	results = fetch(cursor, query, 'all')
	return jsonify(sorted([row[0] for row in results]))


# ################ Datagrid Page #####################


def _grid_filter(request):
	grid_filter = {}

	for key in request:
		if key == 'hide':
			grid_filter['hide'] = request['hide'] == '1'
		elif key == 'show':
			filter_str = str([value.replace('"', '') for value in request[key]])[1:-1]
			grid_filter[key] = f" project IN ({filter_str})"
		else:
			column = columns_sorted[int(key)]
			if column == 'submission.datatype':
				having_str = 'AND'
				for value in request[key]:
					filter_str = str([val.replace('"', '') for val in value.split(' ')])
					having_str += f""" ARRAY( SELECT UNNEST (ARRAY{filter_str}::character varying[]) ORDER BY 1) = ARRAY (
							SELECT UNNEST(ARRAY_AGG({dtype_clause})) ORDER BY 1) OR """
				grid_filter['having'] = having_str[:-4]
			else:
				filter_str = str([value.replace('"', '') for value in request[key]])[1:-1]
				grid_filter[column] = f" {column} IN ({filter_str})"
	
	return grid_filter

@ app.route('/analytics/grid')
@token_required
def analytics_grid():
	params = {k: json.loads(v) if v.startswith('[') or v.startswith('{') else v
          for k, v in request.args.items()}
	grid_filter = _grid_filter(params)
	having_clause = grid_filter.get('having', '')
	
	analytics_data = {"project": dict(), "submission": dict()}
	
	pi_query = f"""
	SELECT pi, SUM(SUBRESULT.frequency) AS total
	FROM (	
		SELECT
		pi, sample_name, 
		ARRAY_AGG({dtype_clause}) AS datatype,
		COUNT(*) AS frequency
		FROM sample
		LEFT JOIN submission ON sample.submission_id = submission.submission_id
		LEFT JOIN project ON submission.project_id = project.project_id
		{_where_clause({'project.project' : grid_filter['project.project']} if 'project.project' in grid_filter else {})}
		GROUP BY sample_name, pi """ + (grid_filter["hide"] or len(having_clause) != 0)*"""HAVING """ + (grid_filter["hide"])*"""COUNT(DISTINCT sample.sample_id) > 1 """ + (len(having_clause) != 0 and grid_filter["hide"])*""" AND """ +  f"""{having_clause[3:]}""" + f""") AS SUBRESULT GROUP BY pi  ORDER BY total DESC;"""
	analytics_data['project'][str(_get_id("project.pi"))] = _analytics('', dict(), pi_query, "all")

	project_query = f"""
	SELECT project, SUM(OUTR.frequency) AS total
	FROM (	
		SELECT
		pi, sample_name, 
		ARRAY_AGG({dtype_clause}) AS datatype,
		COUNT(*)
		FROM sample
		LEFT JOIN submission ON sample.submission_id = submission.submission_id
		LEFT JOIN project ON submission.project_id = project.project_id
		{_where_clause({'project.pi' : grid_filter['project.pi']} if 'project.pi' in grid_filter else {})}
		GROUP BY sample_name, pi """ + (grid_filter["hide"] or len(having_clause) != 0)*"""HAVING """ + (grid_filter["hide"])*"""COUNT(DISTINCT sample.sample_id) > 1 """ + (len(having_clause) != 0 and grid_filter["hide"])*""" AND """ +  f"""{having_clause[3:]}""" + f""") INNR
		LEFT JOIN
		(SELECT project, sample_name, COUNT(*) AS frequency
		FROM sample
		LEFT JOIN submission ON sample.submission_id = submission.submission_id
		LEFT JOIN project ON submission.project_id = project.project_id
		GROUP BY sample_name, project) OUTR
		ON INNR.sample_name = OUTR.sample_name
		GROUP BY project  ORDER BY total DESC;"""
	
	analytics_data['project'][str(_get_id('project.project'))] = _analytics('', dict(), project_query, "all")

	dtype_query = f"""
	SELECT datatype, SUM(SUBRESULT.frequency) AS total
	FROM (	
		SELECT
		ARRAY (
			SELECT UNNEST(ARRAY_AGG({dtype_clause})) ORDER BY 1) AS datatype, 
		sample_name, pi, COUNT(*) AS frequency
		FROM sample
		LEFT JOIN submission ON sample.submission_id = submission.submission_id
		LEFT JOIN project ON submission.project_id = project.project_id
		{_where_clause({k : grid_filter[k] for k in grid_filter if k.startswith('project')})}
		GROUP BY sample_name, pi """ + (grid_filter["hide"])*"""HAVING COUNT(DISTINCT sample.sample_id) > 1 """ + f""") AS SUBRESULT GROUP BY datatype ORDER BY total DESC;"""
	# print(dtype_query)
	analytics_data['submission'][str(_get_id('submission.datatype'))] = _analytics('', dict(), dtype_query, "all")
	return jsonify(analytics_data)


def _fetch_grid(args, include_hide=True):
	params = {k: json.loads(v) if v.startswith('[') or v.startswith('{') else v
          for k, v in args.items()}
	grid_filter = _grid_filter(params)
	where_clause = _where_clause({k : grid_filter[k] for k in grid_filter if k in ('project.pi', 'project.project')})
	having_clause = grid_filter.get('having', '')
	
	
	cols_query = f"""SELECT DISTINCT unnest_datatype AS datatype
					FROM (
					SELECT UNNEST(datatype) AS unnest_datatype
					FROM (
						SELECT
						sample_name,
						ARRAY_AGG({dtype_clause}) AS datatype
						FROM
						sample
						LEFT JOIN submission ON sample.submission_id = submission.submission_id
						LEFT JOIN project ON submission.project_id = project.project_id
						{where_clause}
						GROUP BY
						sample_name, project.pi
						{(grid_filter["hide"] or len(having_clause) != 0)*"HAVING " + (grid_filter["hide"])*"COUNT(DISTINCT sample.sample_id) > 1 " + (len(having_clause) != 0 and grid_filter["hide"])*" AND " +  having_clause[3:]}
					) AS nested 
					) AS unnest;"""
	cols = sorted([col[0] for col in fetch(cursor, cols_query, "all")], key= lambda x : grid_cols.get(x, {"order":100})["order"])
	show_clause = ''
	single_query = ''
	if include_hide and not grid_filter.get("hide"):
		single_query = f"""UNION ALL
		  SELECT '' AS sample_name, pi, project, datatype, COUNT(*) AS count, 1 AS category
			FROM (
				SELECT 
					ARRAY_AGG(project) AS project,
					ARRAY_AGG({dtype_clause}) AS datatype,
					pi, 
					sample_name
				FROM sample
					LEFT JOIN submission ON sample.submission_id = submission.submission_id
					LEFT JOIN project ON submission.project_id = project.project_id
				{where_clause}
				GROUP BY pi, sample_name
				HAVING COUNT(DISTINCT sample.sample_id) = 1 {having_clause}
			) AS single_row_samples
			GROUP BY pi, project, datatype"""
				
	if 'show' in grid_filter and not grid_filter.get("hide"):
		show_clause = f"""WHERE {grid_filter['show']}"""
		if where_clause:
			show_clause += f""" AND {where_clause[5:]}"""
		single_query += f"""
		UNION ALL
		SELECT
			sample_name,
			pi,
			ARRAY_AGG(project) AS project,
			ARRAY_AGG({dtype_clause}) AS datatype,
			1 AS count,
			0 AS category
		FROM
			sample
			LEFT JOIN submission ON sample.submission_id = submission.submission_id
			LEFT JOIN project ON submission.project_id = project.project_id
		{show_clause}
		GROUP BY
			sample_name, project.pi
		HAVING
			COUNT(DISTINCT sample.sample_id) = 1 {having_clause}"""

	data_query = f"""
		SELECT JSON_AGG(result)
		FROM (
		  SELECT
		  	sample_name,
			pi,
			ARRAY_AGG(project) AS project,
			ARRAY_AGG({dtype_clause}) AS datatype,
			COUNT(*) AS count,
			2 AS category
		  FROM
			sample
			LEFT JOIN submission ON sample.submission_id = submission.submission_id
			LEFT JOIN project ON submission.project_id = project.project_id
		  {where_clause}
		  GROUP BY
			sample_name, project.pi
		  HAVING
			COUNT(DISTINCT sample.sample_id) > 1 {having_clause}
		  {single_query}
		  ORDER BY
		  	category DESC
		  )
		result;"""

	data = fetch(cursor, data_query, 'all')
	if data and data[0] and data[0][0]:
		return data[0][0], cols	
	return None, None


@ app.route('/grid')
@token_required
def grid():
	results, cols = _fetch_grid(request.args, True)
	if results == None:
		return jsonify({"grid": None, 'headers': ['Entity'] + ['count']})
	grid = defaultdict(lambda : defaultdict(list))
	for row in results:
		pi = row['pi']
		projects = row['project']
		sample = row['sample_name']
		project_dtype_counts = defaultdict(Counter)
		for project, dtype in zip(row["project"], row["datatype"]):
			project_dtype_counts[project][dtype] += 1
		for project in set(projects):
			counts = project_dtype_counts[project]
			if row["category"] != 1:
				other_projects = str([other_project for other_project in projects if other_project != project])
				sample_row = [counts.get(col, 0) for col in cols]
				grid[pi][project].append([sample, sample_row, other_projects[1:-1]])
			else:
				other_projects = ""
				sample_row = [(row["datatype"][0] == col)*row["count"] for col in cols]
				if grid[pi][project] and grid[pi][project][-1][0] == "":
					prev_row = grid[pi][project][-1][1]
					grid[pi][project][-1][1] = [a+b for a,b in zip(sample_row, prev_row)]
				else:
					grid[pi][project].append([sample, sample_row, other_projects[1:-1]])
	return jsonify({"grid": grid, 'headers': ['Entity'] + cols + ['Count']})

@ app.route('/export/grid/<format>')
@token_required
def export_grid(format):
	results, cols = _fetch_grid(request.args, False)			
	if results == None:
		return jsonify({"data": None})

	output = defaultdict(lambda: defaultdict(dict))
	for row in results:
		pi = row['pi']
		projects = row['project']
		sample = row['sample_name']
		for i in range(len(projects)):
			project = projects[i]
			datatype = row['datatype'][i]
			if sample not in output[pi][project]:
				sample_dict = {col : 0 for col in cols}	
				sample_dict["count"] = row["count"]
				output[pi][project][sample] = sample_dict
			
			output[pi][project][sample][datatype] += 1

	if format in ('raw', 'json'):	
		json_buffer = io.StringIO()
		json.dump(output, json_buffer, indent=4)
		json_buffer.seek(0)
		return send_file(io.BytesIO(json_buffer.getvalue().encode('utf-8')),
						 mimetype='application/json',
						 as_attachment=True,
						 download_name='data.json')

	elif format in ('csv', 'tsv'):
		output_list = []
		for pi in output:
			for project in output[pi]:
				for sample in output[pi][project]:
					output_list.append([pi, project, sample] + [output[pi][project][sample][col] for col in cols] + [output[pi][project][sample]["count"]])
		
		df = pd.DataFrame(output_list, columns=['PI', 'SDR No.', 'Sample Name'] + cols + ["count"])

		if format == 'csv':
			csv_buffer = io.StringIO()
			df.to_csv(csv_buffer, index=False)
			csv_buffer.seek(0)
			return send_file(io.BytesIO(csv_buffer.getvalue().encode()),
								mimetype='text/csv',
								as_attachment=True,
								download_name='data.csv')

		else:
			tsv_buffer = io.StringIO()
			df.to_csv(tsv_buffer, sep='\t', index=False)
			tsv_buffer.seek(0)
			return send_file(io.BytesIO(tsv_buffer.getvalue().encode()),
								mimetype='text/tab-separated-values',
								as_attachment=True,
								download_name='data.tsv')

	return 'Invalid format', 400
	


####### overview page ##################################################

@ app.route('/progress-area/<date>/<no_qgp>')
@token_required
def progress_area(date, no_qgp):
	try:
		start, end = parse_date(date)
	except:
		return jsonify("format should be 'yyyymmdd-yyyymmdd'")
	query = f"""
			SELECT JSON_AGG(result)
			FROM (
				SELECT
					TO_CHAR(demultiplex_date, 'DD-MM-YYYY') AS date,
					COUNT(DISTINCT sample.sample_id) AS "Samples",
					COUNT(DISTINCT sample.flowcell_id) AS "Flowcells",
					SUM(COUNT(DISTINCT sample.sample_id)) OVER (ORDER BY demultiplex_date) AS "SamplesTotal",
					SUM(COUNT(DISTINCT sample.flowcell_id)) OVER (ORDER BY demultiplex_date) AS "FlowcellsTotal"
				FROM
					flowcell
				INNER JOIN
					sample ON flowcell.flowcell_id = sample.flowcell_id
				{(no_qgp == 'true')* "LEFT JOIN submission ON submission.submission_id = sample.submission_id LEFT JOIN project ON project.project_id = submission.project_id"}
				WHERE
					demultiplex_date BETWEEN '{start.strftime('%Y-%m-%d')}' AND '{end.strftime('%Y-%m-%d')}' {(no_qgp == 'true') * " AND project.pi != 'QGP'"}
				GROUP BY
					demultiplex_date
				ORDER BY
					demultiplex_date
				)
			result;"""

	fetch_result = fetch(cursor, query, 'all')
	results = fetch_result[0][0]

	return jsonify(results)


@ app.route('/status-bar/<date>/<no_qgp>')
@token_required
def status_bar(date, no_qgp):
	try:
		start, end = parse_date(date)
	except:
		return jsonify("format should be 'yyyymmdd-yyyymmdd'")


	query = f"""
		SELECT JSON_AGG(result)
		FROM (
		  SELECT
			pi, COALESCE(NULLIF(sample.status, ''), 'N/A') as "status", COUNT(*) as "sample_count"
		  FROM
			project
		  LEFT JOIN
			submission ON project.project_id = submission.project_id
		  LEFT JOIN
			sample ON submission.submission_id = sample.submission_id
		  LEFT JOIN
			flowcell ON sample.flowcell_id = flowcell.flowcell_id
		  WHERE
			demultiplex_date BETWEEN '{start.strftime('%Y-%m-%d')}' AND '{end.strftime('%Y-%m-%d')}' {(no_qgp == 'true') * " AND project.pi != 'QGP'"}
		  GROUP BY
			pi, sample.status
		  ORDER BY
		  	COUNT(*) DESC
		  )
		result;"""

	fetch_result = fetch(cursor, query, 'all')
	if fetch_result == None or len(fetch_result) == 0 or fetch_result[0] == None or len(fetch_result[0]) == 0:
		return jsonify(None)
	
	results = fetch_result[0][0]
	status_set = set()
	output = defaultdict(lambda: {"total" : 0})
	for dct in results:
		output[dct['pi']]["pi"] = dct["pi"]
		output[dct['pi']][dct['status']] = dct['sample_count']
		output[dct['pi']]['total'] +=  dct['sample_count']
		status_set.add(dct['status'])

	return jsonify({'legends': list(status_set), 'chart': sorted(output.values(), key = lambda x : x["total"], reverse = True )})


@ app.route('/project-bar/<date>/<no_qgp>')
@token_required
def project_bar(date, no_qgp):
	try:
		start, end = parse_date(date)
	except:
		return jsonify("format should be 'yyyymmdd-yyyymmdd'")

	query = f"""
			SELECT JSON_AGG(result)
			FROM (
				SELECT
					project.pi, project.project as "project_id", COUNT(*) as quantity
				FROM
					project
				LEFT JOIN
					submission ON project.project_id = submission.project_id
				LEFT JOIN
					sample ON submission.submission_id = sample.submission_id
				LEFT JOIN
					flowcell ON sample.flowcell_id = flowcell.flowcell_id
				WHERE
					demultiplex_date BETWEEN '{start.strftime('%Y-%m-%d')}' AND '{end.strftime('%Y-%m-%d')}' {(no_qgp == 'true') * " AND project.pi != 'QGP'"}
				GROUP BY
					project.pi, project.project
				ORDER BY
					COUNT(*) DESC
				)
			result;
		"""
	fetch_result = fetch(cursor, query, 'all')
	results = fetch_result[0][0]
	
	output = []
	if results:
		for row in results:
			for dct in output:
				if row["pi"] == dct["pi"]:
					dct[row["project_id"]] = row["quantity"]
					break
			else:
				output.append(
					{"pi": row["pi"], row["project_id"]: row["quantity"]})

	return jsonify(output)


@ app.route('/refgenome-bar/<date>/<no_qgp>')
@token_required
def refgenome_bar(date, no_qgp):
	try:
		start, end = parse_date(date)
	except:
		return jsonify("format should be 'yyyymmdd-yyyymmdd'")
	query = f"""
			SELECT JSON_AGG(result)
			FROM (
				SELECT
					project.pi as "pi", project.project as "project", COALESCE(NULLIF(submission.rg, ''), 'N/A') as "genome", COUNT(*) as "sample_count"
				FROM
					project
				LEFT JOIN
					submission ON project.project_id = submission.project_id
				LEFT JOIN
					sample ON submission.submission_id = sample.submission_id
				LEFT JOIN
					flowcell ON sample.flowcell_id = flowcell.flowcell_id
				WHERE
					demultiplex_date BETWEEN '{start.strftime('%Y-%m-%d')}' AND '{end.strftime('%Y-%m-%d')}' {(no_qgp == 'true') * " AND project.pi != 'QGP'"}
				GROUP BY
					project.pi, project.project, submission.rg
				ORDER BY
					"sample_count" DESC
				)
			result;
		"""
	fetch_result = fetch(cursor, query, 'all')
	if fetch_result == None or len(fetch_result) == 0 or fetch_result[0] == None or len(fetch_result[0]) == 0 or fetch_result[0][0] == None:
		return jsonify(None)
	results = fetch_result[0][0]
	rg = set()
	output = defaultdict(lambda: defaultdict(dict))
	for dct in results:
		output[dct['pi']][dct['project']][dct['genome']] = dct['sample_count']
		rg.add(dct['genome'])
	return jsonify({'legends': list(rg), 'chart': output})


@ app.route('/fctype-donut/<date>/<no_qgp>')
@token_required
def fctype_donut(date, no_qgp):
	try:
		start, end = parse_date(date)
	except:
		return jsonify("format should be 'yyyymmdd-yyyymmdd'")

	query = f"""
			SELECT JSON_AGG(result)
			FROM (
				SELECT flowcell_type as "type", COUNT(DISTINCT flowcell.flowcell_id) AS "quantity" 
				FROM flowcell
				{(no_qgp == 'true') *"LEFT JOIN sample ON sample.flowcell_id = flowcell.flowcell_id LEFT JOIN submission ON submission.submission_id = sample.submission_id LEFT JOIN project ON project.project_id = submission.project_id"}
				WHERE demultiplex_date BETWEEN '{start.strftime('%Y-%m-%d')}' AND '{end.strftime('%Y-%m-%d')}' {(no_qgp == 'true') * " AND project.pi != 'QGP'"}
				GROUP BY flowcell_type
				ORDER BY COUNT(DISTINCT flowcell.flowcell_id) DESC
				)
			result;
			"""
	fetch_result = fetch(cursor, query, 'all')
	results = fetch_result[0][0]

	return jsonify(results)


@ app.route('/service-donut/<date>/<no_qgp>')
@token_required
def service_donut(date, no_qgp):
	try:
		start, end = parse_date(date)
	except:
		return jsonify("format should be 'yyyymmdd-yyyymmdd'")

	query = f"""
		SELECT JSON_AGG(result)
		FROM (
			SELECT COALESCE(NULLIF(srv, ''), 'N/A') as "type", COUNT(*) as "quantity"
			FROM submission
			LEFT JOIN sample ON sample.submission_id = submission.submission_id
			LEFT JOIN flowcell ON flowcell.flowcell_id = sample.flowcell_id
			{(no_qgp == 'true') * "LEFT JOIN project on project.project_id = submission.project_id"}
			WHERE demultiplex_date BETWEEN '{start.strftime('%Y-%m-%d')}' AND '{end.strftime('%Y-%m-%d')}' {(no_qgp == 'true') * " AND project.pi != 'QGP'"}
			GROUP BY srv
			ORDER BY COUNT(*) DESC
		)
		result;
	"""

	fetch_result = fetch(cursor, query, 'all')
	results = fetch_result[0][0]

	return jsonify(results)


@ app.route('/sequencer-donut/<date>/<no_qgp>')
@token_required
def sequencer_donut(date, no_qgp):
	try:
		start, end = parse_date(date)
	except:
		return jsonify("format should be 'yyyymmdd-yyyymmdd'")

	query = f"""
			SELECT JSON_AGG(result)
			FROM (
				SELECT sequencer_id as "type", COUNT(DISTINCT flowcell.flowcell_id) AS "quantity"
				FROM flowcell
				{(no_qgp == 'true') *"LEFT JOIN sample ON sample.flowcell_id = flowcell.flowcell_id LEFT JOIN submission ON submission.submission_id = sample.submission_id LEFT JOIN project ON project.project_id = submission.project_id"}
				WHERE demultiplex_date BETWEEN '{start.strftime('%Y-%m-%d')}' AND '{end.strftime('%Y-%m-%d')}' {(no_qgp == 'true') * " AND project.pi != 'QGP'"}
				GROUP BY sequencer_id
				ORDER BY COUNT(DISTINCT flowcell.flowcell_id) DESC
				)
			result;
			"""
	fetch_result = fetch(cursor, query, 'all')
	results = fetch_result[0][0]

	return jsonify(results)


@ app.route('/refgenome-donut/<date>/<no_qgp>')
@token_required
def refgenome_donut(date, no_qgp):
	try:
		start, end = parse_date(date)
	except:
		return jsonify("format should be 'yyyymmdd-yyyymmdd'")
	query = f"""
			SELECT JSON_AGG(result)
			FROM (
				SELECT COALESCE(NULLIF(rg, ''), 'N/A') as "type", COUNT(*) as "quantity"
				FROM submission
				LEFT JOIN sample ON sample.submission_id = submission.submission_id
				LEFT JOIN flowcell ON flowcell.flowcell_id = sample.flowcell_id
				{(no_qgp == 'true') * "LEFT JOIN project on project.project_id = submission.project_id"}
				WHERE demultiplex_date BETWEEN '{start.strftime('%Y-%m-%d')}' AND '{end.strftime('%Y-%m-%d')}' {(no_qgp == 'true') * " AND project.pi != 'QGP'"}
				GROUP BY rg
				)
			result; 
			"""
	fetch_result = fetch(cursor, query, 'all')
	results = fetch_result[0][0]
	return jsonify(results)


@ app.route('/plot')
@token_required
def plot():
	query = request.get_json()
	table_filter = _table_filter(query)
	where_clause = _where_clause(table_filter)
	data_query = f"""
		SELECT JSON_AGG(result)
		FROM (
			SELECT {alias_clause}
			FROM sample
			LEFT JOIN pool ON sample.pool_id = pool.pool_id
			LEFT JOIN flowcell ON sample.flowcell_id = flowcell.flowcell_id
			LEFT JOIN submission ON sample.submission_id = submission.submission_id
			LEFT JOIN project ON submission.project_id = project.project_id
			LEFT JOIN i5 ON sample.i5_id = i5.i5_id
			LEFT JOIN i7 ON sample.i7_id = i7.i7_id
			LEFT JOIN sequencer ON flowcell.sequencer_id = sequencer.sequencer_id
			{where_clause}
		) result;
	"""
	fetch_result = fetch(cursor, data_query, 'all')
	if fetch_result == None or len(fetch_result) == 0 or fetch_result[0] == None or len(fetch_result[0]) == 0:
		results = None
	else:
		results = fetch_result[0][0]
		df = pd.DataFrame(results)
		walker = pyg.walk(df, return_html=True).to_html()
		return jsonify({'html': walker})


if __name__ == '__main__':
	app.run(
		host="0.0.0.0",
		port=5001,
		debug=False)




# View columns index
# Search key & value render
# table vs datagrid sample databse_filter
# datagrid on lims id
#  number hover disable
# default N/A in dashboard
# mean_qscore handling
# state handling in app.jsx - data
#  caching front end
# use Pagestate & updatestate


# curl 'https://apitest.sidra.org/ram/login' \
#  -F 'username="aabir@smrc.sidra.org"' \
#  -F 'password=""'\
#  -F 'clientId="ngc-test-client"'
# {
# 	"token":"Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ7XCJ1c2VybmFtZVwiOlwiQUFiaXJcIixcInBlcm1pc3Npb25zXCI6W10sXCJjbGllbnRJZFwiOlwibmdjLXRlc3QtY2xpZW50XCIsXCJmaXJzdF9uYW1lXCI6XCJBYnJhciBUYXNuZWVtXCIsXCJsYXN0X25hbWVcIjpcIkFiaXJcIixcImVtYWlsXCI6XCJBQWJpckBzaWRyYS5vcmdcIixcImV4cGlyZXNfYXRcIjoxNzQ1NTcyMDU4MTQ4fSIsImlzcyI6ImxkYXAtYXV0aC1zZXJ2ZXIuaW50ZXJuYWwiLCJleHAiOjE3NDU1NzIwNTh9.A1c4nZINruxJ85BMA7qSf5q0T5O4PN4DDfyAymDsjoqPSy2NGNOaXdy5x8IVWn0cgwAJzer0@LAPTOP-BKQN3C80

# curl 'https://apitest.sidra.org/ram/validate' --header 'X-API-Version: v1' --header 'X-Protocol: 50' --header 'X-Project: 416' --header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ7XCJ1c2VybmFtZVwiOlwiQUFiaXJcIixcInBlcm1pc3Npb25zXCI6W10sXCJjbGllbnRJZFwiOlwibmdjLXRlc3QtY2xpZW50XCIsXCJmaXJzdF9uYW1lXCI6XCJBYnJhciBUYXNuZWVtXCIsXCJsYXN0X25hbWVcIjpcIkFiaXJcIixcImVtYWlsXCI6XCJBQWJpckBzaWRyYS5vcmdcIixcImV4cGlyZXNfYXRcIjoxNzQ2MDM3Mjk0OTY1fSIsImlzcyI6ImxkYXAtYXV0aC1zZXJ2ZXIuaW50ZXJuYWwiLCJleHAiOjE3NDYwMzcyOTR9.ZU107BJWi42FSS42jM1FHYvdfC7J07uDFKnp9u-Ccot8CNzlmpGqvORfmmNQMs4P2D_m_6F4pn_EoElxPGHIUA'

# {"username":"AAbir","permissions":[],"clientId":"ngc-test-client","first_name":"Abrar Tasneem","last_name":"Abir","email":"AAbir@sidra.org","expires_at":"2025-04-25T09:07:38.148+0000"}

# curl 'https://apitest.sidra.org/ram/users/sdrs' --header 'Content-Type: application/json' --header 'Authorization: Bearer XXXX' --data-raw '{"email":"dchaussabel@sidra.org"}'

