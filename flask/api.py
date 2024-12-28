from library import connect_to_postgres, fetch, get_database_info
from flask import Flask, jsonify, request, send_file, render_template
from datetime import date, datetime
import psycopg2
from flask_cors import CORS
import json
import os
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

filter_dict = {}
sortList = []

with open(os.path.join(parent, "schema.json"), "r") as f:
    schema = json.load(f)

allColumns = []
for table in schema["table"]:
    allColumns += [(table, column, schema["table"][table]["entity"][column]["alias"], schema["table"][table]["entity"][column]["order"]) for column in schema["table"][table]["entity"]]
columnsSorted = [col[0] + '.' + col[1]
                 for col in sorted(allColumns, key=lambda x: x[1])]
column_clause = ', '.join(columnsSorted)
columnsAliased = [col[0] + '.' + col[1] + ' AS ' + '"' + col[2] + '"'
                 for col in sorted(allColumns, key=lambda x: x[3])]
alias_clause = ', '.join(columnsAliased)
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


def set_filter_dict(request_args):
    global filter_dict
    filter_dict = {}
    for key in request_args.keys():
        if key not in ('limit', 'offset', 'search'):
            if request_args.get(key)[0] == '[' and request_args.get(key)[-1] == ']':
                values = request_args.get(key)[1:-1].split(',')
                filter_str = str([value.replace('"', '') for value in values])
                filter_dict[key] = f" {key} IN ({str(filter_str[1:-1])})"
            elif key[-1] == '>' or key[-1] == '<':
                value = request_args.get(key)
                if 'date' in key:
                    filter_dict[key] = f" {key}= '{value}'"
                else:
                    filter_dict[key] = f" {key}= {value}"

        if 'search' in request_args.keys():
            search_key, search_value = request_args.get('search')[
                1:-1].split(',')
            assert (search_key in ['pi', 'project',
                    "submission", "flowcell", "sample"])
            if search_key in ['pi', 'project']:
                filter_key = 'project.' + search_key
            else:
                filter_key = search_key + '.' + search_key + '_id'
            filter_dict['search'] = f" {filter_key} IN ('{search_value}')"

    return 0


def get_order_clause():
    global sortList
    orderString = 'ORDER BY '
    for id in sortList:
        col = columnsSorted[abs(id)]
        order = 'ASC' if id > 0 else 'DESC'
        orderString += f" {col} {order},"
    return orderString[:-1]


def get_where_clause(filter_key=None):
    global filter_dict
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


sortList.append(get_id(columnsSorted, 'flowcell.loading_date'))
######## table page #######################################


@ app.route('/type0')
def type0():
    global sortList
    limit = request.args.get('limit', default=50, type=int)
    offset = request.args.get('offset', default=0, type=int)
    col = request.args.get('sort', default=-1, type=int)
    if col != -1:
        pos_id = get_id(sortList, col)
        neg_id = get_id(sortList, col * -1)
        if pos_id == -1 and neg_id == -1:
            sortList.append(col)
        elif neg_id == -1:
            sortList = sortList[:pos_id] + sortList[pos_id + 1:]
            sortList.append(col * -1)
        elif pos_id == -1:
            sortList = sortList[:neg_id] + sortList[neg_id + 1:]
    order_clause = get_order_clause()

    set_filter_dict(request.args)

    where_clause = get_where_clause()
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
            SELECT {column_clause}
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

@ app.route('/raw/<sample_id>')
def raw(sample_id):
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
			WHERE sample.sample_id = '{sample_id}';
		"""
	results = fetch(cursor, data_query, 'all')
	fieldnames = [desc[0] for desc in cursor.description]
	data = {sample_id : dict()}
	for row in results:
		flowcell_id = row[get_id(fieldnames, 'Flowcell ID')] 
		data[sample_id][flowcell_id] = {fieldnames[id] : row[id] for id in range(len(row)) if id not in (get_id(fieldnames, 'LIMS ID'), get_id(fieldnames, 'Flowcell ID'))}
		data[sample_id][flowcell_id]['Mean Q Score'] = data[sample_id][flowcell_id]['Mean Q Score'] / ((sum([data[sample_id][flowcell_id][f'Lane {i}'] for i in range(1,9)]))*2)
	return jsonify(data)


@ app.route('/export/<format>')
def export(format):
	where_clause = get_where_clause()
	order_clause = get_order_clause()
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
		"""
	results = fetch(cursor, data_query, 'all')
	fieldnames = [desc[0] for desc in cursor.description]
	df = pd.DataFrame(results, columns=fieldnames)
	df['Mean Q Score'] = df['Mean Q Score']/(sum([df[f'Lane {i}']  for i in range(1, 9)])*2)
	df['Yeild Q30 (Gb)'] = df['Yeild Q30 (Gb)']/10**9

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

	elif format == 'json':
		data = dict()
		for row in range(len(df)):
			sample_id = df.loc[row, 'LIMS ID']
			flowcell_id = df.at[row, 'Flowcell ID']
			if sample_id not in data:
				data[sample_id] = dict()
			data[sample_id][flowcell_id] = {key : df.loc[row, key] for key in fieldnames if key not in ('sample_id', 'flowcell_id')}
		json_file_path = "/tmp/data.json"
		with open(json_file_path, 'w') as json_file:
			json.dump(data, json_file, indent=4, cls=CustomJSONEncoder)

		# Send the file as a response
		return send_file(json_file_path,
                         mimetype='application/json',
                         as_attachment=True,
                         download_name='data.json')
	else:
		return 'Invalid format', 400

