import { useState, useEffect } from "react";
import FilterGrid from "@components/datagrid/FilterGrid";
import Grid from "@components/datagrid/Grid";
import { useOutletContext } from "react-router-dom";
import DatagridHeader from "../components/datagrid/DatagridHeader";

export default function Datagrid({
	selectedFilter,
	setSelectedFilter,
	filterPanelData,
	setFilterPanelData,
	showProject,
	setShowProject,
	data,
	setData,
	tableHeaders,
	setTableHeaders,
	openPi,
	setOpenPi,
	openProject,
	setOpenProject,
	hideSingleEntries,
	setHideSingleEntries,
	reset,
}) {
	const { baseURL } = useOutletContext();

	const handleExport = (format) => {
		window.location.href = `${baseURL}/export/datagrid/${format}`;
	};

	useEffect(() => {
		const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
		async function fetchData() {
			try {
				let apiUrl = `${baseURL}/datagrid?hide=${hideSingleEntries ? "1" : "0"}`;
				if (showProject.length > 0) {
					apiUrl += `&show=${JSON.stringify(showProject)}`;
				}
				if (Object.keys(selectedFilter).length > 0) {
					Object.entries(selectedFilter).forEach(([key, values]) => {
						if (values.length > 0) {
							apiUrl += `&${key}=${JSON.stringify(values)}`;
						}
					});
				}
				const dataResponse = await fetch(apiUrl);

				if (!dataResponse.ok) {
					console.error("Server error:", dataResponse);
				} else {
					await delay(5);
					const dataResult = await dataResponse.json();
					setData(dataResult.data);
					setTableHeaders(Array.isArray(dataResult.columns) ? dataResult.columns : []);
					const filterPanelResponse = await fetch(`${baseURL}/analytics/datagrid`);
					if (!filterPanelResponse.ok) {
						console.error("Server error:", filterPanelResponse);
					} else {
						const filterPanelResult = await filterPanelResponse.json();
						setFilterPanelData(filterPanelResult);
					}
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		}

		fetchData();
	}, [selectedFilter, showProject, hideSingleEntries]);

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
					hideSingleEntries={hideSingleEntries}
					setHideSingleEntries={setHideSingleEntries}
				/>
				<Grid
					data={data}
					tableHeaders={tableHeaders}
					setShowProject={setShowProject}
					openPi={openPi}
					setOpenPi={setOpenPi}
					openProject={openProject}
					setOpenProject={setOpenProject}
				/>
			</div>
		</div>
	);
}
