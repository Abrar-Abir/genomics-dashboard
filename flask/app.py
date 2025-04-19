from library import connect_to_postgres, fetch, get_database_info, parse_date, jsonify
from flask import Flask, request, send_file, render_template
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, JWTManager
from datetime import datetime, date, timedelta
import psycopg2
import json
import os
import io
import csv
import pygwalker as pyg
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:mypassword@localhost/auth'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'supersecretkey'
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=6)

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

dir = os.getcwd()
parent = os.path.dirname(dir)
table, host, user, password, port = get_database_info()
conn, cursor = connect_to_postgres(table, host, user, password, port)
conn.autocommit = True


with open(os.path.join(parent, "schema.json"), "r") as f:
	schema = json.load(f)["table"]

all_columns = []
for table in schema:
	all_columns += [(table, column, schema[table]["entity"][column]["alias"]) for column in schema[table]["entity"]]
columns_sorted = [col[0] + '.' + col[1]
				 for col in sorted(all_columns, key=lambda x: x[2])]
alias_clause = ', '.join([col[0] + '.' + col[1] + ' AS ' + '"' + col[2] + '"'
				 for col in sorted(all_columns, key=lambda x: x[2])])

datatype_columns = ['WGS', 'DNAPREP-30N', 'WES200', 'LEX8', 'mRNA', 'totRNA-50', 'totRNAGlob-50', '10XscRNA', 'NXTRA', 'sRNA8M', 'mRNA-40']

# def stringify(obj):
# 	if isinstance(obj, (date, datetime)):
# 		return obj.isoformat()
# 	if isinstance(obj, list) and len(obj) > 0:
# 		return [stringify(obj[0])] + stringify(obj[1:])
# 	return obj 

def get_id(element):
	try:
		return columns_sorted.index(element)
	except:
		return -1

@app.route('/login', methods=['POST'])
def login():
	data = request.get_json()
	user = User.query.filter_by(username=data['username']).first()
	# if user and bcrypt.check_password_hash(user.password, data['password']):
	if user and user.password == data['password']:    
		access_token = create_access_token(identity=user.id)
		return jsonify({'token': access_token, 'redirect_url': '/dashboard'}), 200

	return jsonify({'message': 'Invalid credentials'}), 401

######## table page #######################################

def get_table_filter(request):
	table_filter = {}
	for key, value in request.items():
		if key not in ('page', 'limit', 'sort'):
			if key[0] == '-': # search
				column = columns_sorted[int(key[1:])]
				values = value.split(',')
				filter_str = str([value.replace('"', '') for value in values])
				table_filter['search'] = f" {column} IN ({str(filter_str[1:-1])})"
			else:
				if key[-1] == '>' or key[-1] == '<': # range
					column = columns_sorted[int(key[:-1])]
					if 'date' in column:
						table_filter[key] = f" {column} {key[-1]}= '{value}'"
					else:
						table_filter[key] = f" {column} {key[-1]}= {value}"
				else: # select
					table_filter['last'] = key
					column = columns_sorted[int(key)]
					filter_str = str(tuple([val.replace('"', '') for val in value]))
					table_filter[key] = f" {column} IN ({filter_str})"
	return table_filter


def get_order_clause(sort_list):
	if len(sort_list) == 0:
		return ""
	order_clause = 'ORDER BY '
	for id in sort_list:
		col = columns_sorted[abs(int(id))]
		order = 'DESC' if id > 0 else 'ASC'
		order_clause += f" {col} {order},"
	return order_clause[:-1]


def get_where_clause(filter_dict, filter_key=None):
	if len(filter_dict) == 0:
		return ""
	where_clause = "WHERE"
	for key in filter_dict:
		if key != filter_key and key != 'last':
			where_clause += filter_dict[key] + " AND "
	return where_clause[:-5]

