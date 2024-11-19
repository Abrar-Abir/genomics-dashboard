import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import schema from "@lib/schema.json";
function Layout() {
  const location = useLocation();

  // for toggling expand/collapse the main sidebar on the left
  const [openSideBar, setOpenSideBar] = useState(false);
  const toggleSideBar = () => {
    setOpenSideBar(!openSideBar);
  };

  // for the date range picker
  const [dateRange, setDateRange] = useState({
    startDate: new Date("2000-01-01"),
    endDate: new Date(),
  });
  const handleDateRangeChange = (newDateRange) => {
    console.log("newDateRange:", newDateRange);
    setDateRange(newDateRange);
  };


const binaryString = Object.keys(schema.table).map((table) =>
  Object.keys(schema.table[table].entity).map((column) =>
    schema.table[table].entity[column].view === true ? '1' : '0'
  ).join('')
).join('');

  const [searchKey, setSearchKey] = useState("Search");
  const [searchValue, setSearchValue] = useState('');
  const [selectedFilter, setSelectedFilter] = useState({});
  const [selectedRanges, setSelectedRanges] = useState({});
  const [selectedItems, setSelectedItems] = useState({});
  const [selectedColumns, setSelectedColumns] = useState(binaryString);


  useEffect(() => {
    // Reset dateRange when the route changes
    setDateRange({
      startDate: new Date("2000-01-01"),
      endDate: new Date(),
    });
  }, [location]);
  return (
    <div className="h-screen w-screen overflow-hidden flex">
      <Sidebar openSideBar={openSideBar} toggleSideBar={toggleSideBar} />
      <div className="flex flex-col flex-1 overflow-scroll">
        <Header
          openSideBar={openSideBar}
          toggleSideBar={toggleSideBar}
          dateRange={dateRange}
          handleDateRangeChange={handleDateRangeChange}
		  searchKey={searchKey}
		  setSearchKey={setSearchKey}
		  setSearchValue={setSearchValue}
		  setSelectedFilter={setSelectedFilter}
		  setSelectedRanges={setSelectedRanges}
		  setSelectedItems={setSelectedItems}
		  selectedColumns={selectedColumns}
		  setSelectedColumns={setSelectedColumns}
        />
        <div className="flex-1 min-h-0 w-full bg-gray-300/80 z-0 overflow-x-hidden">
          <Outlet
            context={{
              dateRange,
			  searchKey,
			  searchValue,
			  selectedFilter,
			  setSelectedFilter,
			  selectedRanges,
			  setSelectedRanges,
			  selectedItems,
			  setSelectedItems,
			  selectedColumns
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Layout;
