import { useEffect, useState, useRef } from "react";
import FilterPanel from "@components/database/FilterPanel";
import DataTable from "@components/database/DataTable";
import DatabaseHeader from "../components/database/DatabaseHeader";
import { useOutletContext } from "react-router-dom";

export default function Database({
	getID,
	selectedFilter,
	setSelectedFilter,
	selectedRanges,
	setSelectedRanges,
	// filterPanelData,
	// setFilterPanelData,
	searchKey,
	setSearchKey,
	searchValue,
	setSearchValue,
	columnsToSort,
	setColumnsToSort,
	selectedColumns,
	setSelectedColumns,
	// data,
	// setData,
	tableHeaders,
	tableHeadersProperties,
	// totalCount,
	// setTotalCount,
	page,
	setPage,
	limit,
	setLimit,
	// reset,
	openAcc,
	setOpenAcc,
}) {
	const { baseURL } = useOutletContext();
	const [data, setData] = useState([]);
	const [totalCount, setTotalCount] = useState(0);
	const [filterPanelData, setFilterPanelData] = useState(null);
	const [query, setQuery] = useState("");
	const prevQuery = useRef(query);

	useEffect(() => {
		let queryStr = "";
		if (searchValue !== "") {
			queryStr += `&${-1 * searchKey}=${searchValue}`;
		}

		if (selectedFilter.size > 0) {
			for (let [key, values] of selectedFilter) {
				queryStr += `&${key}=${JSON.stringify(values)}`;
			}
		}
		if (Object.keys(selectedRanges).length > 0) {
			Object.entries(selectedRanges).forEach(([key, [start, end]]) => {
				if (start !== "") {
					queryStr += `&${key}>=${start}`;
				}
				if (end !== "") {
					queryStr += `&${key}<=${end}`;
				}
			});
		}
		setQuery(queryStr);
	}, [selectedFilter, selectedRanges, searchValue]);

	useEffect(() => {
		async function fetchTableData() {
			try {
				const apiUrl = `${baseURL}/table?page=${page}&limit=${limit}&sort=${JSON.stringify(
					columnsToSort
				)}${query}`;
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
	}, [page, limit, columnsToSort, baseURL, query]);

	useEffect(() => {
		async function fetchFilterPanelData() {
			try {
				const apiUrl = `${baseURL}/analytics/table?${query.slice(1)}`;
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
					tableHeaders={tableHeaders}
					query={query}
					searchKey={searchKey}
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
					tableHeaders={tableHeaders}
					selectedFilter={selectedFilter}
					setSelectedFilter={setSelectedFilter}
					setSelectedRanges={setSelectedRanges}
					openAcc={openAcc}
					setOpenAcc={setOpenAcc}
				/>

				<DataTable
					getID={getID}
					data={data}
					totalCount={totalCount}
					page={page}
					setPage={setPage}
					limit={limit}
					setLimit={setLimit}
					tableHeaders={tableHeaders}
					tableHeadersProperties={tableHeadersProperties}
					selectedColumns={selectedColumns}
					columnsToSort={columnsToSort}
					setColumnsToSort={setColumnsToSort}
				/>
			</div>
		</div>
	);
}
