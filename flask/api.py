from library import connect_to_postgres, fetch, get_database_info
from flask import Flask, jsonify, request, send_file, render_template
from datetime import date, datetime
import psycopg2
from flask_cors import CORS
import json
import os
os.environ["PYGWALKER_SKIP_UPDATE_CHECK"] = "True"
import io
import csv
import tempfile
import zipfile
import pygwalker as pyg
import pandas as pd
import numpy as np



class CustomJSONEncoder(json.JSONEncoder):
	def default(self, obj):
		if isinstance(obj, np.bool_):
			return bool(obj)
		if isdigit(obj):
			return str(obj)
		if isinstance(obj, (date, datetime)):
			return datetime.strftime(obj, '%d-%m-%Y')
		return super().default(obj)

app = Flask(__name__)
app.json_encoder = CustomJSONEncoder
CORS(app)
dir = os.getcwd()
parent = os.path.dirname(dir)
database, host, user, password, port = get_database_info()
conn, cursor = connect_to_postgres(database, host, user, password, port)
conn.autocommit = True

database_filter = {}
datagrid_filter = {}
sortList = []

with open(os.path.join(parent, "schema.json"), "r") as f:
    schema = json.load(f)

allColumns = []
for table in schema["table"]:
    allColumns += [(table, column, schema["table"][table]["entity"][column]["alias"], schema["table"][table]["entity"][column]["order"]) for column in schema["table"][table]["entity"]]
columnsSorted = [col[0] + '.' + col[1]
                 for col in sorted(allColumns, key=lambda x: x[3])]
columnsAliased = [col[0] + '.' + col[1] + ' AS ' + '"' + col[2] + '"'
                 for col in sorted(allColumns, key=lambda x: x[3])]
alias_clause = ', '.join(columnsAliased)

datatype_columns = ['WGS', 'DNAPREP-30N', 'WES200', 'LEX8', 'mRNA', 'totRNA-50', 'totRNAGlob-50', '10XscRNA']


def isdigit(obj):
    text = str(obj).replace('.', '')
    for char in text:
        if char not in '0123456789':
            return False
    return True

def get_id(l,e):
    try:
        return l.index(e)
    except:
        return -1


def parse_date(date):
    dates = date.split("-")
    start = datetime.strptime(dates[0], '%Y%m%d').date()
    end = datetime.strptime(dates[1], '%Y%m%d').date()
    return start, end


def set_database_filter(request_args):
    global database_filter
    database_filter = {}
    for key in request_args.keys():
        if key not in ('limit', 'offset', 'search'):
            if request_args.get(key)[0] == '[' and request_args.get(key)[-1] == ']':
                values = request_args.get(key)[1:-1].split(',')
                filter_str = str([value.replace('"', '') for value in values])
                database_filter[key] = f" {key} IN ({str(filter_str[1:-1])})"
            elif key[-1] == '>' or key[-1] == '<':
                value = request_args.get(key)
                if 'date' in key:
                    database_filter[key] = f" {key}= '{value}'"
                else:
                    database_filter[key] = f" {key}= {value}"

        if 'search' in request_args.keys():
            search_key, search_value = request_args.get('search')[
                1:-1].split(',')
            assert (search_key in ['pi', 'project',
                    "submission", "flowcell", "sample"])
            if search_key in ['pi', 'project']:
                filter_key = 'project.' + search_key
            else:
                filter_key = search_key + '.' + search_key + '_id'
            database_filter['search'] = f" {filter_key} IN ('{search_value}')"

    return 0


def get_order_clause():
    global sortList
    orderString = 'ORDER BY '
    for id in sortList:
        col = columnsSorted[abs(id)]
        order = 'DESC' if id > 0 else 'ASC'
        orderString += f" {col} {order},"
    return orderString[:-1]


