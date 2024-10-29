import { useState, useEffect } from "react";
import FilterPanel from "@components/database/FilterPanel";
import { useOutletContext } from "react-router-dom";

export default function Database() {
  const { databaseFilterButton } = useOutletContext();

  const baseURL =
    process.env.NODE_ENV === "production"
      ? "http://172.32.79.51:5001"
      : "http://127.0.0.1:5001";


  const [filterPanelData, setFilterPanelData] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState({});
  const [selectedRanges, setSelectedRanges] = useState({});
  const [htmlContent, setHtmlContent] = useState('');
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


  useEffect(() => {
      async function fetchDataAndFilterPanelData() {
		  let apiUrl = `${baseURL}/plot?`;

          if (Object.keys(selectedFilter).length > 0) {
            Object.entries(selectedFilter).forEach(([key, values]) => {
			  apiUrl += `&${key}=${JSON.stringify(values)}`;
		});
          }
		  if (Object.keys(selectedRanges).length > 0) {
			Object.entries(selectedRanges).forEach(([key, [ start, end ]]) => {
				if (start !== ""){apiUrl += `&${key}>=${start}`;}
				if (end !== ""){apiUrl += `&${key}<=${end}`;}
				})
			;
		  }
        
		  try {
			const filterPanelResponse = await fetch(`${baseURL}/analytics`);
			if (!filterPanelResponse.ok) {
				console.error("Server error:", filterPanelResponse);
			} else {
				const filterPanelResult = await filterPanelResponse.json();
				setFilterPanelData(filterPanelResult);
		
				await delay(5);
		
				const response = await fetch(apiUrl);
				if (response.ok) {
					const plotData = await response.json();
					setHtmlContent(plotData.html);
				} else {
					console.error('Error fetching plot data:', response);
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
      {/* <FilterPanel
        data={filterPanelData}
        databaseFilterButton={databaseFilterButton}
		setSelectedFilter={setSelectedFilter}
		setSelectedRanges={setSelectedRanges}
      /> */}
	<div style={{ flex: 1, overflow: 'auto' }}>
		<div
			style={{ width: '100%', height: '100%', overflow: 'auto' }}
			dangerouslySetInnerHTML={{ __html: htmlContent }}
		/>
	</div>
      
    </div>
  );
}