@ app.route('/table')
@jwt_required()
def table():
	query = request.get_json()
	page = int(query.get('page', 1))
	limit = int(query.get('limit', 25))
	cols_to_sort = [int(id)  for id in query.get('sort', []) if len(id) > 0]
	
	order_clause = get_order_clause(cols_to_sort)
	table_filter = get_table_filter(query)
	where_clause = get_where_clause(table_filter)
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
		LIMIT {limit} OFFSET {(page - 1) * limit};
	"""
	results = fetch(cursor, data_query, 'all')
	return jsonify({"table": results, "count": count})

@ app.route('/export/table/<format>')
@jwt_required()
def export_table(format):
	query = request.get_json()
	cols_to_sort = [int(id)  for id in query.get('sort', []) if len(id) > 0]
	order_clause = get_order_clause(cols_to_sort)
	table_filter = get_table_filter(query)
	where_clause = get_where_clause(table_filter)
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
			{order_clause}
			) result;
		"""
	fetch_result = fetch(cursor, data_query, 'all')
	if fetch_result == None or len(fetch_result) == 0 or fetch_result[0] == None or len(fetch_result[0]) == 0:
			return jsonify(None)
	results = fetch_result[0][0]
	
	if format in ('json', 'raw'):
		data = dict()
		for row in results:
			sample = row['LIMS ID']
			flowcell_id = row['Flowcell ID']
			if sample not in data:
				data[sample] = dict() 
			data[sample][flowcell_id] = {key : row[key] for key in row if key not in ('LIMS ID', 'Flowcell ID')}
			data[sample][flowcell_id]['Mean Q Score'] = data[sample][flowcell_id]['Mean Q Score'] / ((sum([data[sample][flowcell_id][f'Lane {i}'] for i in range(1,9)]))*2)
		
		
		json_file_path = "/tmp/data.json"
		with open(json_file_path, 'w') as json_file:
			json.dump(data, json_file, indent=4)

		return send_file(json_file_path,
						 mimetype='application/json',
						 as_attachment=True,
						 download_name='data.json')
		

	elif format in ('csv', 'tsv'):
	
		fieldnames = list(results[0].keys())
		df = pd.DataFrame(results, columns=fieldnames)
		df['Mean Q Score'] = df['Mean Q Score']/(sum([df[f'Lane {i}']  for i in range(1, 9)])*2)
		df['Yield Q30 (Gb)'] = df['Yield Q30 (Gb)']/10**9

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


def get_analytics(column_name, table_filter, query, fetch_arg):
	if 'last' in table_filter and column_name == columns_sorted[int(table_filter['last'])]:
		where_clause = get_where_clause(table_filter, table_filter['last'])
	else:
		where_clause = get_where_clause(table_filter)
	query_str = query.format(column_name=column_name, where_clause=where_clause)
	results = fetch(cursor, query_str, fetch_arg)
	if fetch_arg == 'one':
		return (str(results[0]), str(results[1]))
	return [(str(row[0]).replace('"', '').replace("'", "").replace("[", "").replace("]", "").replace(", ", " "), row[1]) for row in results]

@ app.route('/analytics/table')
@jwt_required()
def analytics_table():
	query = request.get_json()
	table_filter = get_table_filter(query)
	analytics_data = {}

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
	for table in schema:
		analytics_table = dict()
		for column in schema[table]["entity"]:
			if schema[table]["entity"][column]["filter"]:
				column_id = get_id(table + '.' + column)
				if "NUMERIC" in schema[table]["entity"][column]["type"] or "DATE" in schema[table]["entity"][column]["type"]:
					analytics_table[column_id] = get_analytics(
						f"{table}.{column}", table_filter, range_query, "one")
				else:
					analytics_table[column_id] = get_analytics(
						f"{table}.{column}", table_filter, count_query, "all")
		analytics_data[table] = analytics_table
	return jsonify(analytics_data)

@ app.route('/search/<id>')
@jwt_required()
def search(id):
	query = request.get_json()
	table_filter = get_table_filter(query)
	where_clause = get_where_clause(table_filter)
	# print(where_clause)
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
datatypeID = {'WGS':0, 'DNAPREP-30N':1, 'WES200':2, 'LEX8':3, 'mRNA':4, 'totRNA-50':5, 'totRNAGlob-50':6, '10XscRNA':7, 'NXTRA':8, 'sRNA8M':9, 'mRNA-40':10}

def get_datagrid_filter(request_args):
	datagrid_filter = {}
	datagrid_filter['hide'] = request_args.get('hide', default='0') == '1'
	for key in request_args.keys():
		if request_args.get(key)[0] == '[' and request_args.get(key)[-1] == ']':
			if key == 'show':
				values = request_args.get(key)[1:-1].split(',')
				filter_str = str([value.replace('"', '') for value in values])
				datagrid_filter[key] = f" project IN ({str(filter_str[1:-1])})"
			else:
				column = columns_sorted[int(key)]
				if column == 'submission.datatype':
					# ["WGS totRNA-50"] => ['WGS', 'totRNA-50']
					# ["WGS"] => ['WGS']
					# ["WGS", "totRNA-50"] 
					values = [value.replace('"', '') for value in request_args.get(key)[1:-1].split(',')]
					
					having_str = 'AND' + f""" ARRAY( SELECT UNNEST (ARRAY{request_args.get(key).replace('"', "'")}::character varying[]) ORDER BY 1) = ARRAY (
								SELECT UNNEST(ARRAY_AGG(CASE 
									WHEN datatype IN ('WGS30N', 'WGS90N') THEN 'WGS'
									WHEN datatype IN ('mRNA-20', 'mRNA-50') THEN 'mRNA'
									ELSE datatype
								END)) ORDER BY 1)"""
					datagrid_filter['having'] = having_str
					print(having_str)
				else:
					values = request_args.get(key)[1:-1].split(',')
					filter_str = str([value.replace('"', '') for value in values])
					datagrid_filter[column] = f" {column} IN ({str(filter_str[1:-1])})"
	
	return datagrid_filter

