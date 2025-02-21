## API format 
#### Dashboard
#### Table
- __Table:__

		{APIServerURL}/table?page={page: int > 0}&limit={limit: 25|50|100|200}&sort={columnsToSort: list[int]}&{filterKey1: int|int+[<|>]}={filterValue1: str|list[str]}&{filterKey2: int|int+[<|>]}={filterValue2: str|list[str]}&...

	All keys are optional 
- __Export:__
		
		{APIServerURL}/export/table/{format: 'csv'|'tsv'|'json'}?sort={columnsToSort: list[int]}&{filterKey1: int|int+[<|>]}={filterValue1: str|list[str]}&{filterKey2: int|int+[<|>]}={filterValue2: str|list[str]}&...
	
	Only format key is mandatory

- __Analytics:__

		{APIServerURL}/analytics/table?{filterKey1: int|int+[<|>]}={filterValue1: str|list[str]}&{filterKey2: int|int+[<|>]}={filterValue2: str|list[str]}&...

	All keys are optional

- __Search:__

		{APIServerURL}/search/{id: int}

	
#### DataGrid Page

#### Plot Page
___
#### Specification

- `columnToSort` : a non-empty list of signed indexes of columns to sort; -ve index represents sort in the opposite order. No elements in the list will have repititon.

- `filterKeyi` : signed index of the column (from the list of all columns - sorted lexicographically) to be filtered or searched; -ve index represents filterKey is being searched (not filtered).
The index can have suffix `<` or `>` - which represents the filter is for a NUMERIC or DATE type, and the value represents the lower or upper limit espectively. All filterkeys are unique.  
At most 1 filterKey can be the searchKey.

- `filterValuei` : a non-empty list of string [for columns with all types except NUMERIC or DATE] or a single string [for columns with types NUMERIC or DATE] 


## React States

#### Dashboard Page

#### DataTable Page
properties storing group*100 + order as order and order//100 will be used a group for coloring
selectedfilter map object for ordered dict 
#### DataGrid Page

#### Plot Page