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

app = Flask(__name__)
CORS(app)
dir = os.getcwd()
parent = os.path.dirname(dir)
database, host, user, password, port = get_database_info()
conn, cursor = connect_to_postgres(database, host, user, password, port)
conn.autocommit = True

filter_dict = {}
columnString = ''

with open(os.path.join(parent, "schema.json"), "r") as f:
    schema = json.load(f)

allColumns = []
for table in schema["table"]:
    allColumns += [(schema["table"][table]["entity"][column]["group"], table, column)
                   for column in schema["table"][table]["entity"]]
columnsSorted = [col[1] + '.' + col[2]
                 for col in sorted(allColumns, key=lambda x: x[2])]
columnsGrouped = [col[1] + '.' + col[2]
                  for col in sorted(allColumns, key=lambda x: x[0])]
# print("columnsSorted", columnsSorted)
# print("columnsGrouped", columnsGrouped)
73
# def isdigit(obj):
#     text = str(obj).replace('.', '')
#     for char in text:
#         if char not in '0123456789':
#             return False
#     return True


# class JSONEncoder(json.JSONEncoder):
#     def default(self, obj):
#         if isdigit(obj):
#             return str(obj)
#         if isinstance(obj, date):
#             return datetime.strftime(obj, '%d-%m-%Y')
#         return super(JSONEncoder, self).default(obj)


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


def set_column_string(cols):
    global columnString
    columnString = ''
    colsParsed = {columnsSorted[i]: cols[i] for i in range(len(cols))}
    columns = [column for column in columnsGrouped if colsParsed[column] == '1']
    columnString = ", ".join(columns)
    # return 0


def get_where_clause(filter_key=None):
    global filter_dict
    if len(filter_dict) == 0:
        return ""
    where_clause = "WHERE"
    for key in filter_dict:
        if key != filter_key:
            where_clause += filter_dict[key] + " AND "
    return where_clause[:-5]


def stringify(data):
    if isinstance(data, list):
        return [stringify(dataItem) for dataItem in data]
    if isinstance(data, dict):
        return {str(key): stringify(value) for key, value in data.items()}
    return str(data)

######## table page #######################################


@ app.route('/type0')
def type0():
    limit = request.args.get('limit', default=50, type=int)
    offset = request.args.get('offset', default=0, type=int)

    global columnString
    columnString = ''
    cols = request.args.get('cols', default='1'*len(allColumns), type=str)
    colsParsed = {columnsSorted[i]: cols[i] for i in range(len(cols))}
    columns = [column for column in columnsGrouped if colsParsed[column] == '1']
    columnString = ", ".join(columns)

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
            SELECT {columnString}
            FROM sample
            LEFT JOIN pool ON sample.pool_id = pool.pool_id
            LEFT JOIN flowcell ON sample.flowcell_id = flowcell.flowcell_id
            LEFT JOIN submission ON sample.submission_id = submission.submission_id
            LEFT JOIN project ON submission.project_id = project.project_id
            LEFT JOIN i5 ON sample.i5_id = i5.i5_id
            LEFT JOIN i7 ON sample.i7_id = i7.i7_id
            LEFT JOIN sequencer ON flowcell.sequencer_id = sequencer.sequencer_id
			{where_clause}
            LIMIT {limit} OFFSET {offset}
        ) result;
    """
    fetch_result = fetch(cursor, data_query, 'all')
    if fetch_result == None or len(fetch_result) == 0 or fetch_result[0] == None or len(fetch_result[0]) == 0:
        results = None
    else:
        results = fetch_result[0][0]

    return jsonify({"data": results, "columns": [column.split('.')[-1] for column in columns], "total_count": total_count})


@ app.route('/export/<format>')
def export(format):
    where_clause = get_where_clause()
    data_query = f"""
        SELECT {columnString}
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
    results = fetch(cursor, data_query, 'all')
    fieldnames = [desc[0] for desc in cursor.description]
    df = pd.DataFrame(results, columns=fieldnames)

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
        json_buffer = io.StringIO()
        df.to_json(json_buffer, orient='records', lines=True)
        json_buffer.seek(0)
        return send_file(io.BytesIO(json_buffer.getvalue().encode()),
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

    # with open(os.path.join(parent, 'front-end/src/sampleData/analytics.json'), 'w') as f:
    #     json.dump(analytics_data, f, cls=JSONEncoder)
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
    print(results)
    return jsonify([row[0] for row in results])

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
