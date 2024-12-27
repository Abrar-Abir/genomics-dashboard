import { useState, useEffect, useRef } from "react";
import FilterPanel from "@components/database/FilterPanel";
import AccordionTable from "@components/database/AccordionTable";
import Grid from "@components/database/Grid"
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(50);
  const [filterPanelData, setFilterPanelData] = useState(null);
  const [columnToSort, setColumnToSort] = useState(-1);
  const [tableHeaders, setTableHeaders] = useState([]);
  
  const prevState = useRef({'sortedColumns':sortedColumns, 'page':page, 'limit':limit});

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
		//   if (Object.keys(selectedRanges).length > 0) {
		// 	Object.entries(selectedRanges).forEach(([key, [ start, end ]]) => {
		// 		if (start !== ""){apiUrl += `&${key}>=${start}`;}
		// 		if (end !== ""){apiUrl += `&${key}<=${end}`;}
		// 		})
		// 	;
		// }
          const dataResponse = await fetch(apiUrl);

          if (!dataResponse.ok) {
            console.error("Server error:", dataResponse);
          } else {
            const dataResult = await dataResponse.json();
            // setData(Array.isArray(dataResult.data) ? dataResult.data : []);
			setData(dataResult.data);
			setTableHeaders(Array.isArray(dataResult.columns) ? dataResult.columns : []);
            await delay(5);
			if ((prevState.current.page === page && prevState.current.limit === limit && prevState.current.sortedColumns === sortedColumns) || filterPanelData === null){
				prevState.current.sortedColumns = sortedColumns;
				prevState.current.page = page;
				prevState.current.limit = limit;
				const filterPanelResponse = await fetch(`${baseURL}/analytics`);
				if (!filterPanelResponse.ok) {
				console.error("Server error:", filterPanelResponse);
				} else {
				const filterPanelResult = await filterPanelResponse.json();
				setFilterPanelData(filterPanelResult);
				}
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