@ app.route('/analytics/datagrid')
@jwt_required()
def analytics_datagrid():
	analytics_data = {"project": dict(), "submission": dict()}
	datagrid_filter = get_datagrid_filter(request.args)
	hide = datagrid_filter.get('hide', False)
	having_clause = datagrid_filter.get('having', '')
	pi_query = f"""
	SELECT pi, SUM(SUBRESULT.frequency) AS total
	FROM (	
		SELECT
		pi, sample_name, 
		ARRAY_AGG(
			CASE 
				WHEN datatype IN ('WGS30N', 'WGS90N') THEN 'WGS'
				WHEN datatype IN ('mRNA-20', 'mRNA-50') THEN 'mRNA'
				ELSE datatype
			END) AS datatype,
		COUNT(*) AS frequency
		FROM sample
		LEFT JOIN submission ON sample.submission_id = submission.submission_id
		LEFT JOIN project ON submission.project_id = project.project_id
		{get_where_clause({'project.project' : datagrid_filter['project.project']} if 'project.project' in datagrid_filter else {})}
		GROUP BY sample_name, pi """ + (hide or len(having_clause) != 0)*"""HAVING """ + (hide)*"""COUNT(*) > 1 """ + (len(having_clause) != 0 and hide)*""" AND """ +  f"""{having_clause[3:]}""" + f""") AS SUBRESULT GROUP BY pi  ORDER BY total DESC;"""
	# print(pi_query)
	analytics_data['project'][str(get_id("project.pi"))] = get_analytics('', dict(), pi_query, "all")

	project_query = f"""
	SELECT project, SUM(OUTR.frequency) AS total
	FROM (	
		SELECT
		pi, sample_name, 
		ARRAY_AGG(
			CASE 
				WHEN datatype IN ('WGS30N', 'WGS90N') THEN 'WGS'
				WHEN datatype IN ('mRNA-20', 'mRNA-50') THEN 'mRNA'
				ELSE datatype
			END) AS datatype,
		COUNT(*)
		FROM sample
		LEFT JOIN submission ON sample.submission_id = submission.submission_id
		LEFT JOIN project ON submission.project_id = project.project_id
		{get_where_clause({'project.pi' : datagrid_filter['project.pi']} if 'project.pi' in datagrid_filter else {})}
		GROUP BY sample_name, pi """ + (hide or len(having_clause) != 0)*"""HAVING """ + (hide)*"""COUNT(*) > 1 """ + (len(having_clause) != 0 and hide)*""" AND """ +  f"""{having_clause[3:]}""" + f""") INNR
		LEFT JOIN
		(SELECT project, sample_name, COUNT(*) AS frequency
		FROM sample
		LEFT JOIN submission ON sample.submission_id = submission.submission_id
		LEFT JOIN project ON submission.project_id = project.project_id
		GROUP BY sample_name, project) OUTR
		ON INNR.sample_name = OUTR.sample_name
		GROUP BY project  ORDER BY total DESC;"""
	
	analytics_data['project'][str(get_id('project.project'))] = get_analytics('', dict(), project_query, "all")

	datatype_query = f"""
	SELECT datatype, SUM(SUBRESULT.frequency) AS total
	FROM (	
		SELECT
		ARRAY (
			SELECT UNNEST(ARRAY_AGG(CASE 
				WHEN datatype IN ('WGS30N', 'WGS90N') THEN 'WGS'
				WHEN datatype IN ('mRNA-20', 'mRNA-50') THEN 'mRNA'
				ELSE datatype
			END)) ORDER BY 1) AS datatype, 
		sample_name, pi, COUNT(*) AS frequency
		FROM sample
		LEFT JOIN submission ON sample.submission_id = submission.submission_id
		LEFT JOIN project ON submission.project_id = project.project_id
		{get_where_clause({k : datagrid_filter[k] for k in datagrid_filter if k.startswith('project')})}
		GROUP BY sample_name, pi """ + (hide)*"""HAVING COUNT(*) > 1 """ + f""") AS SUBRESULT GROUP BY datatype ORDER BY total DESC;"""
	
	analytics_data['submission'][str(get_id('submission.datatype'))] = get_analytics('', dict(), datatype_query, "all")
	return jsonify(analytics_data)


