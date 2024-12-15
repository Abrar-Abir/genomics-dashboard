import { useState, useEffect } from "react";
import FilterPanel from "@components/database/FilterPanel";
import DataTable from "@components/database/DataTable";
import config, { sampleData0 } from "@lib/dashboardConfig.cjs";
import schema from "@lib/schema.json";
import { useOutletContext } from "react-router-dom";

export default function Database() {
  const {selectedFilter} = useOutletContext();
  const {setSelectedFilter} = useOutletContext();
  const {selectedRanges} = useOutletContext();
  const {setSelectedRanges} = useOutletContext();
  const {searchKey} = useOutletContext();
  const {searchValue} = useOutletContext();
  const {selectedItems} = useOutletContext();
  const {setSelectedItems} = useOutletContext();
  const {selectedColumns} = useOutletContext();

//   const tableHeaders = Object.keys(schema.table).flatMap((table) =>
//     Object.keys(schema.table[table].entity).map((key) => ({
//       head: key,
//     }))
//   );

  const baseURL =
    process.env.NODE_ENV === "production"
    //   ? "http://172.32.79.51:5001"
	  ? "https://genomics-dashboard-flask.onrender.com"
      : "http://localhost:5001";

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(50);
  const [filterPanelData, setFilterPanelData] = useState(null);
  const [columns, setColumns] = useState([]);

//   const filterColumns = () => {
//     return tableHeaders.filter((column, index) => selectedColumns[index] === '1');
//   };

  useEffect(() => {
    if (config.useSampleData) {
      setData(sampleData0);
    } else {
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      async function fetchDataAndFilterPanelData() {
        try {
          const offset = (page - 1) * limit;
		  let apiUrl = `${baseURL}/type0?cols=${selectedColumns}&limit=${limit}&offset=${offset}`;
		  if (searchValue !== ""){
			apiUrl += `&search=(${searchKey},${searchValue})`
		  }

          if (Object.keys(selectedFilter).length > 0) {
            Object.entries(selectedFilter).forEach(([key, values]) => {
			  if (values.length > 0){
				apiUrl += `&${key}=${JSON.stringify(values)}`;
			  }
		});
          }
		  if (Object.keys(selectedRanges).length > 0) {
			Object.entries(selectedRanges).forEach(([key, [ start, end ]]) => {
				if (start !== ""){apiUrl += `&${key}>=${start}`;}
				if (end !== ""){apiUrl += `&${key}<=${end}`;}
				})
			;
		}
          const dataResponse = await fetch(apiUrl);

          if (!dataResponse.ok) {
            console.error("Server error:", dataResponse);
          } else {
            const dataResult = await dataResponse.json();
            setData(Array.isArray(dataResult.data) ? dataResult.data : []);
			setColumns(Array.isArray(dataResult.columns) ? dataResult.columns : [])
            setTotalCount(dataResult.total_count);
			const totalCount = dataResult.total_count;
            setTotalPages(Math.ceil(totalCount / limit));
			// setColumns(filterColumns());
			// console.log(columns);
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
          console.error("Error fetching data or filter panel data:", error);
        }
      }

      fetchDataAndFilterPanelData();
    }
  }, [page, limit, config.useSampleData, selectedFilter, selectedRanges, searchValue, selectedColumns]);


  const handlePrev = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNext = () => {
    setPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handleLimit = (number) => {
    setLimit(number);
    setPage(1);
    console.log(number);
  };


  return (
    <div className="flex h-screen-minus-header">
      <FilterPanel
        data={filterPanelData}
		setSelectedFilter={setSelectedFilter}
		setSelectedRanges={setSelectedRanges}
		selectedItems={selectedItems}
		setSelectedItems={setSelectedItems}
      />
	  <DataTable
	  data={data}
	  tableHeaders={columns}
	  handlePrev={handlePrev}
	  handleNext={handleNext}
	  totalPages={totalPages}
	  totalCount={totalCount}
	  page={page}
	  limit={limit}
	  handleLimit={handleLimit}
	/>
    </div>
  );
}
