import { useState, useEffect } from "react";
import Panel from "@components/datatable/Panel";
import Grid from "@components/datagrid/Grid";
import Header from "../components/datagrid/Header";
import { secureFetch } from "../lib/authService";

export default function Datagrid({ state, setState, reset }) {
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

				const [data, analytics] = await Promise.all([
					secureFetch(`/datagrid?${params.toString()}`),
					secureFetch(`analytics/datagrid`),
				]);

				setData(data);
				setAnalytics(analytics);
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
