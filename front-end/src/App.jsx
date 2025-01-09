import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "./components/shared/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Database from "./pages/Database";
import Plot from "./pages/Plot";
import Datagrid from "./pages/Datagrid";
import schema from "@lib/schema.json";

function App() {
	// Dashboard Page Props

	const [dateRange, setDateRange] = useState({
		startDate: new Date("2000-01-01"),
		endDate: new Date(),
	});

	const resetDashboard = () =>
		setDateRange({
			startDate: new Date("2000-01-01"),
			endDate: new Date(),
		});

	const [dataDashboard, setDataDashboard] = useState({
		data1: null,
		data2a: null,
		data2b: null,
		data2c: null,
		data3: null,
		data4: null,
		data5: null,
		data6: null,
	});

	// Database Page Props

	const tableHeadersView = Object.keys(schema.table).reduce((acc, table) => {
		Object.keys(schema.table[table].entity).forEach((key) => {
			acc[key] = schema.table[table].entity[key].view;
		});
		return acc;
	}, {});

	const tableHeadersDatabase = Object.keys(schema.table)
		.flatMap((table) => Object.keys(schema.table[table].entity))
		.sort();
	const binaryString = tableHeadersDatabase
		.map((col) => (tableHeadersView[col] ? "1" : "0"))
		.join("");
	const trinaryString = tableHeadersDatabase
		.map((col) => (col === "loading_date" ? "1" : col === "submission_id" ? "1" : "0"))
		.join("");

	const [selectedFilterDatabase, setSelectedFilterDatabase] = useState({});
	const [selectedRangesDatabase, setSelectedRangesDatabase] = useState({});
	const [selectedColumnsDatabase, setSelectedColumnsDatabase] = useState(binaryString);
	const [sortedColumnsDatabase, setSortedColumnsDatabase] = useState(trinaryString);
	const [columnToSortDatabase, setColumnToSortDatabase] = useState(-1);
	const [searchValueDatabase, setSearchValueDatabase] = useState("");
	const [searchKeyDatabase, setSearchKeyDatabase] = useState("Search");

	const [dataDatabase, setDataDatabase] = useState([]);
	const [pageDatabase, setPageDatabase] = useState(1);
	const [totalCountDatabase, setTotalCountDatabase] = useState(0);
	const [limitDatabase, setLimitDatabase] = useState(50);
	const [filterPanelDataDatabase, setFilterPanelDataDatabase] = useState(null);

	const [openAccDatabase, setOpenAccDatabase] = useState({});

	const resetDatabase = () => {
		setSearchKeyDatabase("Search");
		setSearchValueDatabase("");
		setSelectedFilterDatabase({});
		setSelectedRangesDatabase({});
		setSelectedColumnsDatabase(binaryString);
		setSortedColumnsDatabase(trinaryString);
		setColumnToSortDatabase(-1);
		setOpenAccDatabase({});
	};

	// Datagrid Props
	const [selectedFilterDatagrid, setSelectedFilterDatagrid] = useState({});
	const [showProjectDatagrid, setShowProjectDatagrid] = useState([]);
	const [dataDatagrid, setDataDatagrid] = useState([]);
	const [filterPanelDataDatagrid, setFilterPanelDataDatagrid] = useState(null);
	const [tableHeadersDatagrid, setTableHeadersDatagrid] = useState([]);
	const [openPiDatagrid, setOpenPiDatagrid] = useState({});
	const [openProjectDatagrid, setOpenProjectDatagrid] = useState({});
	const [hideSingleEntriesDatagrid, setHideSingleEntriesDatagrid] = useState(false);
	const resetDatagrid = () => {
		setSelectedFilterDatagrid({});
		setShowProjectDatagrid([]);
		setOpenPiDatagrid({});
		setOpenProjectDatagrid({});
		setHideSingleEntriesDatagrid(false);
	};

	// Plot Page Props
	const [htmlContent, setHtmlContent] = useState("");

	return (
		<Router>
			<Routes>
				<Route path="login" element={<Login />} />
				<Route path="/" element={<Layout />}>
					<Route
						index
						element={
							<Dashboard
								dateRange={dateRange}
								setDateRange={setDateRange}
								data={dataDashboard}
								setData={setDataDashboard}
								reset={resetDashboard}
							/>
						}
					/>
					<Route
						path="database"
						element={
							<Database
								selectedFilter={selectedFilterDatabase}
								setSelectedFilter={setSelectedFilterDatabase}
								selectedRanges={selectedRangesDatabase}
								setSelectedRanges={setSelectedRangesDatabase}
								filterPanelData={filterPanelDataDatabase}
								setFilterPanelData={setFilterPanelDataDatabase}
								searchKey={searchKeyDatabase}
								setSearchKey={setSearchKeyDatabase}
								searchValue={searchValueDatabase}
								setSearchValue={setSearchValueDatabase}
								sortedColumns={sortedColumnsDatabase}
								setSortedColumns={setSortedColumnsDatabase}
								columnToSort={columnToSortDatabase}
								setColumnToSort={setColumnToSortDatabase}
								selectedColumns={selectedColumnsDatabase}
								setSelectedColumns={setSelectedColumnsDatabase}
								data={dataDatabase}
								setData={setDataDatabase}
								tableHeaders={tableHeadersDatabase}
								totalCount={totalCountDatabase}
								setTotalCount={setTotalCountDatabase}
								page={pageDatabase}
								setPage={setPageDatabase}
								limit={limitDatabase}
								setLimit={setLimitDatabase}
								reset={resetDatabase}
								openAcc={openAccDatabase}
								setOpenAcc={setOpenAccDatabase}
							/>
						}
					/>
					<Route
						path="datagrid"
						element={
							<Datagrid
								selectedFilter={selectedFilterDatagrid}
								setSelectedFilter={setSelectedFilterDatagrid}
								filterPanelData={filterPanelDataDatagrid}
								setFilterPanelData={setFilterPanelDataDatagrid}
								showProject={showProjectDatagrid}
								setShowProject={setShowProjectDatagrid}
								data={dataDatagrid}
								setData={setDataDatagrid}
								tableHeaders={tableHeadersDatagrid}
								setTableHeaders={setTableHeadersDatagrid}
								openPi={openPiDatagrid}
								setOpenPi={setOpenPiDatagrid}
								openProject={openProjectDatagrid}
								setOpenProject={setOpenProjectDatagrid}
								hideSingleEntries={hideSingleEntriesDatagrid}
								setHideSingleEntries={setHideSingleEntriesDatagrid}
								reset={resetDatagrid}
							/>
						}
					/>
					<Route path="plot" element={<Database />} />
				</Route>
			</Routes>
		</Router>
	);
}

export default App;