def get_where_clause(filter_dict, filter_key=None):
    # global filter_dict
    if len(filter_dict) == 0:
        return ""
    where_clause = "WHERE"
    for key in filter_dict:
        if key != filter_key:
            where_clause += filter_dict[key] + " AND "
    return where_clause[:-5]


# def stringify(data):
#     if isinstance(data, list):
#         return [stringify(dataItem) for dataItem in data]
#     if isinstance(data, dict):
#         return {str(key): stringify(value) for key, value in data.items()}
#     return str(data)


sortList.append(get_id(columnsSorted, 'Loading Date'))
sortList.append(get_id(columnsSorted, 'Submission ID'))
######## table page #######################################
@ app.route('/database')
def database():
    global sortList, database_filter
    limit = request.args.get('limit', default=50, type=int)
    offset = request.args.get('offset', default=0, type=int)
    col = request.args.get('sort', default=-1, type=int)
    # print(request.args, col)
    if col != -1:
        pos_id = get_id(sortList, col)
        neg_id = get_id(sortList, col * -1)
        print(pos_id, neg_id)
        if pos_id == -1 and neg_id == -1:
            sortList.append(col)
        elif neg_id == -1:
            sortList = sortList[:pos_id] + sortList[pos_id + 1:]
            sortList.append(col * -1)
        elif pos_id == -1:
            sortList = sortList[:neg_id] + sortList[neg_id + 1:]
    order_clause = get_order_clause()
    # print(sortList, order_clause)
    set_database_filter(request.args)
    where_clause = get_where_clause(database_filter)

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
    total_count = fetch(cursor, count_query, 'one')[0]

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
            LIMIT {limit} OFFSET {offset}
        ) result;
    """
    fetch_result = fetch(cursor, data_query, 'all')
    if fetch_result == None or len(fetch_result) == 0 or fetch_result[0] == None or len(fetch_result[0]) == 0:
        results = None
    else:
        results = fetch_result[0][0]

    return jsonify({"data": results, "total_count": total_count})

# @ app.route('/raw/<page>/<sample>')
# def raw(page, sample):
# 	assert(page in ('database', 'datagrid'))
# 	if page == "database":
# 		column = "sample_id"
# 	else:
# 		column = "sample_name"
# 	data_query = f"""
# 	SELECT JSON_AGG(result)
#         FROM (
# 			SELECT {alias_clause}
# 			FROM sample
# 			LEFT JOIN pool ON sample.pool_id = pool.pool_id
# 			LEFT JOIN flowcell ON sample.flowcell_id = flowcell.flowcell_id
# 			LEFT JOIN submission ON sample.submission_id = submission.submission_id
# 			LEFT JOIN project ON submission.project_id = project.project_id
# 			LEFT JOIN i5 ON sample.i5_id = i5.i5_id
# 			LEFT JOIN i7 ON sample.i7_id = i7.i7_id
# 			LEFT JOIN sequencer ON flowcell.sequencer_id = sequencer.sequencer_id
# 			WHERE sample.{column} = '{sample}'
# 			) result;
# 		"""
# 	fetch_result = fetch(cursor, data_query, 'all')
# 	if fetch_result == None or len(fetch_result) == 0 or fetch_result[0] == None or len(fetch_result[0]) == 0:
# 		results = None
# 	else:
# 		results = fetch_result[0][0]
# 	if page == 'datagrid':
# 		return jsonify(results)
# 	data = {sample : dict()}
# 	for row in results:
# 		flowcell_id = row['Flowcell ID'] 
# 		data[sample][flowcell_id] = {key : row[key] for key in row if key not in ('LIMS ID', 'Flowcell ID')}
# 		data[sample][flowcell_id]['Mean Q Score'] = data[sample][flowcell_id]['Mean Q Score'] / ((sum([data[sample][flowcell_id][f'Lane {i}'] for i in range(1,9)]))*2)
# 	return jsonify(data)


