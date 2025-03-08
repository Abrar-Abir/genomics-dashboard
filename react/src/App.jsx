import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Layout from "./components/shared/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Database from "./pages/Database";
import Plot from "./pages/Plot";
import Datagrid from "./pages/Datagrid";
import schema from "@lib/schema.json";

export default function App() {
	// minimize states shared
	// router
	// layout > togglesidebar
	//  files

	// const tableHeadersView = Object.keys(schema.table).reduce((acc, table) => {
	// 	Object.keys(schema.table[table].entity).forEach((key) => {
	// 		acc[schema.table[table].entity[key].alias] = schema.table[table].entity[key].view;
	// 	});
	// 	return acc;
	// }, {});

	// const binaryStr = tableHeaders.map((col) => (tableHeadersView[col] ? "1" : "0")).join("");

	const tableHeaders = Object.keys(schema.table)
		.flatMap((table) => Object.values(schema.table[table].entity).map((entity) => entity.alias))
		.sort();

	const binaryStr = tableHeaders
		.map((col) =>
			Object.keys(schema.table).some((table) =>
				Object.keys(schema.table[table].entity).some(
					(key) =>
						schema.table[table].entity[key].alias === col && schema.table[table].entity[key].view
				)
			)
				? "1"
				: "0"
		)
		.join("");

	function getID(array, element) {
		for (let i = 0; i < array.length; i++) {
			if (array[i] === element) {
				return i;
			}
		}
		return -1;
	}

	const tableHeadersProperties = Object.keys(schema.table).reduce((acc, table) => {
		Object.keys(schema.table[table].entity).forEach((key) => {
			if (!acc[schema.table[table].entity[key].alias]) {
				acc[schema.table[table].entity[key].alias] = {};
			}

			acc[schema.table[table].entity[key].alias].source = schema.table[table].entity[key].source;
			acc[schema.table[table].entity[key].alias].order =
				schema.table[table].entity[key].group * 100 + schema.table[table].entity[key].order;
			acc[schema.table[table].entity[key].alias].filter = schema.table[table].entity[key].order;
		});
		return acc;
	}, {});

	// Dashboard Page props

	const dashboardStateFresh = {
		startDate: new Date("2000-01-01"),
		endDate: new Date(),
		qgp: false,
	};
	const [dashboardState, setDashboardState] = useState(dashboardStateFresh);
	const resetDashboard = () => {
		setDashboardState(dashboardStateFresh);
	};

	// DataTable Page Props

	const tableStateFresh = {
		filter: new Map(),
		range: {},
		cols: binaryStr,
		sort: [
			getID(tableHeaders, "Loading Date"),
			getID(tableHeaders, "Submission ID"),
			getID(tableHeaders, "LIMS ID"),
		],
		key: -1,
		value: "",
		page: 1,
		limit: 25,
		open: {},
	};

	const [tableState, setTableState] = useState(tableStateFresh);

	const resetTable = () => {
		setTableState((prevState) => ({
			...initialState,
			open: prevState.open,
		}));
	};

	// Datagrid Props
	const gridStateFresh = { filter: new Map(), show: [], hide: false, open: {} };
	const [gridState, setGridState] = useState(gridStateFresh);
	const resetGrid = () => {
		setGridState(gridStateFresh);
	};

	// Plot Page Props

	return (
		<Router>
			<Routes>
				<Route path="login" element={<Login />} />
				<Route path="/" element={<Layout />}>
					<Route
						index
						element={
							<Dashboard
								state={dashboardState}
								setState={setDashboardState}
								reset={resetDashboard}
							/>
						}
					/>
					<Route
						path="datatable"
						element={
							<Database
								state={tableState}
								setState={setTableState}
								reset={resetTable}
								getID={getID}
								headers={tableHeaders}
								properties={tableHeadersProperties}
							/>
						}
					/>
					<Route
						path="datagrid"
						element={
							<Datagrid
								state={gridState}
								setState={setGridState}
								reset={resetGrid}
								headers={tableHeaders}
								properties={tableHeadersProperties}
							/>
						}
					/>
					<Route path="plot" element={<Plot />} />
				</Route>
			</Routes>
		</Router>
	);
}
