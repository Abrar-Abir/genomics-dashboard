import { useState, useEffect, useRef } from "react";
import FilterPanel from "@components/database/FilterPanel";
import DataTable from "@components/database/DataTable";
import DatabaseHeader from "../components/database/DatabaseHeader";
import { useOutletContext } from "react-router-dom";
import schema from "@lib/schema.json";
import { useLocation } from "react-router-dom";

export default function Database() {
	const location = useLocation().pathname;
	const tableHeadersView = Object.keys(schema.table).reduce((acc, table) => {
		Object.keys(schema.table[table].entity).forEach((key) => {
			acc[key] = schema.table[table].entity[key].view;
		});
		return acc;
	}, {});

	const columnsSorted = Object.keys(schema.table)
		.flatMap((table) => Object.keys(schema.table[table].entity))
		.sort();
	const binaryString = columnsSorted
		.map((col) => (tableHeadersView[col] ? "1" : "0"))
		.join("");
	// const viewAll = columnsSorted.map(col => tableHeadersView[col] ? '1' : '1').join('');
	const trinaryString = columnsSorted
		.map((col) => (col === "loading_date" ? "1" : "0"))
		.join("");

	const { baseURL } = useOutletContext();

	const [selectedFilter, setSelectedFilter] = useState({});
	const [selectedRanges, setSelectedRanges] = useState({});
	const [selectedColumns, setSelectedColumns] = useState(binaryString);
	const [sortedColumns, setSortedColumns] = useState(trinaryString);
	const [searchValue, setSearchValue] = useState("");
	const [searchKey, setSearchKey] = useState("Search");

	const [data, setData] = useState([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [limit, setLimit] = useState(50);
	const [filterPanelData, setFilterPanelData] = useState(null);
	const [columnToSort, setColumnToSort] = useState(-1);
	const [htmlContent, setHtmlContent] = useState("");

	const handleExport = (format) => {
		window.location.href = `${baseURL}/export/database/${format}`;
	};

	const reset = () => {
		setSearchValue("");
		setSelectedFilter({});
		setSelectedRanges({});
		setSelectedColumns(binaryString);
		setSortedColumns(trinaryString);
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
				const offset = (page - 1) * limit;
				let apiUrl =
					location === "/database"
						? `${baseURL}/type0?limit=${limit}&offset=${offset}`
						: `${baseURL}/plot?`;
				if (
					columnToSort !== -1 &&
					prevState.current.sortedColumns != sortedColumns
				) {
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
					Object.entries(selectedRanges).forEach(
						([key, [start, end]]) => {
							if (start !== "") {
								apiUrl += `&${key}>=${start}`;
							}
							if (end !== "") {
								apiUrl += `&${key}<=${end}`;
							}
						}
					);
				}
				const dataResponse = await fetch(apiUrl);

				if (!dataResponse.ok) {
					console.error("Server error:", dataResponse);
				} else {
					const dataResult = await dataResponse.json();
					if (location === "/database") {
						setData(
							Array.isArray(dataResult.data)
								? dataResult.data
								: []
						);
						setTotalCount(dataResult.total_count);
						const totalCount = dataResult.total_count;
						setTotalPages(Math.ceil(totalCount / limit));
					} else {
						setHtmlContent(dataResult.html);
					}
					await delay(5);
					if (
						(prevState.current.page === page &&
							prevState.current.limit === limit &&
							prevState.current.sortedColumns ===
								sortedColumns) ||
						filterPanelData === null
					) {
						prevState.current.sortedColumns = sortedColumns;
						prevState.current.page = page;
						prevState.current.limit = limit;
						const filterPanelResponse = await fetch(
							`${baseURL}/analytics/database`
						);
						if (!filterPanelResponse.ok) {
							console.error("Server error:", filterPanelResponse);
						} else {
							const filterPanelResult =
								await filterPanelResponse.json();
							setFilterPanelData(filterPanelResult);
						}
					}
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		}

		fetchData();
	}, [
		page,
		limit,
		selectedFilter,
		selectedRanges,
		searchValue,
		sortedColumns,
		location,
	]);

	const handlePrev = () => {
		setPage((prevPage) => Math.max(prevPage - 1, 1));
	};

	const handleNext = () => {
		setPage((prevPage) => Math.min(prevPage + 1, totalPages));
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
				{location === "/database" && (
					<DataTable
						data={data}
						handlePrev={handlePrev}
						handleNext={handleNext}
						totalPages={totalPages}
						totalCount={totalCount}
						page={page}
						limit={limit}
						handleLimit={handleLimit}
						selectedColumns={selectedColumns}
						columnsSorted={columnsSorted}
						sortedColumns={sortedColumns}
						setSortedColumns={setSortedColumns}
						setColumnToSort={setColumnToSort}
						baseURL={baseURL}
						location={location}
					/>
				)}
				{location === "/plot" && (
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
				)}
			</div>
		</div>
	);
}
