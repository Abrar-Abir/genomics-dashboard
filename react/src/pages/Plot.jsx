import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import FilterPanel from "@components/database/FilterPanel";

export default function Plot({
	selectedFilter,
	setSelectedFilter,
	selectedRanges,
	setSelectedRanges,
	filterPanelData,
	setFilterPanelData,
	openAcc,
	setOpenAcc,
}) {
	const baseURL =
		process.env.NODE_ENV === "production" ? "http://localhost:5001" : "http://localhost:5001";

	const [htmlContent, setHtmlContent] = useState("");
	const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

	useEffect(() => {
		async function fetchDataAndFilterPanelData() {
			let apiUrl = `${baseURL}/plot?`;
			console.log(selectedFilter, selectedRanges);
			if (Object.keys(selectedFilter).length > 0) {
				Object.entries(selectedFilter).forEach(([key, values]) => {
					if (values.length > 0) {
						apiUrl += `&${key}=${JSON.stringify(values)}`;
					}
				});
			}
			if (Object.keys(selectedRanges).length > 0) {
				Object.entries(selectedRanges).forEach(([key, [start, end]]) => {
					if (start !== "") {
						apiUrl += `&${key}>=${start}`;
					}
					if (end !== "") {
						apiUrl += `&${key}<=${end}`;
					}
				});
			}

			try {
				const filterPanelResponse = await fetch(`${baseURL}/analytics/database`);
				if (!filterPanelResponse.ok) {
					console.error("Server error:", filterPanelResponse);
				} else {
					const filterPanelResult = await filterPanelResponse.json();
					setFilterPanelData(filterPanelResult);
					console.log(filterPanelResult);
					await delay(5);

					const response = await fetch(apiUrl);
					if (response.ok) {
						const plotData = await response.json();
						setHtmlContent(plotData.html);
					} else {
						console.error("Error fetching plot data:", response);
					}
				}
			} catch (error) {
				console.error("Error fetching data or filter panel data:", error);
			}
		}
		fetchDataAndFilterPanelData();
	}, [selectedFilter, selectedRanges]);

	return (
		<div className="flex h-screen-minus-header">
			<FilterPanel
				data={filterPanelData}
				setSelectedFilter={setSelectedFilter}
				selectedFilter={selectedFilter}
				setSelectedRanges={setSelectedRanges}
				openAcc={openAcc}
				setOpenAcc={setOpenAcc}
				baseURL={baseURL}
			/>
			<div style={{ flex: 1, overflow: "auto" }}>
				<div
					style={{ width: "100%", height: "100%", overflow: "auto" }}
					dangerouslySetInnerHTML={{ __html: htmlContent }}
				/>
			</div>
		</div>
	);
}
