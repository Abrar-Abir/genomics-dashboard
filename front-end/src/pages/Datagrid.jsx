import { useState, useEffect } from "react";
import FilterGrid from "@components/datagrid/FilterGrid";
import Grid from "@components/datagrid/Grid";
import { useOutletContext } from "react-router-dom";
import DatagridHeader from "../components/datagrid/DatagridHeader";

export default function Database() {
	const [selectedFilter, setSelectedFilter] = useState({});

	const { baseURL } = useOutletContext();
	const [data, setData] = useState([]);
	const [filterPanelData, setFilterPanelData] = useState(null);
	const [tableHeaders, setTableHeaders] = useState([]);

	const reset = () => {
		setFilterPanelData(null);
	};

	useEffect(() => {
		async function fetchData() {
			try {
				let apiUrl = `${baseURL}/datagrid`;
				const dataResponse = await fetch(apiUrl);

				if (!dataResponse.ok) {
					console.error("Server error:", dataResponse);
				} else {
					const dataResult = await dataResponse.json();
					setData(dataResult.data);
					setTableHeaders(
						Array.isArray(dataResult.columns)
							? dataResult.columns
							: []
					);
					setFilterPanelData(dataResult.analytics);
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		}

		fetchData();
	}, [selectedFilter]);

	return (
		// <div className="flex h-screen-minus-header">
		// 	<FilterGrid
		// 		data={filterPanelData}
		// 		setSelectedFilter={setSelectedFilter}
		// 		selectedFilter={selectedFilter}
		// 	/>
		// 	<Grid data={data} tableHeaders={tableHeaders} />
		// </div>
		<div className="flex flex-col h-screen">
			<div className="flex-shrink-0">
				<DatagridHeader reset={reset} baseURL={baseURL} />
			</div>
			<div className="flex flex-grow overflow-y-hidden overflow-x-auto">
				<FilterGrid
					data={filterPanelData}
					setSelectedFilter={setSelectedFilter}
					selectedFilter={selectedFilter}
				/>
				<Grid data={data} tableHeaders={tableHeaders} />
			</div>
		</div>
	);
}