@ app.route('/export/database/<format>')
def export_database(format):
	if format == 'raw':
		key = list(request.args.keys())[0]
		value = request.args.get(key, default=None, type=str)
		where_clause = f"""WHERE sample.{key} = '{value}' """
		order_clause = ''
	else:
		global database_filter
		where_clause = get_where_clause(database_filter)
		order_clause = get_order_clause()

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

	if format in ('raw', 'json'):		
		data = dict()
		for row in results:
			sample = row['LIMS ID']
			flowcell_id = row['Flowcell ID']
			if sample not in data:
				data[sample] = dict() 
			data[sample][flowcell_id] = {key : row[key] for key in row if key not in ('LIMS ID', 'Flowcell ID')}
			data[sample][flowcell_id]['Mean Q Score'] = data[sample][flowcell_id]['Mean Q Score'] / ((sum([data[sample][flowcell_id][f'Lane {i}'] for i in range(1,9)]))*2)
		
		if format == 'raw':
			return jsonify(data)
		
		json_file_path = "/tmp/data.json"
		with open(json_file_path, 'w') as json_file:
			json.dump(data, json_file, indent=4, cls=CustomJSONEncoder)

		return send_file(json_file_path,
                         mimetype='application/json',
                         as_attachment=True,
                         download_name='data.json')
		

	elif format in ('csv', 'tsv'):
		# results = fetch(cursor, data_query, 'all')
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

	else:
		return 'Invalid format', 400

# helper function for analytics

def get_analytics(column_name, filter_dict, query, fetch_arg):
	where_clause = get_where_clause(filter_dict)
	query_str = query.format(column_name=column_name, where_clause=where_clause)
	results = fetch(cursor, query_str, fetch_arg)
	if fetch_arg == 'one':
		return (str(results[0]), str(results[1]))
	return [(str(row[0]), row[1]) for row in results]

@ app.route('/analytics/database')
def analytics_database():
	analytics_data = {}
	global database_filter
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
	for table in schema["table"]:
		for column in schema["table"][table]["entity"]:
			if schema["table"][table]["entity"][column]["filter_option"]:
				if "NUMERIC" in schema["table"][table]["entity"][column]["type"] or "DATE" in schema["table"][table]["entity"][column]["type"]:
					analytics_data[f"{table}.{column}"] = get_analytics(
                        f"{table}.{column}", database_filter, range_query, "one")
				else:
					analytics_data[f"{table}.{column}"] = get_analytics(
                        f"{table}.{column}", database_filter, count_query, "all")
	# print(analytics_data)
	return jsonify(analytics_data)