@ app.route('/datagrid')
@jwt_required()
def datagrid():
	# global datatypeID, datatype_columns
	datagrid_filter = get_datagrid_filter(request.args)
	# set_datagrid_filter(request.args)
	# print(datagrid_filter)
	where_clause = get_where_clause({k : datagrid_filter[k] for k in datagrid_filter if k in ('project.pi', 'project.project')})
	having_clause = datagrid_filter.get('having', '')
	hide = datagrid_filter['hide']

	if 'show' in datagrid_filter:
		show_clause = f"""WHERE {datagrid_filter['show']}"""
		if len(where_clause) != 0:
			show_clause += f""" AND {where_clause[5:]}"""
		show_query = f"""
		  UNION ALL
		  SELECT
			sample_name,
			pi,
			ARRAY_AGG(project) AS project,
			ARRAY_AGG(
				CASE 
				WHEN datatype IN ('WGS30N', 'WGS90N') THEN 'WGS'
				WHEN datatype IN ('mRNA-20', 'mRNA-50') THEN 'mRNA'
				ELSE datatype
				END
			) AS datatype,
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
			COUNT(*) = 1 {having_clause}"""
	else:
		show_query = ''

	if hide or ',' in request.args.get('submission.datatype', ''):
		hide_query = ''
	else:
		hide_query = f"""UNION ALL
		  SELECT 'null' AS sample_name, pi, project, datatype, COUNT(*) AS count, 1 AS category
			FROM (
				SELECT 
					ARRAY_AGG(project) AS project,
					ARRAY_AGG(
						CASE 
						WHEN datatype IN ('WGS30N', 'WGS90N') THEN 'WGS'
						WHEN datatype IN ('mRNA-20', 'mRNA-50') THEN 'mRNA'
						ELSE datatype
						END
					) AS datatype,
					pi, 
					sample_name
				FROM sample
					LEFT JOIN submission ON sample.submission_id = submission.submission_id
					LEFT JOIN project ON submission.project_id = project.project_id
				{where_clause}
				GROUP BY pi, sample_name
				HAVING COUNT(*) = 1 {having_clause}
			) AS single_row_samples
			GROUP BY pi, project, datatype
			{show_query}"""


	query = f"""
		SELECT JSON_AGG(result)
		FROM (
		  SELECT
		  	sample_name,
			pi,
			ARRAY_AGG(project) AS project,
			ARRAY_AGG(
				CASE 
				WHEN datatype IN ('WGS30N', 'WGS90N') THEN 'WGS'
				WHEN datatype IN ('mRNA-20', 'mRNA-50') THEN 'mRNA'
				ELSE datatype
				END
			) AS datatype,
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
			COUNT(*) > 1 {having_clause}
		  {hide_query}
		  
		  ORDER BY
		  	category DESC
		  )
		result;""" 

	fetch_result = fetch(cursor, query, 'all')
	if fetch_result == None or len(fetch_result) == 0 or fetch_result[0] == None or len(fetch_result[0]) == 0:
		results = None
	else:
		results = fetch_result[0][0]
	if results == None:
		return jsonify({"data": None, 'columns': ['Entity'] + datatype_columns + ['count']})

	output = dict()
	for row in results:
		pi = row['pi']
		projects = row['project']
		sample = row['sample_name']
		if pi not in output:
			output[pi] = {"header": [0]*(len(datatype_columns)+1), "projects": dict()}
		for i in range(len(projects)):
			project = projects[i]
			datatype = datatypeID[row['datatype'][i]]
			if project not in output[pi]["projects"]:
				output[pi]["projects"][project] = {"header": [0]*(len(datatype_columns)+1), "samples":[]}
			if len(output[pi]["projects"][project]['samples']) == 0 or sample != output[pi]["projects"][project]['samples'][-1]['Entity']:
				sample_row = [0]*(len(datatype_columns)+1)
				output[pi]["projects"][project]['samples'].append({'Entity': sample})
			else:
				sample_row = output[pi]["projects"][project]['samples'][-1]['row']


			increment = row['count'] if sample == "null" else 1
			sample_row[datatype] += increment
		
			output[pi]["projects"][project]['samples'][-1]['row'] = sample_row
		
			if sample == "null" or len(projects) > 1:
				output[pi]['header'][datatype] += increment
				output[pi]['projects'][project]['header'][datatype] += increment

				if len(projects) > 1:
					other_projects = set([other_project for other_project in projects if other_project != project])
					if len(other_projects) > 0:
						output[pi]["projects"][project]['samples'][-1]['other'] = tuple(other_projects)
	
			
	
	return jsonify({"grid": output, 'headers': ['Entity'] + datatype_columns + ['Count']})

