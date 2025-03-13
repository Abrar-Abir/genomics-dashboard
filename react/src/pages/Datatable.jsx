import { useEffect, useState, useRef } from "react";
import FilterPanel from "@components/datatable/FilterPanel";
import Table from "@components/datatable/Table";
import DatabaseHeader from "../components/datatable/DatabaseHeader";
import { BASE_URL } from "@components/utils.js";
export default function Datatable({ state, setState, reset, getID, headers, properties }) {
	const [data, setData] = useState([]);
	const [totalCount, setTotalCount] = useState(0);
	const [filterPanelData, setFilterPanelData] = useState(null);
	const [query, setQuery] = useState("");
	const prevQuery = useRef(query);

	useEffect(() => {
		let queryStr = "";
		if (state.value !== "") {
			queryStr += `&${-1 * state.key}=${state.value}`;
		}

		if (state.filter.size > 0) {
			for (let [key, values] of state.filter) {
				queryStr += `&${key}=${JSON.stringify(values)}`;
			}
		}
		if (Object.keys(state.range).length > 0) {
			Object.entries(state.range).forEach(([key, [start, end]]) => {
				if (start !== "") {
					queryStr += `&${key}>=${start}`;
				}
				if (end !== "") {
					queryStr += `&${key}<=${end}`;
				}
			});
		}
		setQuery(queryStr);
	}, [state.filter, state.range, state.value]);

	useEffect(() => {
		async function fetchTableData() {
			try {
				const apiUrl = `${BASE_URL}/table?page=${state.page}&limit=${
					state.limit
				}&sort=${JSON.stringify(state.sort)}${query}`;
				const response = await fetch(apiUrl);

				if (!response.ok) throw new Error(`Table Data Fetch Failed: ${response.statusText}`);

				const dataResult = await response.json();
				setData(Array.isArray(dataResult.data) ? dataResult.data : []);
				setTotalCount(dataResult.total_count);
			} catch (error) {
				console.error("Error fetching table data:", error);
			}
		}

		fetchTableData();
	}, [state.page, state.limit, state.sort, BASE_URL, query]);

	useEffect(() => {
		async function fetchFilterPanelData() {
			try {
				const apiUrl = `${BASE_URL}/analytics/table?${query.slice(1)}`;
				const response = await fetch(apiUrl);

				if (!response.ok) throw new Error(`Filter Panel Data Fetch Failed: ${response.statusText}`);

				const filterPanelResult = await response.json();
				setFilterPanelData(filterPanelResult);
			} catch (error) {
				console.error("Error fetching filter panel data:", error);
			}
		}

		if (prevQuery.current !== query || filterPanelData === null) {
			fetchFilterPanelData();
			prevQuery.current = query;
		}
	}, [query]);

	return (
		<div className="flex flex-col h-screen overflow-y-hidden">
			<div className="flex-shrink-0">
				<DatabaseHeader
					getID={getID}
					tableHeaders={headers}
					query={query}
					searchKey={state.key}
					setSearchKey={setSearchKey}
					setSearchValue={setSearchValue}
					selectedColumns={selectedColumns}
					setSelectedColumns={setSelectedColumns}
					reset={reset}
				/>
			</div>
			<div className="flex flex-grow overflow-y-hidden overflow-x-auto">
				<FilterPanel
					data={filterPanelData}
					tableHeaders={headers}
					selectedFilter={state.filter}
					setSelectedFilter={setSelectedFilter}
					setSelectedRanges={setSelectedRanges}
					openAcc={openAcc}
					setOpenAcc={setOpenAcc}
				/>

				<Table
					getID={getID}
					data={data}
					totalCount={totalCount}
					page={state.page}
					setPage={setPage}
					limit={state.limit}
					setLimit={setLimit}
					tableHeaders={headers}
					tableHeadersProperties={properties}
					selectedColumns={selectedColumns}
					columnsToSort={state.sort}
					setColumnsToSort={setColumnsToSort}
				/>
			</div>
		</div>
	);
}