# helper function for analytics


def get_counts(column_name):
    where_clause = get_where_clause(column_name)
    query = f"""
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
    results = fetch(cursor, query, 'all')
    return [(str(row[0]), row[1]) for row in results]


def get_range(column_name):
    where_clause = get_where_clause()
    query = f"""
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
    results = fetch(cursor, query, 'one')
    return (str(results[0]), str(results[1]))


@ app.route('/analytics')
def analytics():
	analytics_data = {}
	for table in schema["table"]:
		for column in schema["table"][table]["entity"]:
			if schema["table"][table]["entity"][column]["filter_option"]:
				if "NUMERIC" in schema["table"][table]["entity"][column]["type"] or "DATE" in schema["table"][table]["entity"][column]["type"]:
					analytics_data[f"{table}.{column}"] = get_range(
                        f"{table}.{column}")
				else:
					analytics_data[f"{table}.{column}"] = get_counts(
                        f"{table}.{column}")
	# print(analytics_data)
	return jsonify(analytics_data)


@ app.route('/search/<entity>')
def search(entity):
    where_clause = get_where_clause('search')
    assert (entity in ["pi", "project", "submission", "flowcell", "sample"])
    if entity == "pi" or entity == "project":
        column_name = "project." + entity
    else:
        column_name = entity + "." + entity + "_id"
    query = f"""
        SELECT DISTINCT {column_name}
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

def agg_dict(l):
	r = dict()
	for d in l:
		for k in d:
			r[k] = r.get(k, 0) + d[k]
	return r

@ app.route('/datagrid')
def datagrid():

	set_filter_dict(request.args)
	where_clause = get_where_clause()

	query = """ SELECT DISTINCT datatype FROM submission ;"""
	columns = fetch(cursor, query, 'all')

	query = f"""
        SELECT JSON_AGG(result)
        FROM (
          SELECT
            sample_name,
			pi,
			ARRAY_AGG(project) AS project,
			ARRAY_AGG(datatype) AS datatype
          FROM
			sample
			LEFT JOIN submission ON sample.submission_id = submission.submission_id
			LEFT JOIN project ON submission.project_id = project.project_id
          GROUP BY
            sample_name, project.pi
		  HAVING
		    COUNT(*) > 1
		  ORDER BY
		  	COUNT(*) DESC
          )
        result;"""

	fetch_result = fetch(cursor, query, 'all')
	if fetch_result == None or len(fetch_result) == 0 or fetch_result[0] == None or len(fetch_result[0]) == 0:
		results = None
	else:
		results = fetch_result[0][0]

	output = dict()
	for row in results:
		pi = row['pi']
		projects = row['project']
		sample = row['sample_name']
		if pi not in output:
			output[pi] = {"header": dict(), "projects": dict()}
		for i in range(len(projects)):
			project = projects[i]
			datatype = row['datatype'][i]
			if project not in output[pi]["projects"]:
				output[pi]["projects"][project] = {"header": dict(), "samples":{}}
			if sample not in output[pi]["projects"][project]['samples']:
				output[pi]["projects"][project]['samples'][sample] = dict()
			
			output[pi]['projects'][project]['samples'][sample][datatype] = output[pi]['projects'][project]['samples'][sample].get(datatype, 0) + 1
			output[pi]['projects'][project]['samples'][sample]['count'] = output[pi]['projects'][project]['samples'][sample].get('count', 0) + 1

			output[pi]['header'][datatype] = output[pi]['header'].get(datatype, 0) + 1
			output[pi]['projects'][project]['header'][datatype] = output[pi]['projects'][project]['header'].get(datatype, 0) + 1

			output[pi]['header']['count'] = output[pi]['header'].get('count', 0) + 1
			output[pi]['projects'][project]['header']['count'] = output[pi]['projects'][project]['header'].get('count', 0) + 1

			other_projects = set([other_project for other_project in projects if other_project != project])
			if len(other_projects) > 0:
				output[pi]['projects'][project]['samples'][sample]['other'] = tuple(other_projects)

	analytics = {'pi.pi' : [], 'submission.datatype': []}
	analytics['pi.pi'] = sorted([(pi, output[pi]['header']['count']) for pi in output], key= lambda x : x[1], reverse=True)
	analytics['submission.datatype'] = sorted([(datatype[0], sum([output[pi]['header'].get(datatype[0], 0) for pi in output])) for datatype in columns], key=lambda x : x[1], reverse=True)
	
	return jsonify({"data": output, 'columns': ['Entity'] + columns + ['count'], 'analytics': analytics})




    ####### overview page ##################################################


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
    query = """ SELECT DISTINCT status FROM sample ;"""
    results = fetch(cursor, query, 'all')

    case_query = ""
    for row in results:
        assert (len(row) == 1)
        value = row[0]
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
    where_clause = get_where_clause()
    data_query = f"""
        SELECT JSON_AGG(result)
        FROM (
            SELECT *
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
