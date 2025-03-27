import { useState, useEffect } from "react";
import Panel from "@components/datatable/Panel";
import Grid from "@components/datagrid/Grid";
import Header from "../components/datagrid/Header";
import { BASE_URL } from "@components/utils.js";
import axios from "axios";

export default function Datagrid({ state, setState, reset }) {
	const token = localStorage.getItem("token");
	const [data, setData] = useState({ grid: [], headers: [] });
	const [analytics, setAnalytics] = useState([]);
	const setStateKey = (key) => (valOrUpdater) => {
		setState((prevState) => ({
			...prevState,
			[key]: typeof valOrUpdater === "function" ? valOrUpdater(prevState[key]) : valOrUpdater,
		}));
	};

	useEffect(() => {
		async function fetchData() {
			try {
				const params = new URLSearchParams({ hide: state.hide ? "1" : "0" });

				if (state.show.length > 0) {
					params.append("show", JSON.stringify(state.show));
				}

				// Object.entries(state.filter).forEach(([key, values]) => {
				// 	if (values.length > 0) {
				// 		params.append(key, JSON.stringify(values));
				// 	}
				// });

				if (state.filter.size > 0) {
					for (let [key, values] of state.filter) {
						// queryStr += `&${key}=${JSON.stringify(values)}`;
						params.append(key, JSON.stringify(values));
					}
				}

				const [dataResponse, analyticsResponse] = await Promise.all([
					axios.get(`${BASE_URL}/datagrid?${params.toString()}`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
					axios.get(`${BASE_URL}/analytics/datagrid`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
				]);

				if (dataResponse.status != 200 || analyticsResponse.status != 200) {
					console.error("Server error:", dataResponse, analyticsResponse);
					return;
				}

				// const [dataResult, analyticsResult] = await Promise.all([
				// 	dataResponse.json(),
				// 	analyticsResponse.json(),
				// ]);

				setData(dataResponse.data);
				setAnalytics(analyticsResponse.data);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		}

		fetchData();
	}, [state.filter, state.show, state.hide]);

	return (
		<div className="flex flex-col h-screen">
			<div className="flex-shrink-0">
				<Header reset={reset} />
			</div>
			<div className="flex flex-grow overflow-x-auto">
				<Panel
					state={{ hide: state.hide, filter: state.filter, open: state.open }}
					setState={(key, val) => setStateKey(key)(val)}
					data={analytics}

					// setSelectedFilter={setSelectedFilter}
					// selectedFilter={selectedFilter}
					// hideSingleEntries={hideSingleEntries}
					// setHideSingleEntries={setHideSingleEntries}
				/>
				<Grid
					state={{ openPi: state.openPi, openProject: state.openProject, show: state.show }}
					setState={(key, val) => setStateKey(key)(val)}
					data={data}
					// gridHeaders={gridHeaders}

					// setShowProject={setShowProject}
					// openPi={openPi}
					// setOpenPi={setOpenPi}
					// openProject={openProject}
					// setOpenProject={setOpenProject}
					// headers={headers}
					// properties={properties}
				/>
			</div>
		</div>
	);
}
