import { useState, useEffect, useRef } from "react";
import FilterPanel from "@components/database/FilterPanel";
import DataTable from "@components/database/DataTable";
import DatabaseHeader from "../components/database/DatabaseHeader";
import { useOutletContext } from "react-router-dom";

// col to sort needs to change

export default function Database({
	selectedFilter,
	setSelectedFilter,
	selectedRanges,
	setSelectedRanges,
	filterPanelData,
	setFilterPanelData,
	searchKey,
	setSearchKey,
	searchValue,
	setSearchValue,
	sortedColumns,
	setSortedColumns,
	columnToSort,
	setColumnToSort,
	selectedColumns,
	setSelectedColumns,
	data,
	setData,
	tableHeaders,
	totalCount,
	setTotalCount,
	page,
	setPage,
	limit,
	setLimit,
	reset,
}) {
	const { baseURL } = useOutletContext();

	const handleExport = (format) => {
		window.location.href = `${baseURL}/export/database/${format}`;
	};

	const prevState = useRef({
		sortedColumns: sortedColumns,
		page: page,
		limit: limit,
	});

	useEffect(() => {
		const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
		async function fetchData() {
			try {
				console.log(sortedColumns);
				const offset = (page - 1) * limit;
				let apiUrl = `${baseURL}/database?limit=${limit}&offset=${offset}`;
				if (columnToSort !== -1 && prevState.current.sortedColumns != sortedColumns) {
					apiUrl += `&sort=${columnToSort}`;
				}
				if (searchValue !== "") {
					apiUrl += `&search=(${searchKey},${searchValue})`;
				}

				if (Object.keys(selectedFilter).length > 0) {
					Object.entries(selectedFilter).forEach(([key, values]) => {
						if (values.length > 0) {
							apiUrl += `&${key}=${JSON.stringify(values)}`;
						}
					});
				}
				if (Object.keys(selectedRanges).length > 0) {
					Object.entries(selectedRanges).forEach(([key, [start, end]]) => {
						if (start !== "") {
							apiUrl += `&${key}>=${start}`;
						}
						if (end !== "") {
							apiUrl += `&${key}<=${end}`;
						}
					});
				}
				const dataResponse = await fetch(apiUrl);

				if (!dataResponse.ok) {
					console.error("Server error:", dataResponse);
				} else {
					const dataResult = await dataResponse.json();
					setData(Array.isArray(dataResult.data) ? dataResult.data : []);
					setTotalCount(dataResult.total_count);

					await delay(5);
					if (
						(prevState.current.page === page &&
							prevState.current.limit === limit &&
							prevState.current.sortedColumns === sortedColumns) ||
						filterPanelData === null
					) {
						prevState.current.sortedColumns = sortedColumns;
						prevState.current.page = page;
						prevState.current.limit = limit;
						const filterPanelResponse = await fetch(`${baseURL}/analytics/database`);
						if (!filterPanelResponse.ok) {
							console.error("Server error:", filterPanelResponse);
						} else {
							const filterPanelResult = await filterPanelResponse.json();
							setFilterPanelData(filterPanelResult);
						}
					}
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		}

		fetchData();
	}, [page, limit, selectedFilter, selectedRanges, searchValue, sortedColumns, location]);

	const handlePrev = () => {
		setPage((prevPage) => Math.max(prevPage - 1, 1));
	};

	const handleNext = () => {
		setPage((prevPage) => Math.min(prevPage + 1, Math.ceil(totalCount / limit)));
	};

	const handleLimit = (number) => {
		setLimit(number);
		setPage(1);
	};

	return (
		<div className="flex flex-col h-screen overflow-y-hidden">
			<div className="flex-shrink-0">
				<DatabaseHeader
					reset={reset}
					setSearchValue={setSearchValue}
					selectedColumns={selectedColumns}
					setSearchKey={setSearchKey}
					searchKey={searchKey}
					setSelectedColumns={setSelectedColumns}
					baseURL={baseURL}
					handleExport={handleExport}
				/>
			</div>
			<div className="flex flex-grow overflow-y-hidden overflow-x-auto">
				<FilterPanel
					data={filterPanelData}
					setSelectedFilter={setSelectedFilter}
					selectedFilter={selectedFilter}
					setSelectedRanges={setSelectedRanges}
					baseURL={baseURL}
				/>

				<DataTable
					data={data}
					handlePrev={handlePrev}
					handleNext={handleNext}
					totalCount={totalCount}
					page={page}
					limit={limit}
					handleLimit={handleLimit}
					selectedColumns={selectedColumns}
					tableHeaders={tableHeaders}
					sortedColumns={sortedColumns}
					setSortedColumns={setSortedColumns}
					setColumnToSort={setColumnToSort}
					baseURL={baseURL}
				/>
				{/* )} */}
				{/* {location === "/plot" && (
					<div style={{ flex: 1, overflow: "auto" }}>
						<div
							style={{
								width: "100%",
								height: "100%",
								overflow: "auto",
							}}
							dangerouslySetInnerHTML={{ __html: htmlContent }}
						/>
					</div>
				)} */}
			</div>
		</div>
	);
}