@ app.route('/search/<entity>')
def search(entity):
	global database_filter
	where_clause = get_where_clause(database_filter, 'search')
	query = f"""
        SELECT DISTINCT {entity}
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
    # print(results)
	return jsonify([row[0] for row in results])


# ################ Datagrid Page #####################
# def agg_dict(l):
# 	r = dict()
# 	for d in l:
# 		for k in d:
# 			r[k] = r.get(k, 0) + d[k]
# 	return r
datatypeID = {'WGS':0, 'DNAPREP-30N':1, 'WES200':2, 'LEX8':3, 'mRNA':4, 'totRNA-50':5, 'totRNAGlob-50':6, '10XscRNA':7}

def set_datagrid_filter(request_args):
	global datagrid_filter
	datagrid_filter = {}
	datagrid_filter['hide'] = request_args.get('hide', default='0') == '1'
	for key in request_args.keys():
		if request_args.get(key)[0] == '[' and request_args.get(key)[-1] == ']':
			if key == 'show':
				values = request_args.get(key)[1:-1].split(',')
				filter_str = str([value.replace('"', '') for value in values])
				datagrid_filter[key] = f" project IN ({str(filter_str[1:-1])})"
			elif key == 'submission.datatype':
				values = [value.replace('"', '') for value in request_args.get(key)[1:-1].split(',')]
				having_str = 'AND' + f""" ARRAY( SELECT UNNEST (ARRAY{request_args.get(key)[2:-2]}::character varying[]) ORDER BY 1) = ARRAY (
							SELECT UNNEST(ARRAY_AGG(CASE 
								WHEN datatype IN ('WGS30N', 'WGS90N') THEN 'WGS'
								WHEN datatype IN ('mRNA-20', 'mRNA-50') THEN 'mRNA'
								ELSE datatype
							END)) ORDER BY 1)"""
				datagrid_filter['having'] = having_str
			else:
				values = request_args.get(key)[1:-1].split(',')
				filter_str = str([value.replace('"', '') for value in values])
				datagrid_filter[key] = f" {key} IN ({str(filter_str[1:-1])})"
	# print(datagrid_filter)
	return 0

@ app.route('/analytics/datagrid')
def analytics_datagrid():
	analytics_data = {}
	global datagrid_filter
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
	analytics_data['project.pi'] = get_analytics('', dict(), pi_query, "all")

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
	
	analytics_data['project.project'] = get_analytics('', dict(), project_query, "all")

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
	
	analytics_data['submission.datatype'] = get_analytics('', dict(), datatype_query, "all")
	return jsonify(analytics_data)


@ app.route('/datagrid')
def datagrid():
	global datagrid_filter, datatypeID, datatype_columns
	set_datagrid_filter(request.args)
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
	
			
	
	return jsonify({"data": output, 'columns': ['Entity'] + datatype_columns + ['Count']})

@ app.route('/export/datagrid/<format>')
def export_datagrid(format):
	global datagrid_filter, datatypeID, datatype_columns
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
		with open("/tmp/data.json", 'w') as json_file:
			json.dump(output, json_file, indent=4, cls=CustomJSONEncoder)

		return send_file("/tmp/data.json",
                         mimetype='application/json',
                         as_attachment=True,
                         download_name='data.json')

	elif format in ('csv', 'tsv'):
		output_list = []
		for pi in output:
			for project in output[pi]:
				for sample in output[pi][project]:
					output_list.append([pi, project, sample] + [output[pi][project][sample][col] for col in datatype_columns])
		# return jsonify(output_list)	
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

	else:
		return 'Invalid format', 400
	# return jsonify(output)



####### overview page ##################################################
def get_distinct(entity):
	query = f""" SELECT DISTINCT {entity.split('.')[1]} FROM {entity.split('.')[0]} ORDER BY {entity.split('.')[1]} ASC;"""
	columns = fetch(cursor, query, 'all')
	return [row[0] for row in columns]


@ app.route('/data1/<date>')
def data1(date):
    try:
        start, end = parse_date(date)
    except:
        return "format should be 'yyyymmdd-yyyymmdd'"

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
				WHERE
					demultiplex_date BETWEEN '{start.strftime('%Y-%m-%d')}' AND '{end.strftime('%Y-%m-%d')}'
                GROUP BY
					demultiplex_date
				ORDER BY
					demultiplex_date
				)
			result;"""

    fetch_result = fetch(cursor, query, 'all')
    if fetch_result == None or len(fetch_result) == 0 or fetch_result[0] == None or len(fetch_result[0]) == 0:
        results = None
    else:
        results = fetch_result[0][0]

#   with open('./front-end/src/apiData/data1.json', 'w') as f:
        # json.dump(results, f, cls=JSONEncoder)
    return jsonify(results)


