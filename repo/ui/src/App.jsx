import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Layout from "./components/shared/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Datatable from "./pages/Datatable";
import Plot from "./pages/Plot";
import Datagrid from "./pages/Datagrid";
import schema from "@lib/schema.json";
import { getID } from "@components/utils.js";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children }) => {
	const token = localStorage.getItem("token");
	if (!token) {
		return <Navigate to="/login" replace />;
	}
	try {
		if (jwtDecode(token).exp < Date.now() / 1000) {
			localStorage.removeItem("token");
			return <Navigate to="/login" replace />;
		}
		return children;
	} catch (error) {
		console.error("Invalid token:", error);
		localStorage.removeItem("token");
		return <Navigate to="/login" replace />;
	}
};

export default function App() {
	const headers = schema.headers;
	const binaryStr = schema.binaryStr;

	// Dashboard Page props

	const dashboardStateFresh = {
		startDate: new Date("2000-01-01"),
		endDate: new Date(),
		qgp: true,
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
			getID(headers, "Loading Date"),
			getID(headers, "Submission ID"),
			getID(headers, "LIMS ID"),
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
			...tableStateFresh,
			open: prevState.open,
		}));
	};

	// Datagrid Props
	const gridStateFresh = {
		filter: new Map(),
		show: [],
		hide: false,
		openPi: {},
		openProject: {},
		open: {},
	};
	const [gridState, setGridState] = useState(gridStateFresh);
	const resetGrid = () => {
		setGridState(gridStateFresh);
	};

	// Plot Page Props

	return (
		<Router>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/" element={<Layout />}>
					<Route
						index
						element={<Navigate to={localStorage.getItem("token") ? "/dashboard" : "/login"} />}
					/>
					<Route
						path="dashboard"
						element={
							<ProtectedRoute>
								<Dashboard
									state={dashboardState}
									setState={setDashboardState}
									reset={resetDashboard}
								/>
							</ProtectedRoute>
						}
					/>
					<Route
						path="datatable"
						element={
							<ProtectedRoute>
								<Datatable state={tableState} setState={setTableState} reset={resetTable} />
							</ProtectedRoute>
						}
					/>
					<Route
						path="datagrid"
						element={
							<ProtectedRoute>
								<Datagrid state={gridState} setState={setGridState} reset={resetGrid} />
							</ProtectedRoute>
						}
					/>
					<Route path="plot" element={<Plot />} />
				</Route>
			</Routes>
		</Router>
	);
}
