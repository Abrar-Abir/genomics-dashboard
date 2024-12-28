import { useState, useEffect, useRef } from "react";
import FilterPanel from "@components/database/FilterPanel";
import AccordionTable from "@components/database/AccordionTable";
// import Grid from "@components/database/Grid"
import { useOutletContext } from "react-router-dom";

export default function Database() {
  const {selectedFilter} = useOutletContext();
  const {setSelectedFilter} = useOutletContext();
  const {selectedRanges} = useOutletContext();
  const {setSelectedRanges} = useOutletContext();
  const {searchKey} = useOutletContext();
  const {searchValue} = useOutletContext();
  const {sortedColumns} = useOutletContext();


  const baseURL =
    process.env.NODE_ENV === "production"
      ? "http://172.32.79.51:5001"
	//   ? "https://genomics-dashboard-flask.onrender.com"
      : "http://localhost:5001";

  const [data, setData] = useState([]);
  const [filterPanelData, setFilterPanelData] = useState(null);
  const [tableHeaders, setTableHeaders] = useState([]);
  


  useEffect(() => {
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      async function fetchData() {
        try {
		  let apiUrl = `${baseURL}/datagrid`;
		//   if (columnToSort !== -1 && prevState.current.sortedColumns != sortedColumns){
		// 	apiUrl += `&sort=${columnToSort}`;
		//   }
		//   if (searchValue !== ""){
		// 	apiUrl += `&search=(${searchKey},${searchValue})`
		//   }

        //   if (Object.keys(selectedFilter).length > 0) {
        //     Object.entries(selectedFilter).forEach(([key, values]) => {
		// 	  if (values.length > 0){
		// 		apiUrl += `&${key}=${JSON.stringify(values)}`;
		// 	  }
		// });
        //   }
          const dataResponse = await fetch(apiUrl);

          if (!dataResponse.ok) {
            console.error("Server error:", dataResponse);
          } else {
            const dataResult = await dataResponse.json();
            // setData(Array.isArray(dataResult.data) ? dataResult.data : []);
			setData(dataResult.data);
			setTableHeaders(Array.isArray(dataResult.columns) ? dataResult.columns : []);
            await delay(5);
			const filterPanelResponse = await fetch(`${baseURL}/analytics`);
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
  }, [selectedFilter, selectedRanges, searchValue, sortedColumns]);


  return (
    <div className="flex h-screen-minus-header">
      <FilterPanel
        data={filterPanelData}
		setSelectedFilter={setSelectedFilter}
		setSelectedRanges={setSelectedRanges}
		selectedFilter={selectedFilter}
      />
	  {/* <Grid
	  data={data}
	  tableHeaders={tableHeaders}
	/> */}
	<AccordionTable 
	data={data}
	tableHeaders={tableHeaders}/>
    </div>
  );
}