@ app.route('/data2a/<date>')
def data2a(date):
	try:
		start, end = parse_date(date)
	except:
		return "format should be 'yyyymmdd-yyyymmdd'"

	results = get_distinct('sample.status')

	case_query = ""
	# print(results)
	for value in results:
		case_query += f"""SUM(CASE WHEN status = '{value}' THEN 1 ELSE 0 END) AS "{value if len(value) != 0 else None}","""

	query = f"""
        SELECT JSON_AGG(result)
        FROM (
          SELECT
            pi,
            {case_query[:-1]}
          FROM
            project
          LEFT JOIN
            submission ON project.project_id = submission.project_id
          LEFT JOIN
            sample ON submission.submission_id = sample.submission_id
          LEFT JOIN
            flowcell ON sample.flowcell_id = flowcell.flowcell_id
          WHERE
            demultiplex_date BETWEEN '{start.strftime('%Y-%m-%d')}' AND '{end.strftime('%Y-%m-%d')}'
          GROUP BY
            pi
          )
        result;"""

	fetch_result = fetch(cursor, query, 'all')
	if fetch_result == None or len(fetch_result) == 0 or fetch_result[0] == None or len(fetch_result[0]) == 0:
		results = None
	else:
		results = fetch_result[0][0]

#   with open('./front-end/src/apiData/data2a.json', 'w') as f:
        # json.dump(results, f, cls=JSONEncoder)
	return jsonify(results)