@ app.route('/export/datagrid/<format>')
@jwt_required()
def export_datagrid(format):
	# global datatypeID, datatype_columns
	datagrid_filter = get_datagrid_filter(request.args)
	where_clause = get_where_clause({k : datagrid_filter[k] for k in datagrid_filter if k in ('project.pi', 'project.project')})
	having_clause = datagrid_filter.get('having', '')
	hide = datagrid_filter.get('hide', False)

	if 'show' in datagrid_filter and hide == False:
		show_clause = f"""WHERE {datagrid_filter['show']}"""
		if len(where_clause) != 0:
			show_clause += f""" AND {where_clause[5:]}"""
		show_query = f"""
		  UNION ALL
		  SELECT
			sample_name,
			pi,
			ARRAY_AGG(project) AS project,
			ARRAY_AGG(
				CASE 
				WHEN datatype IN ('WGS30N', 'WGS90N') THEN 'WGS'
				WHEN datatype IN ('mRNA-20', 'mRNA-50') THEN 'mRNA'
				ELSE datatype
				END
			) AS datatype,
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
			COUNT(*) = 1 {having_clause}"""
	else:
		show_query = ''

	query = f"""
		SELECT JSON_AGG(result)
		FROM (
		  SELECT
		  	sample_name,
			pi,
			ARRAY_AGG(project) AS project,
			ARRAY_AGG(
				CASE 
				WHEN datatype IN ('WGS30N', 'WGS90N') THEN 'WGS'
				WHEN datatype IN ('mRNA-20', 'mRNA-50') THEN 'mRNA'
				ELSE datatype
				END
			) AS datatype,
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
			COUNT(*) > 1 {having_clause}
		  {show_query}
		  
		  ORDER BY
		  	category DESC
		  )
		result;""" 

	fetch_result = fetch(cursor, query, 'all')
	if fetch_result == None or len(fetch_result) == 0 or fetch_result[0] == None or len(fetch_result[0]) == 0:
		return jsonify({"data": None})
	else:
		results = fetch_result[0][0]

	output = dict()
	for row in results:
		pi = row['pi']
		projects = row['project']
		sample = row['sample_name']
		if pi not in output:
			output[pi] = dict()
		for i in range(len(projects)):
			project = projects[i]
			datatype = row['datatype'][i]
			if project not in output[pi]:
				output[pi][project] = dict()
			if len(output[pi][project]) == 0 or sample not in output[pi][project]:
				sample_dict = {col : 0 for col in datatype_columns}
				output[pi][project][sample] = sample_dict
			
			output[pi][project][sample][datatype] += 1	
	if format == 'json':	
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
					output_list.append([pi, project, sample] + [output[pi][project][sample][col] for col in datatype_columns])
		
		df = pd.DataFrame(output_list, columns=['PI', 'SDR No.', 'Sample Name'] + datatype_columns)

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
@jwt_required()
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
@jwt_required()
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
	output = dict()
	for dct in results:
		if dct['pi'] not in output:
			output[dct['pi']] = {"pi": dct["pi"], "total" : 0}

		output[dct['pi']][dct['status']] = dct['sample_count']
		output[dct['pi']]['total'] +=  dct['sample_count']
		status_set.add(dct['status'])

	return jsonify({'legends': list(status_set), 'chart': sorted(output.values(), key = lambda x : x["total"], reverse = True )})


@ app.route('/project-bar/<date>/<no_qgp>')
@jwt_required()
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
@jwt_required()
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
	output = dict()
	for dct in results:
		if dct['pi'] not in output:
			output[dct['pi']] = dict()
		if dct['project'] not in output[dct['pi']]:
			output[dct['pi']][dct['project']] = dict()

		output[dct['pi']][dct['project']][dct['genome']] = dct['sample_count']
		rg.add(dct['genome'])
	return jsonify({'legends': list(rg), 'chart': output})


@ app.route('/fctype-donut/<date>/<no_qgp>')
@jwt_required()
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
@jwt_required()
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
@jwt_required()
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
@jwt_required()
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
@jwt_required()
def plot():
	query = request.get_json()
	table_filter = get_table_filter(query)
	where_clause = get_where_clause(table_filter)
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
# embed datatable inside datagrid
#  caching front end
# use Pagestate & updatestate
