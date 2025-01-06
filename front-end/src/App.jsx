import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "./components/shared/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Database from "./pages/Database";
import Plot from "./pages/Plot";
import Datagrid from "./pages/Datagrid";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="login" element={<Login />} />
				<Route path="/" element={<Layout />}>
					<Route index element={<Dashboard />} />
					<Route path="database" element={<Database />} />
					<Route path="datagrid" element={<Datagrid />} />
					<Route path="plot" element={<Database />} />
				</Route>
			</Routes>
		</Router>
	);
}

export default App;