@ app.route('/data2b/<date>')
def data2b(date):
    try:
        start, end = parse_date(date)
    except:
        return "format should be 'yyyymmdd-yyyymmdd'"

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
					demultiplex_date BETWEEN '{start.strftime('%Y-%m-%d')}' AND '{end.strftime('%Y-%m-%d')}'
				GROUP BY
					project.pi, project.project
				)
			result;
		"""
    fetch_result = fetch(cursor, query, 'all')
    if fetch_result == None or len(fetch_result) == 0 or fetch_result[0] == None or len(fetch_result[0]) == 0:
        results = None
    else:
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

        # Sort the project IDs in descending order by their values
            for dct in output:
                pi = dct.pop("pi")
                sorted_dct = {k: v for k, v in sorted(
                    dct.items(), key=lambda item: item[1], reverse=True)}
                sorted_dct["pi"] = pi
                output[output.index(dct)] = {"pi": pi, **sorted_dct}
    else:
        output = None

#   with open('./front-end/src/apiData/data2b.json', 'w') as f:
        # json.dump(output, f, cls=JSONEncoder)
    return jsonify(output)


@ app.route('/data2c/<date>')
def data2c(date):
    try:
        start, end = parse_date(date)
    except:
        return "format should be 'yyyymmdd-yyyymmdd'"
    query = f"""
			SELECT JSON_AGG(result)
			FROM (
				SELECT
					project.pi as "pi", project.project as "project", submission.rg as "genome", COUNT(*) as "sample_count"
				FROM
					project
				LEFT JOIN
					submission ON project.project_id = submission.project_id
				LEFT JOIN
					sample ON submission.submission_id = sample.submission_id
				LEFT JOIN
					flowcell ON sample.flowcell_id = flowcell.flowcell_id
				WHERE
					demultiplex_date BETWEEN '{start.strftime('%Y-%m-%d')}' AND '{end.strftime('%Y-%m-%d')}'
				GROUP BY
					project.pi, project.project, submission.rg
				ORDER BY
					"sample_count" DESC
				)
			result;
		"""
    fetch_result = fetch(cursor, query, 'all')
    if fetch_result == None or len(fetch_result) == 0 or fetch_result[0] == None or len(fetch_result[0]) == 0:
        results = None
    else:
        results = fetch_result[0][0]
    # with open('./front-end/src/apiData/data2c.json', 'w') as f:
    # 	json.dump(results, f, cls=JSONEncoder)
    return jsonify(results)


@ app.route('/data3/<date>')
def data3(date):
    try:
        start, end = parse_date(date)
    except:
        return "format should be 'yyyymmdd-yyyymmdd'"

    query = f"""
			SELECT JSON_AGG(result)
			FROM (
				SELECT flowcell_type as "type", COUNT(*) as "quantity"
				FROM flowcell
				WHERE demultiplex_date BETWEEN '{start.strftime('%Y-%m-%d')}' AND '{end.strftime('%Y-%m-%d')}'
				GROUP BY flowcell_type
        ORDER BY COUNT(*) DESC
				)
			result;
            """
    fetch_result = fetch(cursor, query, 'all')
    if fetch_result == None or len(fetch_result) == 0 or fetch_result[0] == None or len(fetch_result[0]) == 0:
        results = None
    else:
        results = fetch_result[0][0]
    # with open('./front-end/src/apiData/data3.json', 'w') as f:
    #   json.dump(results, f, cls=JSONEncoder)
    return jsonify(results)


@ app.route('/data4/<date>')
def data4(date):
    try:
        start, end = parse_date(date)
    except:
        return "format should be 'yyyymmdd-yyyymmdd'"

    query = f"""
        SELECT JSON_AGG(result)
        FROM (
            SELECT srv as "type", COUNT(*) as "quantity"
            FROM submission
            LEFT JOIN sample ON sample.submission_id = submission.submission_id
            LEFT JOIN flowcell ON flowcell.flowcell_id = sample.flowcell_id
            WHERE demultiplex_date BETWEEN '{start.strftime('%Y-%m-%d')}' AND '{end.strftime('%Y-%m-%d')}'
            GROUP BY srv
            ORDER BY COUNT(*) DESC
        )
        result;
    """

    fetch_result = fetch(cursor, query, 'all')
    if fetch_result == None or len(fetch_result) == 0 or fetch_result[0] == None or len(fetch_result[0]) == 0:
        results = None
    else:
        results = fetch_result[0][0]

    # Replace empty strings with "N/A"
    if results:
        for item in results:
            if item['type'] == "":
                item['type'] = "N/A"

    # with open('./front-end/src/apiData/data4.json', 'w') as f:
    #   json.dump(results, f, cls=JSONEncoder)

    return jsonify(results)


@ app.route('/data5/<date>')
def data5(date):
    try:
        start, end = parse_date(date)
    except:
        return "format should be 'yyyymmdd-yyyymmdd'"

    query = f"""
			SELECT JSON_AGG(result)
			FROM (
				SELECT sequencer_id as "type", COUNT(*) as "quantity"
				FROM flowcell
				WHERE demultiplex_date BETWEEN '{start.strftime('%Y-%m-%d')}' AND '{end.strftime('%Y-%m-%d')}'
				GROUP BY sequencer_id
        ORDER BY COUNT(*) DESC
				)
			result;
			"""
    fetch_result = fetch(cursor, query, 'all')
    if fetch_result == None or len(fetch_result) == 0 or fetch_result[0] == None or len(fetch_result[0]) == 0:
        results = None
    else:
        results = fetch_result[0][0]
#   with open('./front-end/src/apiData/data5.json', 'w') as f:
        # json.dump(results, f, cls=JSONEncoder)
    return jsonify(results)


@ app.route('/data6/<date>')
def data6(date):
    try:
        start, end = parse_date(date)
    except:
        return "format should be 'yyyymmdd-yyyymmdd'"
    query = f"""
			SELECT JSON_AGG(result)
			FROM (
				SELECT rg as "type", COUNT(*) as "quantity"
				FROM submission
				LEFT JOIN sample ON sample.submission_id = submission.submission_id
				LEFT JOIN flowcell ON flowcell.flowcell_id = sample.flowcell_id
				WHERE demultiplex_date BETWEEN '{start.strftime('%Y-%m-%d')}' AND '{end.strftime('%Y-%m-%d')}'
				GROUP BY rg
				)
			result;
            """
    fetch_result = fetch(cursor, query, 'all')
    if fetch_result == None or len(fetch_result) == 0 or fetch_result[0] == None or len(fetch_result[0]) == 0:
        results = None
    else:
        results = fetch_result[0][0]
#   with open('./front-end/src/apiData/data6.json', 'w') as f:
        # json.dump(results, f, cls=JSONEncoder)
    return jsonify(results)


@ app.route('/plot')
def plot():
	global database_filter
	set_database_filter(request.args)
	where_clause = get_where_clause(database_filter)
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

#  sudo service postgresql start
