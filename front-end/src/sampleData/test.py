import json, requests
json_file_path = 'analytics.json'
with open(json_file_path, 'r') as file:
	data = json.load(file)
for key1 in data:
	for key2 in data[key1]:
		url = f"http://127.0.0.1:5001/type0?limit=5&offset=0&{key1}={key2}"
		try:
			response = requests.get(url)
			response.raise_for_status()
			json_data = response.json()
			count = json_data.get('total_count', 'Key not found')
			if count != data[key1][key2]:
				# print('test successful for url ', url)
			# else:
				print('AssertionError for url', url, f'expected count {data[key1][key2]} but got count {count}')
		except requests.RequestException as e:
			print(f"Request failed for URL: {url} with error: {e}")
		except ValueError as e:
			print(f"Failed to parse JSON for URL: {url} with error: {e}")
