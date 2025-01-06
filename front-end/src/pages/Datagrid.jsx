import { useState, useEffect } from "react";
import FilterGrid from "@components/datagrid/FilterGrid";
import Grid from "@components/datagrid/Grid";
import { useOutletContext } from "react-router-dom";
import DatagridHeader from "../components/datagrid/DatagridHeader";

export default function Database() {
	const [selectedFilter, setSelectedFilter] = useState({});
	const [showProject, setShowProject] = useState([]);
	const { baseURL } = useOutletContext();
	const [data, setData] = useState([]);
	const [filterPanelData, setFilterPanelData] = useState(null);
	const [tableHeaders, setTableHeaders] = useState([]);

	const reset = () => {
		setSelectedFilter({});
	};

	const handleExport = (format) => {
		window.location.href = `${baseURL}/export/datagrid/${format}`;
	};

	useEffect(() => {
		console.log(showProject);
		async function fetchData() {
			try {
				let apiUrl = `${baseURL}/datagrid?`;
				if (showProject.length > 0) {
					apiUrl += `show=${JSON.stringify(showProject)}&`;
				}
				if (Object.keys(selectedFilter).length > 0) {
					Object.entries(selectedFilter).forEach(([key, values]) => {
						if (values.length > 0) {
							apiUrl += `${key}=${JSON.stringify(values)}&`;
						}
					});
				}
				const dataResponse = await fetch(apiUrl.slice(0, -1));

				if (!dataResponse.ok) {
					console.error("Server error:", dataResponse);
				} else {
					const dataResult = await dataResponse.json();
					setData(dataResult.data);
					setTableHeaders(Array.isArray(dataResult.columns) ? dataResult.columns : []);
					if (filterPanelData === null) {
						const filterPanelResponse = await fetch(`${baseURL}/analytics/datagrid`);
						if (!filterPanelResponse.ok) {
							console.error("Server error:", filterPanelResponse);
						} else {
							const filterPanelResult = await filterPanelResponse.json();
							setFilterPanelData(filterPanelResult);
						}
					}
					// setFilterPanelData(dataResult.analytics);
					// console.log(dataResult.analytics);
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		}

		fetchData();
	}, [selectedFilter, showProject]);

	return (
		<div className="flex flex-col h-screen">
			<div className="flex-shrink-0">
				<DatagridHeader reset={reset} baseURL={baseURL} handleExport={handleExport} />
			</div>
			<div className="flex flex-grow overflow-x-auto">
				<FilterGrid
					data={filterPanelData}
					setSelectedFilter={setSelectedFilter}
					selectedFilter={selectedFilter}
				/>
				<Grid data={data} tableHeaders={tableHeaders} setShowProject={setShowProject} />
			</div>
		</div>
	);
}
